"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWishlistCount = exports.checkWishlist = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../utils/appError");
const prisma = new client_1.PrismaClient();
// Get user's wishlist
const getWishlist = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const wishlist = await prisma.wishlist.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        instructor: {
                            select: { id: true, name: true, avatar: true }
                        },
                        _count: {
                            select: { enrollments: true, reviews: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({
            status: 'success',
            data: { wishlist }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getWishlist = getWishlist;
// Add course to wishlist
const addToWishlist = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;
        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });
        if (!course) {
            return next(new appError_1.AppError('Course not found', 404));
        }
        // Check if already in wishlist
        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_courseId: { userId: userId, courseId }
            }
        });
        if (existing) {
            return next(new appError_1.AppError('Course already in wishlist', 400));
        }
        // Check if already enrolled
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId: userId, courseId }
            }
        });
        if (enrollment) {
            return next(new appError_1.AppError('You are already enrolled in this course', 400));
        }
        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId: userId,
                courseId
            },
            include: {
                course: true
            }
        });
        res.status(201).json({
            status: 'success',
            message: 'Course added to wishlist',
            data: { wishlistItem }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addToWishlist = addToWishlist;
// Remove course from wishlist
const removeFromWishlist = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;
        const wishlistItem = await prisma.wishlist.findUnique({
            where: {
                userId_courseId: { userId: userId, courseId }
            }
        });
        if (!wishlistItem) {
            return next(new appError_1.AppError('Course not in wishlist', 404));
        }
        await prisma.wishlist.delete({
            where: {
                userId_courseId: { userId: userId, courseId }
            }
        });
        res.status(200).json({
            status: 'success',
            message: 'Course removed from wishlist'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromWishlist = removeFromWishlist;
// Check if course is in wishlist
const checkWishlist = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;
        const wishlistItem = await prisma.wishlist.findUnique({
            where: {
                userId_courseId: { userId: userId, courseId }
            }
        });
        res.status(200).json({
            status: 'success',
            data: { isInWishlist: !!wishlistItem }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.checkWishlist = checkWishlist;
// Get wishlist count
const getWishlistCount = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const count = await prisma.wishlist.count({
            where: { userId }
        });
        res.status(200).json({
            status: 'success',
            data: { count }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getWishlistCount = getWishlistCount;
