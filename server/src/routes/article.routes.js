import express from 'express';
import articleController from '#controllers/article.controller.js';
import validate from '#middlewares/validation.middleware.js';
import authenticate from '#middlewares/auth.middleware.js';
import authorizeAdmin from '#middlewares/admin.middleware.js';
import authorizeWriter from '#middlewares/writer.middleware.js';
import asyncWrapper from '#utils/async-wrapper.js';
import {
  createArticleSchema,
  updateArticleSchema,
  articleQuerySchema,
  toggleStatusSchema,
  writerCreateArticleSchema,
  writerUpdateArticleSchema,
  reviewActionSchema,
  adminModerationSchema,
} from '#validators/article.validator.js';

const router = express.Router();

// --- PUBLIC ROUTES ---

// List published articles (with pagination, tag filter, and search)
router.get(
  '/',
  validate(articleQuerySchema),
  asyncWrapper(articleController.getPublicArticles.bind(articleController))
);

// Get featured published articles
router.get(
  '/featured',
  asyncWrapper(articleController.getFeaturedArticles.bind(articleController))
);

// Get single published article by slug
router.get(
  '/s/:slug',
  asyncWrapper(articleController.getPublicArticleBySlug.bind(articleController))
);

// --- PROTECTED WRITER PORTAL ROUTES ---

// List writer's own articles
router.get(
  '/my',
  authenticate,
  authorizeWriter,
  validate(articleQuerySchema),
  asyncWrapper(articleController.getWriterArticles.bind(articleController))
);

// Get writer dashboard stats
router.get(
  '/my/stats',
  authenticate,
  authorizeWriter,
  asyncWrapper(articleController.getWriterStats.bind(articleController))
);

// Get single article owned by writer
router.get(
  '/writer/:id',
  authenticate,
  authorizeWriter,
  asyncWrapper(articleController.getWriterArticleById.bind(articleController))
);

// Create new article as Writer
router.post(
  '/writer',
  authenticate,
  authorizeWriter,
  validate(writerCreateArticleSchema),
  asyncWrapper(articleController.createWriterArticle.bind(articleController))
);

// Update article owned by Writer
router.put(
  '/writer/:id',
  authenticate,
  authorizeWriter,
  validate(writerUpdateArticleSchema),
  asyncWrapper(articleController.updateWriterArticle.bind(articleController))
);

// Submit / Resubmit article for editorial review
router.patch(
  '/writer/:id/submit',
  authenticate,
  authorizeWriter,
  asyncWrapper(articleController.submitWriterArticle.bind(articleController))
);

// --- PROTECTED ADMIN EDITORIAL REVIEW ROUTES ---

// List editorial review queue for Admin
router.get(
  '/admin/review',
  authenticate,
  authorizeAdmin,
  validate(articleQuerySchema),
  asyncWrapper(articleController.getAdminReviewQueue.bind(articleController))
);

// Admin approve and publish article
router.patch(
  '/admin/:id/approve',
  authenticate,
  authorizeAdmin,
  asyncWrapper(articleController.approveArticle.bind(articleController))
);

// Admin request changes with feedback note
router.patch(
  '/admin/:id/request-changes',
  authenticate,
  authorizeAdmin,
  validate(reviewActionSchema),
  asyncWrapper(articleController.requestChanges.bind(articleController))
);

// Admin reject article with reason
router.patch(
  '/admin/:id/reject',
  authenticate,
  authorizeAdmin,
  validate(reviewActionSchema),
  asyncWrapper(articleController.rejectArticle.bind(articleController))
);

// --- STEP 9 EDITORIAL MODERATION & PUBLISHING CONTROL ROUTES ---

// Admin unpublish article
router.patch(
  '/admin/:id/unpublish',
  authenticate,
  authorizeAdmin,
  validate(adminModerationSchema),
  asyncWrapper(articleController.unpublishArticle.bind(articleController))
);

// Admin archive article
router.patch(
  '/admin/:id/archive',
  authenticate,
  authorizeAdmin,
  validate(adminModerationSchema),
  asyncWrapper(articleController.archiveArticle.bind(articleController))
);

// Admin restore article
router.patch(
  '/admin/:id/restore',
  authenticate,
  authorizeAdmin,
  asyncWrapper(articleController.restoreArticle.bind(articleController))
);

// Admin toggle featured status
router.patch(
  '/admin/:id/feature',
  authenticate,
  authorizeAdmin,
  validate(adminModerationSchema),
  asyncWrapper(articleController.toggleFeaturedArticle.bind(articleController))
);

// Admin get revision history
router.get(
  '/admin/:id/history',
  authenticate,
  authorizeAdmin,
  asyncWrapper(articleController.getArticleRevisionHistory.bind(articleController))
);

// --- PROTECTED ADMIN CRUD ROUTES ---

// List all articles for admin (drafts + published + review statuses)
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

// Create new article (Admin direct create)
router.post(
  '/',
  authenticate,
  authorizeAdmin,
  validate(createArticleSchema),
  asyncWrapper(articleController.createArticle.bind(articleController))
);

// Update article (Admin direct edit)
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
