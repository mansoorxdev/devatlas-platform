import express from 'express';
import errorController from '#controllers/error.controller.js';
import validate from '#middlewares/validation.middleware.js';
import authenticate from '#middlewares/auth.middleware.js';
import authorizeAdmin from '#middlewares/admin.middleware.js';
import asyncWrapper from '#utils/async-wrapper.js';
import {
  createErrorSchema,
  updateErrorSchema,
  errorQuerySchema,
  toggleStatusSchema,
} from '#validators/error.validator.js';

const router = express.Router();

// --- PUBLIC ROUTES ---

// List published error solutions (with pagination, category, language, tag, and search)
router.get(
  '/',
  validate(errorQuerySchema),
  asyncWrapper(errorController.getPublicErrorSolutions.bind(errorController))
);

// Get single published error solution by slug
router.get(
  '/s/:slug',
  asyncWrapper(errorController.getPublicErrorSolutionBySlug.bind(errorController))
);

// --- PROTECTED ADMIN ROUTES ---

// List all error solutions for admin (drafts + published)
router.get(
  '/admin',
  authenticate,
  authorizeAdmin,
  validate(errorQuerySchema),
  asyncWrapper(errorController.getAdminErrorSolutions.bind(errorController))
);

// Get single error solution by ID for admin
router.get(
  '/admin/:id',
  authenticate,
  authorizeAdmin,
  asyncWrapper(errorController.getAdminErrorSolutionById.bind(errorController))
);

// Create new error solution
router.post(
  '/',
  authenticate,
  authorizeAdmin,
  validate(createErrorSchema),
  asyncWrapper(errorController.createErrorSolution.bind(errorController))
);

// Update error solution
router.put(
  '/:id',
  authenticate,
  authorizeAdmin,
  validate(updateErrorSchema),
  asyncWrapper(errorController.updateErrorSolution.bind(errorController))
);

// Toggle publish status (publish / unpublish)
router.patch(
  '/:id/status',
  authenticate,
  authorizeAdmin,
  validate(toggleStatusSchema),
  asyncWrapper(errorController.togglePublishStatus.bind(errorController))
);

// Delete error solution
router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  asyncWrapper(errorController.deleteErrorSolution.bind(errorController))
);

export default router;
