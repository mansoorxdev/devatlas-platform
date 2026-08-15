import express from 'express';
import searchController from '#controllers/search.controller.js';
import validate from '#middlewares/validation.middleware.js';
import { searchQuerySchema } from '#validators/search.validator.js';
import { searchLimiter } from '#middlewares/rate-limiter.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/v1/search?q=<query>
 * @desc    Public unified search across published Articles, Snippets, and Error Solutions
 * @access  Public
 */
router.get('/', searchLimiter, validate(searchQuerySchema), searchController.globalSearch);

export default router;
