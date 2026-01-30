"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLesson = exports.updateLesson = exports.createLesson = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.createLesson = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { title, sectionId } = req.body;
    // courseId might be in params if nested, but sectionId is key
    if (!title || !sectionId) {
        return next(new appError_1.AppError('Lesson title and sectionId are required', 400));
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
exports.updateLesson = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
exports.deleteLesson = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { id } = req.params;
    await prisma.lesson.delete({
        where: { id }
    });
    res.status(204).json({
        status: 'success',
        data: null
    });
});
