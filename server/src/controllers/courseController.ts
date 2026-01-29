import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllCourses = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { search, category, all } = req.query;

    const where: any = {};

    // By default, only show published courses
    // Unless requested by an admin with 'all=true'
    if (all === 'true' && req.user?.role === 'ADMIN') {
        // Show everything
    } else {
        where.published = true;
    }

    if (search) {
        where.OR = [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } }
        ];
    }

    if (category && category !== 'All') {
        where.categories = {
            some: {
                name: category as string
            }
        };
    }

    const courses = await prisma.course.findMany({
        where,
        include: {
            instructor: {
                select: { name: true, avatar: true }
            },
            reviews: {
                select: { rating: true }
            },
            categories: true
        },
        orderBy: { createdAt: 'desc' }
    });

    const coursesWithRating = courses.map(course => {
        const totalReviews = course.reviews.length;
        const avgRating = totalReviews > 0
            ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
            : 0;

        const { reviews, ...courseData } = course;
        return {
            ...courseData,
            avgRating,
            totalReviews
        }
    });

    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: {
            courses: coursesWithRating
        }
    });
});

export const getCourse = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            instructor: {
                select: { name: true, avatar: true, bio: true }
            },
            sections: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: {
                        orderBy: { order: 'asc' },
                        include: { assignment: true }
                    }
                }
            },
            reviews: true,
            categories: true
        }
    });

    if (!course) {
        return next(new AppError('No course found with that ID', 404));
    }

    const totalReviews = course.reviews.length;
    const avgRating = totalReviews > 0
        ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        : 0;

    res.status(200).json({
        status: 'success',
        data: {
            course: {
                ...course,
                avgRating,
                totalReviews
            }
        }
    });
});

export const createCourse = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, price, thumbnail, category } = req.body;

    const newCourse = await prisma.course.create({
        data: {
            title,
            description,
            price: price ? parseFloat(price) : 0,
            thumbnail,
            instructorId: req.user.id,
            ...(category && {
                categories: {
                    connectOrCreate: {
                        where: { name: category },
                        create: { name: category }
                    }
                }
            })
        }
    });

    res.status(201).json({
        status: 'success',
        data: {
            course: newCourse
        }
    });
});

export const updateCourse = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Check if instructor owns the course
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return next(new AppError('No course found', 404));

    if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new AppError('You do not own this course', 403));
    }

    const data = { ...req.body };
    if (data.price) data.price = parseFloat(data.price.toString());

    const updatedCourse = await prisma.course.update({
        where: { id },
        data
    });

    res.status(200).json({
        status: 'success',
        data: {
            course: updatedCourse
        }
    });
});

export const getCoursesTeaching = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const courses = await prisma.course.findMany({
        where: { instructorId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { enrollments: true }
            }
        }
    });

    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: {
            courses
        }
    });
});
