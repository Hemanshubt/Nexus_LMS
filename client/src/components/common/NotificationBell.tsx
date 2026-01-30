import { useState, useEffect } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    Notification
} from '@/services/notificationService';

// Simple time ago function
const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications(1, 10);
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch unread count periodically
    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(async () => {
            try {
                const count = await getUnreadCount();
                setUnreadCount(count);
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Handle notification click
    const handleNotificationClick = async (notification: Notification) => {
        try {
            if (!notification.isRead) {
                await markAsRead(notification.id);
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notification.id ? { ...n, isRead: true } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            if (notification.link) {
                navigate(notification.link);
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Handle mark all as read
    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Handle delete notification
    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            const notification = notifications.find(n => n.id === id);
            if (notification && !notification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Get icon color based on type
    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            ENROLLMENT: 'bg-green-500',
            PAYMENT: 'bg-blue-500',
            COURSE_UPDATE: 'bg-yellow-500',
            ASSIGNMENT_GRADED: 'bg-purple-500',
            QUIZ_RESULT: 'bg-indigo-500',
            CERTIFICATE: 'bg-amber-500',
            ANNOUNCEMENT: 'bg-red-500',
            COMMENT_REPLY: 'bg-cyan-500',
            SYSTEM: 'bg-gray-500',
        };
        return colors[type] || 'bg-gray-500';
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="text-xs"
                        >
                            <CheckCheck className="h-4 w-4 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-20">
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex items-start gap-3 p-3 cursor-pointer ${!notification.isRead ? 'bg-muted/50' : ''
                                    }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div
                                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getTypeColor(
                                        notification.type
                                    )}`}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {timeAgo(notification.createdAt)}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 flex-shrink-0"
                                    onClick={(e) => handleDelete(e, notification.id)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                className="w-full text-sm"
                                onClick={() => {
                                    navigate('/notifications');
                                    setIsOpen(false);
                                }}
                            >
                                View all notifications
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
