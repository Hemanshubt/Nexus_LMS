import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // 1. Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId
            }
        }
    });

    if (!enrollment) {
        return next(new AppError('You must be enrolled in this course to leave a review.', 403));
    }

    // 2. Check if user already reviewed
    const existingReview = await prisma.review.findFirst({
        where: { userId, courseId }
    });

    if (existingReview) {
        // Update instead of creating new? Or just error. Let's allow update.
        const updatedReview = await prisma.review.update({
            where: { id: existingReview.id },
            data: { rating, comment }
        });

        return res.status(200).json({
            status: 'success',
            data: { review: updatedReview }
        });
    }

    // 3. Create review
    const review = await prisma.review.create({
        data: {
            rating,
            comment,
            userId,
            courseId
        },
        include: {
            user: { select: { name: true, avatar: true } }
        }
    });

    res.status(201).json({
        status: 'success',
        data: { review }
    });
});

export const getCourseReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { courseId } = req.params;

    const reviews = await prisma.review.findMany({
        where: { courseId },
        include: {
            user: { select: { name: true, avatar: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: { reviews }
    });
});

export const deleteReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return next(new AppError('No review found', 404));

    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new AppError('Not authorized', 403));
    }

    await prisma.review.delete({ where: { id } });

    res.status(204).json({
        status: 'success',
        data: null
    });
});
