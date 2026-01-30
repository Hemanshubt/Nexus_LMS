"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSection = exports.updateSection = exports.createSection = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.createSection = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { title } = req.body;
    const { courseId } = req.params;
    if (!title) {
        return next(new appError_1.AppError('Section title is required', 400));
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
exports.updateSection = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
exports.deleteSection = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { id } = req.params;
    await prisma.section.delete({
        where: { id }
    });
    res.status(204).json({
        status: 'success',
        data: null
    });
});
