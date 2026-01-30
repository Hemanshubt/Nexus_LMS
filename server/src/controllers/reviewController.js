"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.getCourseReviews = exports.createReview = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.createReview = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
        return next(new appError_1.AppError('You must be enrolled in this course to leave a review.', 403));
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
exports.getCourseReviews = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
exports.deleteReview = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review)
        return next(new appError_1.AppError('No review found', 404));
    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new appError_1.AppError('Not authorized', 403));
    }
    await prisma.review.delete({ where: { id } });
    res.status(204).json({
        status: 'success',
        data: null
    });
});
