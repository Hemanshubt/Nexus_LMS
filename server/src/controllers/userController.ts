import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const filterObj = (obj: any, ...allowedFields: string[]) => {
    const newObj: any = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

export const updateMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }

    // 2) Filtered out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email', 'headline', 'bio', 'avatar');

    // 3) Update user document
    const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: filteredBody
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// Admin only
export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users }
    });
});

export const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id }
    });

    if (!user) return next(new AppError('No user found with that ID', 404));

    res.status(200).json({
        status: 'success',
        data: { user }
    });
});

export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const updatedUser = await prisma.user.update({
        where: { id: req.params.id },
        data: req.body
    });

    res.status(200).json({
        status: 'success',
        data: { user: updatedUser }
    });
});

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await prisma.user.delete({
        where: { id: req.params.id }
    });

    res.status(204).json({
        status: 'success',
        data: null
    });
});
