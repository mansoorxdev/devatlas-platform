import express from 'express';
import authRoutes from './auth.routes.js';
import articleRoutes from './article.routes.js';
import snippetRoutes from './snippet.routes.js';
import errorRoutes from './error.routes.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'DevAtlas API Server is healthy and running.',
    timestamp: new Date().toISOString(),
  });
});

// Mounting Sub-Routers
router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/snippets', snippetRoutes);
router.use('/errors', errorRoutes);

export default router;
