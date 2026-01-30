import { Request, Response, NextFunction } from 'express';
import { PrismaClient, NotificationType } from '@prisma/client';
import { AppError } from '../utils/appError';

const prisma = new PrismaClient();

// Get all notifications for the current user
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
        next(error);
    }
};

// Get unread notification count
export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        const count = await prisma.notification.count({
            where: { userId, isRead: false }
        });

        res.status(200).json({
            status: 'success',
            data: { count }
        });
    } catch (error) {
        next(error);
    }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });

        if (!notification) {
            return next(new AppError('Notification not found', 404));
        }

        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        res.status(200).json({
            status: 'success',
            message: 'Notification marked as read'
        });
    } catch (error) {
        next(error);
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
        next(error);
    }
};

// Delete a notification
export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });

        if (!notification) {
            return next(new AppError('Notification not found', 404));
        }

        await prisma.notification.delete({ where: { id } });

        res.status(200).json({
            status: 'success',
            message: 'Notification deleted'
        });
    } catch (error) {
        next(error);
    }
};

// Delete all read notifications
export const deleteAllRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        await prisma.notification.deleteMany({
            where: { userId, isRead: true }
        });

        res.status(200).json({
            status: 'success',
            message: 'All read notifications deleted'
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────
// Helper function to create notifications
// ─────────────────────────────────────────
export const createNotification = async (
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
) => {
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
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Send notification to multiple users
export const sendBulkNotification = async (
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    link?: string
) => {
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
    } catch (error) {
        console.error('Error sending bulk notifications:', error);
    }
};
