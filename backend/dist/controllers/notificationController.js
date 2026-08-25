// HealthSure — Notifications Controller
// backend/src/controllers/notificationController.ts
import { dataStore } from '../db/store.js';
export const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        let list = [...dataStore.notifications];
        if (userId) {
            list = list.filter((n) => n.userId === userId || !n.userId);
        }
        res.json({
            success: true,
            data: list,
            unreadCount: list.filter((n) => !n.read).length,
        });
    }
    catch (error) {
        next(error);
    }
};
export const markNotificationAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notif = dataStore.notifications.find((n) => n.id === id);
        if (notif) {
            notif.read = true;
        }
        res.json({
            success: true,
            message: 'Notification marked as read.',
        });
    }
    catch (error) {
        next(error);
    }
};
export const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        dataStore.notifications.forEach((n) => {
            if (!userId || n.userId === userId) {
                n.read = true;
            }
        });
        res.json({
            success: true,
            message: 'All notifications marked as read.',
        });
    }
    catch (error) {
        next(error);
    }
};
