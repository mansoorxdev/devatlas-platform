import express from 'express';
import articleController from '#controllers/article.controller.js';
import validate from '#middlewares/validation.middleware.js';
import authenticate from '#middlewares/auth.middleware.js';
import authorizeAdmin from '#middlewares/admin.middleware.js';
import asyncWrapper from '#utils/async-wrapper.js';
import {
  createArticleSchema,
  updateArticleSchema,
  articleQuerySchema,
  toggleStatusSchema,
} from '#validators/article.validator.js';

const router = express.Router();

// --- PUBLIC ROUTES ---

// List published articles (with pagination, tag filter, and search)
router.get(
  '/',
  validate(articleQuerySchema),
  asyncWrapper(articleController.getPublicArticles.bind(articleController))
);

// Get single published article by slug
router.get(
  '/s/:slug',
  asyncWrapper(articleController.getPublicArticleBySlug.bind(articleController))
);

// --- PROTECTED ADMIN ROUTES ---

// List all articles for admin (drafts + published)
router.get(
  '/admin',
  authenticate,
  authorizeAdmin,
  validate(articleQuerySchema),
  asyncWrapper(articleController.getAdminArticles.bind(articleController))
);

// Get single article by ID for admin
router.get(
  '/admin/:id',
  authenticate,
  authorizeAdmin,
  asyncWrapper(articleController.getAdminArticleById.bind(articleController))
);

// Create new article
router.post(
  '/',
  authenticate,
  authorizeAdmin,
  validate(createArticleSchema),
  asyncWrapper(articleController.createArticle.bind(articleController))
);

// Update article
router.put(
  '/:id',
  authenticate,
  authorizeAdmin,
  validate(updateArticleSchema),
  asyncWrapper(articleController.updateArticle.bind(articleController))
);

// Toggle publish status (publish / unpublish)
router.patch(
  '/:id/status',
  authenticate,
  authorizeAdmin,
  validate(toggleStatusSchema),
  asyncWrapper(articleController.togglePublishStatus.bind(articleController))
);

// Delete article
router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  asyncWrapper(articleController.deleteArticle.bind(articleController))
);

export default router;
