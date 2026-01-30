"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBulkNotification = exports.createNotification = exports.deleteAllRead = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getUnreadCount = exports.getNotifications = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../utils/appError");
const prisma = new client_1.PrismaClient();
// Get all notifications for the current user
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            userId,
            ...(unreadOnly === 'true' && { isRead: false })
        };
        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { userId, isRead: false } })
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                notifications,
                unreadCount,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getNotifications = getNotifications;
// Get unread notification count
const getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const count = await prisma.notification.count({
            where: { userId, isRead: false }
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
exports.getUnreadCount = getUnreadCount;
// Mark notification as read
const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });
        if (!notification) {
            return next(new appError_1.AppError('Notification not found', 404));
        }
        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        res.status(200).json({
            status: 'success',
            message: 'Notification marked as read'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markAsRead = markAsRead;
// Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
        res.status(200).json({
            status: 'success',
            message: 'All notifications marked as read'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markAllAsRead = markAllAsRead;
// Delete a notification
const deleteNotification = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });
        if (!notification) {
            return next(new appError_1.AppError('Notification not found', 404));
        }
        await prisma.notification.delete({ where: { id } });
        res.status(200).json({
            status: 'success',
            message: 'Notification deleted'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteNotification = deleteNotification;
// Delete all read notifications
const deleteAllRead = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        await prisma.notification.deleteMany({
            where: { userId, isRead: true }
        });
        res.status(200).json({
            status: 'success',
            message: 'All read notifications deleted'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAllRead = deleteAllRead;
// ─────────────────────────────────────────
// Helper function to create notifications
// ─────────────────────────────────────────
const createNotification = async (userId, type, title, message, link) => {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link
            }
        });
    }
    catch (error) {
        console.error('Error creating notification:', error);
    }
};
exports.createNotification = createNotification;
// Send notification to multiple users
const sendBulkNotification = async (userIds, type, title, message, link) => {
    try {
        await prisma.notification.createMany({
            data: userIds.map(userId => ({
                userId,
                type,
                title,
                message,
                link
            }))
        });
    }
    catch (error) {
        console.error('Error sending bulk notifications:', error);
    }
};
exports.sendBulkNotification = sendBulkNotification;
