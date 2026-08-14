import express from 'express';
import snippetController from '#controllers/snippet.controller.js';
import validate from '#middlewares/validation.middleware.js';
import authenticate from '#middlewares/auth.middleware.js';
import authorizeAdmin from '#middlewares/admin.middleware.js';
import asyncWrapper from '#utils/async-wrapper.js';
import {
  createSnippetSchema,
  updateSnippetSchema,
  snippetQuerySchema,
  toggleStatusSchema,
} from '#validators/snippet.validator.js';

const router = express.Router();

// --- PUBLIC ROUTES ---

// List published snippets (with pagination, language filter, tag filter, and search)
router.get(
  '/',
  validate(snippetQuerySchema),
  asyncWrapper(snippetController.getPublicSnippets.bind(snippetController))
);

// Get single published snippet by slug
router.get(
  '/s/:slug',
  asyncWrapper(snippetController.getPublicSnippetBySlug.bind(snippetController))
);

// --- PROTECTED ADMIN ROUTES ---

// List all snippets for admin (drafts + published)
router.get(
  '/admin',
  authenticate,
  authorizeAdmin,
  validate(snippetQuerySchema),
  asyncWrapper(snippetController.getAdminSnippets.bind(snippetController))
);

// Get single snippet by ID for admin
router.get(
  '/admin/:id',
  authenticate,
  authorizeAdmin,
  asyncWrapper(snippetController.getAdminSnippetById.bind(snippetController))
);

// Create new snippet
router.post(
  '/',
  authenticate,
  authorizeAdmin,
  validate(createSnippetSchema),
  asyncWrapper(snippetController.createSnippet.bind(snippetController))
);

// Update snippet
router.put(
  '/:id',
  authenticate,
  authorizeAdmin,
  validate(updateSnippetSchema),
  asyncWrapper(snippetController.updateSnippet.bind(snippetController))
);

// Toggle publish status (publish / unpublish)
router.patch(
  '/:id/status',
  authenticate,
  authorizeAdmin,
  validate(toggleStatusSchema),
  asyncWrapper(snippetController.togglePublishStatus.bind(snippetController))
);

// Delete snippet
router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  asyncWrapper(snippetController.deleteSnippet.bind(snippetController))
);

export default router;
