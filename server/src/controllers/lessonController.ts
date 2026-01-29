import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createLesson = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { title, sectionId } = req.body;
    // courseId might be in params if nested, but sectionId is key

    if (!title || !sectionId) {
        return next(new AppError('Lesson title and sectionId are required', 400));
    }

    const lastLesson = await prisma.lesson.findFirst({
        where: { sectionId },
        orderBy: { order: 'desc' },
    });

    const order = lastLesson ? lastLesson.order + 1 : 1;

    const newLesson = await prisma.lesson.create({
        data: {
            title,
            sectionId,
            order,
            type: 'VIDEO', // Default
        },
    });

    res.status(201).json({
        status: 'success',
        data: {
            lesson: newLesson,
        },
    });
});

export const updateLesson = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, videoUrl, content, duration, type } = req.body;

    const lesson = await prisma.lesson.update({
        where: { id },
        data: {
            title,
            videoUrl,
            content,
            duration,
            type
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            lesson
        }
    });
});

export const deleteLesson = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await prisma.lesson.delete({
        where: { id }
    });

    res.status(204).json({
        status: 'success',
        data: null
    });
});
