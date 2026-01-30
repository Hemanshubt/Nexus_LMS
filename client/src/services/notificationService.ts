import { api } from './api';

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    unreadCount: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// Get all notifications
export const getNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
    const { data } = await api.get<{ data: NotificationResponse }>('/notifications', {
        params: { page, limit, unreadOnly }
    });
    return data.data;
};

// Get unread count
export const getUnreadCount = async () => {
    const { data } = await api.get<{ data: { count: number } }>('/notifications/unread-count');
    return data.data.count;
};

// Mark as read
export const markAsRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
};

// Mark all as read
export const markAllAsRead = async () => {
    await api.patch('/notifications/mark-all-read');
};

// Delete notification
export const deleteNotification = async (id: string) => {
    await api.delete(`/notifications/${id}`);
};

// Delete all read notifications
export const deleteAllRead = async () => {
    await api.delete('/notifications/clear-read');
};
