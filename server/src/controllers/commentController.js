"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.getLessonComments = exports.createComment = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.createComment = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
exports.getLessonComments = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
exports.deleteComment = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const comment = await prisma.comment.findUnique({
        where: { id: req.params.id }
    });
    if (!comment)
        return next(new appError_1.AppError('No comment found', 404));
    // Only owner or admin or instructor of the course can delete
    // For simplicity, checking owner or admin now
    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new appError_1.AppError('Unauthorized', 403));
    }
    await prisma.comment.delete({
        where: { id: req.params.id }
    });
    res.status(204).json({
        status: 'success',
        data: null
    });
});
