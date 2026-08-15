import express from 'express';
import notificationController from '#controllers/notification.controller.js';
import validate from '#middlewares/validation.middleware.js';
import authenticate from '#middlewares/auth.middleware.js';
import asyncWrapper from '#utils/async-wrapper.js';
import {
  notificationQuerySchema,
  notificationParamsSchema,
} from '#validators/notification.validator.js';

const router = express.Router();

// Get unread notification count
router.get(
  '/unread-count',
  authenticate,
  asyncWrapper(notificationController.getUnreadCount.bind(notificationController))
);

// Get paginated notifications for current user
router.get(
  '/',
  authenticate,
  validate(notificationQuerySchema),
  asyncWrapper(notificationController.getNotifications.bind(notificationController))
);

// Mark all notifications as read
router.patch(
  '/mark-all-read',
  authenticate,
  asyncWrapper(notificationController.markAllAsRead.bind(notificationController))
);

// Mark single notification as read
router.patch(
  '/:id/read',
  authenticate,
  validate(notificationParamsSchema),
  asyncWrapper(notificationController.markAsRead.bind(notificationController))
);

export default router;
