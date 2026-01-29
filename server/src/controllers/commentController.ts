import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createComment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { text, lessonId, parentId } = req.body;

    const comment = await prisma.comment.create({
        data: {
            text,
            userId: req.user.id,
            lessonId,
            parentId: parentId || null
        },
        include: {
            user: {
                select: { name: true, avatar: true, role: true }
            }
        }
    });

    res.status(201).json({
        status: 'success',
        data: { comment }
    });
});

export const getLessonComments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { lessonId } = req.params;

    const comments = await prisma.comment.findMany({
        where: {
            lessonId,
            parentId: null // Get top-level comments first
        },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { name: true, avatar: true, role: true }
            },
            replies: {
                include: {
                    user: {
                        select: { name: true, avatar: true, role: true }
                    }
                },
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    res.status(200).json({
        status: 'success',
        results: comments.length,
        data: { comments }
    });
});

export const deleteComment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const comment = await prisma.comment.findUnique({
        where: { id: req.params.id }
    });

    if (!comment) return next(new AppError('No comment found', 404));

    // Only owner or admin or instructor of the course can delete
    // For simplicity, checking owner or admin now
    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new AppError('Unauthorized', 403));
    }

    await prisma.comment.delete({
        where: { id: req.params.id }
    });

    res.status(204).json({
        status: 'success',
        data: null
    });
});
