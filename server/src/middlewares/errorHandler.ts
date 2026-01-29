import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { ZodError } from 'zod';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = { ...err };
    error.message = err.message;

    if (err instanceof ZodError) {
        error = new AppError('Validation Error', 400);
        // You might want to format Zod errors better in a real app
        return res.status(400).json({
            status: 'fail',
            message: 'Validation Error',
            errors: err.errors,
        });
    }

    // Prisma Errors can be handled here too

    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode || 500).json({
            status: err.status || 'error',
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }

    // Production
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
};

export default errorHandler;
