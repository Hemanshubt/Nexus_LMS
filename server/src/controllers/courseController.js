"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoursesTeaching = exports.updateCourse = exports.createCourse = exports.getCourse = exports.getAllCourses = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.getAllCourses = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { search, category, all, minPrice, maxPrice, sort = 'newest', page = 1, limit = 12, level, free } = req.query;
    const where = {};
    // By default, only show published courses
    // Unless requested by an admin with 'all=true'
    if (all === 'true' && req.user?.role === 'ADMIN') {
        // Show everything
    }
    else {
        where.published = true;
    }
    // Search filter
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }
    // Category filter
    if (category && category !== 'All') {
        where.categories = {
            some: {
                name: category
            }
        };
    }
    // Price filters
    if (free === 'true') {
        where.price = 0;
    }
    else {
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = parseFloat(minPrice);
            if (maxPrice)
                where.price.lte = parseFloat(maxPrice);
        }
    }
    // Sorting options
    let orderBy = { createdAt: 'desc' }; // default: newest
    switch (sort) {
        case 'oldest':
            orderBy = { createdAt: 'asc' };
            break;
        case 'price-low':
            orderBy = { price: 'asc' };
            break;
        case 'price-high':
            orderBy = { price: 'desc' };
            break;
        case 'popular':
            orderBy = { enrollments: { _count: 'desc' } };
            break;
        case 'rating':
            // Will sort in JS after fetching
            break;
    }
    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const [courses, total] = await Promise.all([
        prisma.course.findMany({
            where,
            include: {
                instructor: {
                    select: { name: true, avatar: true }
                },
                reviews: {
                    select: { rating: true }
                },
                categories: true,
                _count: {
                    select: { enrollments: true }
                }
            },
            orderBy,
            skip,
            take
        }),
        prisma.course.count({ where })
    ]);
    let coursesWithRating = courses.map(course => {
        const totalReviews = course.reviews.length;
        const avgRating = totalReviews > 0
            ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
            : 0;
        const { reviews, ...courseData } = course;
        return {
            ...courseData,
            avgRating,
            totalReviews,
            enrollmentCount: course._count.enrollments
        };
    });
    // Sort by rating if requested
    if (sort === 'rating') {
        coursesWithRating = coursesWithRating.sort((a, b) => b.avgRating - a.avgRating);
    }
    res.status(200).json({
        status: 'success',
        results: coursesWithRating.length,
        data: {
            courses: coursesWithRating,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
});
exports.getCourse = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
        return next(new appError_1.AppError('No course found with that ID', 404));
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
exports.createCourse = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
exports.updateCourse = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { id } = req.params;
    // Check if instructor owns the course
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course)
        return next(new appError_1.AppError('No course found', 404));
    if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new appError_1.AppError('You do not own this course', 403));
    }
    const data = { ...req.body };
    if (data.price)
        data.price = parseFloat(data.price.toString());
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
exports.getCoursesTeaching = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
