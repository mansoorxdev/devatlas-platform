import express from 'express';
import AppError from '#utils/app-error.js';
import authRoutes from './auth.routes.js';
import articleRoutes from './article.routes.js';

const router = express.Router();

// API version 1 routes (health check is mounted directly in app.js to bypass rate limiting)
router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);

// Match any other route that falls into the API router path and throw 404 AppError
router.all('*', (req, res, next) => {
  next(new AppError(`API endpoint '${req.originalUrl}' not found.`, 404, 'NOT_FOUND'));
});

export default router;
