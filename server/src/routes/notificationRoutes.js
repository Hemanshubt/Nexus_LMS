"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const notificationController_1 = require("../controllers/notificationController");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authMiddleware_1.protect);
// Get notifications
router.get('/', notificationController_1.getNotifications);
// Get unread count
router.get('/unread-count', notificationController_1.getUnreadCount);
// Mark all as read
router.patch('/mark-all-read', notificationController_1.markAllAsRead);
// Delete all read notifications
router.delete('/clear-read', notificationController_1.deleteAllRead);
// Mark single notification as read
router.patch('/:id/read', notificationController_1.markAsRead);
// Delete single notification
router.delete('/:id', notificationController_1.deleteNotification);
exports.default = router;
