import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JwtPayload {
    id: string;
}

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!currentUser) {
        return next(new AppError('The user belonging to this token no longer does exist.', 401));
    }

    req.user = currentUser;
    next();
});

export const optionalProtect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (currentUser) {
            req.user = currentUser;
        }
    } catch (err) {
        // Token invalid - ignore
    }

    next();
});

export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
