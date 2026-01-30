"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllRead = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getUnreadCount = exports.getNotifications = void 0;
const api_1 = require("./api");
// Get all notifications
const getNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
    const { data } = await api_1.api.get('/notifications', {
        params: { page, limit, unreadOnly }
    });
    return data.data;
};
exports.getNotifications = getNotifications;
// Get unread count
const getUnreadCount = async () => {
    const { data } = await api_1.api.get('/notifications/unread-count');
    return data.data.count;
};
exports.getUnreadCount = getUnreadCount;
// Mark as read
const markAsRead = async (id) => {
    await api_1.api.patch(`/notifications/${id}/read`);
};
exports.markAsRead = markAsRead;
// Mark all as read
const markAllAsRead = async () => {
    await api_1.api.patch('/notifications/mark-all-read');
};
exports.markAllAsRead = markAllAsRead;
// Delete notification
const deleteNotification = async (id) => {
    await api_1.api.delete(`/notifications/${id}`);
};
exports.deleteNotification = deleteNotification;
// Delete all read notifications
const deleteAllRead = async () => {
    await api_1.api.delete('/notifications/clear-read');
};
exports.deleteAllRead = deleteAllRead;
