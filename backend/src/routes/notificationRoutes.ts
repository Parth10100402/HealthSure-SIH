// HealthSure — Notification Routes
// backend/src/routes/notificationRoutes.ts

import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markNotificationAsRead);
router.patch('/read-all', authenticate, markAllNotificationsAsRead);

export default router;
