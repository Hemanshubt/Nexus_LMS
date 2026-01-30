"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = require("../utils/appError");
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    if (err instanceof zod_1.ZodError) {
        error = new appError_1.AppError('Validation Error', 400);
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
    }
    else {
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
};
exports.default = errorHandler;
