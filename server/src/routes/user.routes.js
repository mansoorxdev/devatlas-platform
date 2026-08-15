import express from 'express';
import userController from '#controllers/user.controller.js';
import validate from '#middlewares/validation.middleware.js';
import authenticate from '#middlewares/auth.middleware.js';
import authorizeAdmin from '#middlewares/admin.middleware.js';
import asyncWrapper from '#utils/async-wrapper.js';
import { writerQuerySchema, toggleUserStatusSchema, updateProfileSchema } from '#validators/user.validator.js';

const router = express.Router();

// List writers with stats
router.get(
  '/writers',
  authenticate,
  authorizeAdmin,
  validate(writerQuerySchema),
  asyncWrapper(userController.getWriters.bind(userController))
);

// Get single writer by ID
router.get(
  '/writers/:id',
  authenticate,
  authorizeAdmin,
  asyncWrapper(userController.getWriterById.bind(userController))
);

// Get writer performance analytics
router.get(
  '/writers/:id/performance',
  authenticate,
  authorizeAdmin,
  asyncWrapper(userController.getWriterPerformance.bind(userController))
);

// Toggle writer status (activate / deactivate)
router.patch(
  '/writers/:id/status',
  authenticate,
  authorizeAdmin,
  validate(toggleUserStatusSchema),
  asyncWrapper(userController.toggleWriterStatus.bind(userController))
);

// Get current user's profile
router.get(
  '/profile',
  authenticate,
  asyncWrapper(userController.getProfile.bind(userController))
);

// Update current user's profile
router.patch(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  asyncWrapper(userController.updateProfile.bind(userController))
);

// Public Author profile endpoint (no auth required)
router.get(
  '/authors/:slug',
  asyncWrapper(userController.getPublicAuthorProfile.bind(userController))
);

export default router;
