"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.getAllUsers = exports.updateMe = exports.getMe = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el))
            newObj[el] = obj[el];
    });
    return newObj;
};
exports.getMe = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
exports.updateMe = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new appError_1.AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
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
exports.getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users }
    });
});
exports.getUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id }
    });
    if (!user)
        return next(new appError_1.AppError('No user found with that ID', 404));
    res.status(200).json({
        status: 'success',
        data: { user }
    });
});
exports.updateUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const updatedUser = await prisma.user.update({
        where: { id: req.params.id },
        data: req.body
    });
    res.status(200).json({
        status: 'success',
        data: { user: updatedUser }
    });
});
exports.deleteUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    await prisma.user.delete({
        where: { id: req.params.id }
    });
    res.status(204).json({
        status: 'success',
        data: null
    });
});
