import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getInstructorAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const instructorId = req.user.id;

    // 1. Get all courses by instructor
    const courses = await prisma.course.findMany({
        where: { instructorId },
        include: {
            _count: {
                select: { enrollments: true }
            }
        }
    });

    // 2. Calculate Stats
    let totalStudents = 0;
    let totalRevenue = 0;

    courses.forEach(course => {
        totalStudents += course._count.enrollments;
        totalRevenue += course._count.enrollments * course.price;
    });

    const totalCourses = courses.length;

    // 3. Get Recent Enrollments
    const recentEnrollments = await prisma.enrollment.findMany({
        where: {
            course: {
                instructorId
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 5,
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    avatar: true
                }
            },
            course: {
                select: {
                    title: true,
                    price: true
                }
            }
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            stats: {
                totalCourses,
                totalStudents,
                totalRevenue
            },
            recentEnrollments
        }
    });
});
