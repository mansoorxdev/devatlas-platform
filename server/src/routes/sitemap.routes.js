import express from 'express';
import sitemapController from '#controllers/sitemap.controller.js';

const router = express.Router();

router.get('/', (req, res, next) => sitemapController.getSitemap(req, res, next));

export default router;
