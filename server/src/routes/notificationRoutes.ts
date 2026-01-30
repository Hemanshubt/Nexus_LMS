import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
} from '../controllers/notificationController';

const router = Router();

// All routes require authentication
router.use(protect);

// Get notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.patch('/mark-all-read', markAllAsRead);

// Delete all read notifications
router.delete('/clear-read', deleteAllRead);

// Mark single notification as read
router.patch('/:id/read', markAsRead);

// Delete single notification
router.delete('/:id', deleteNotification);

export default router;
