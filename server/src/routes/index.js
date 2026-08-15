import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import articleRoutes from './article.routes.js';
import snippetRoutes from './snippet.routes.js';
import errorRoutes from './error.routes.js';
import searchRoutes from './search.routes.js';
import sitemapRoutes from './sitemap.routes.js';
import assignmentRoutes from './assignment.routes.js';

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
router.use('/users', userRoutes);
router.use('/articles', articleRoutes);
router.use('/snippets', snippetRoutes);
router.use('/errors', errorRoutes);
router.use('/search', searchRoutes);
router.use('/sitemap.xml', sitemapRoutes);
router.use('/assignments', assignmentRoutes);

export default router;
