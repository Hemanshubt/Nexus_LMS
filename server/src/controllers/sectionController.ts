import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { title } = req.body;
    const { courseId } = req.params;

    if (!title) {
        return next(new AppError('Section title is required', 400));
    }

    // Find the highest order currently
    const lastSection = await prisma.section.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' },
    });

    const order = lastSection ? lastSection.order + 1 : 1;

    const newSection = await prisma.section.create({
        data: {
            title,
            courseId,
            order,
        },
    });

    res.status(201).json({
        status: 'success',
        data: {
            section: newSection,
        },
    });
});

export const updateSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, order } = req.body;

    const section = await prisma.section.update({
        where: { id },
        data: { title, order }
    });

    res.status(200).json({
        status: 'success',
        data: {
            section
        }
    });
});

export const deleteSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await prisma.section.delete({
        where: { id }
    });

    res.status(204).json({
        status: 'success',
        data: null
    });
});
