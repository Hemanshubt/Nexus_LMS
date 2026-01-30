import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/appError';

const prisma = new PrismaClient();

// Get user's wishlist
export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        const wishlist = await prisma.wishlist.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        instructor: {
                            select: { id: true, name: true, avatar: true }
                        },
                        _count: {
                            select: { enrollments: true, reviews: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            status: 'success',
            data: { wishlist }
        });
    } catch (error) {
        next(error);
    }
};

// Add course to wishlist
export const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Check if already in wishlist
        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_courseId: { userId: userId!, courseId }
            }
        });

        if (existing) {
            return next(new AppError('Course already in wishlist', 400));
        }

        // Check if already enrolled
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId: userId!, courseId }
            }
        });

        if (enrollment) {
            return next(new AppError('You are already enrolled in this course', 400));
        }

        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId: userId!,
                courseId
            },
            include: {
                course: true
            }
        });

        res.status(201).json({
            status: 'success',
            message: 'Course added to wishlist',
            data: { wishlistItem }
        });
    } catch (error) {
        next(error);
    }
};

// Remove course from wishlist
export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;

        const wishlistItem = await prisma.wishlist.findUnique({
            where: {
                userId_courseId: { userId: userId!, courseId }
            }
        });

        if (!wishlistItem) {
            return next(new AppError('Course not in wishlist', 404));
        }

        await prisma.wishlist.delete({
            where: {
                userId_courseId: { userId: userId!, courseId }
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Course removed from wishlist'
        });
    } catch (error) {
        next(error);
    }
};

// Check if course is in wishlist
export const checkWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;

        const wishlistItem = await prisma.wishlist.findUnique({
            where: {
                userId_courseId: { userId: userId!, courseId }
            }
        });

        res.status(200).json({
            status: 'success',
            data: { isInWishlist: !!wishlistItem }
        });
    } catch (error) {
        next(error);
    }
};

// Get wishlist count
export const getWishlistCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        const count = await prisma.wishlist.count({
            where: { userId }
        });

        res.status(200).json({
            status: 'success',
            data: { count }
        });
    } catch (error) {
        next(error);
    }
};
