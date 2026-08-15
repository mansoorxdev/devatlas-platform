import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import requestLogger from './middlewares/request-logger.middleware.js';
import apiLimiter from './middlewares/rate-limiter.middleware.js';
import errorHandler from './middlewares/error.middleware.js';
import routes from './routes/index.js';
import healthRoutes from './routes/health.routes.js';
import sitemapRoutes from './routes/sitemap.routes.js';
import AppError from '#utils/app-error.js';
import config from '#config/env.config.js';

const app = express();

// Disable x-powered-by header to prevent Express fingerprinting
app.disable('x-powered-by');

// Trust reverse proxy for rate limiting, secure cookies, etc. in production
app.set('trust proxy', 1);

// Global security headers
app.use(helmet());

// CORS configuration based on validated environment configuration
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true,
}));

// TODO: Add compression middleware (e.g., import compression from 'compression'; app.use(compression())) in a future phase

// Request parsers with 1MB body size limits to prevent body-bloating denial of service attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Morgan HTTP request logging piped through Winston
app.use(requestLogger);

// Mount health check & sitemap endpoints BEFORE rate limiting is applied to /api
app.use('/api/v1/health', healthRoutes);
app.use('/sitemap.xml', sitemapRoutes);

// Rate limiting on API routes
app.use('/api', apiLimiter);

// Mount master API routes
app.use('/api/v1', routes);

// Non-API routes 404 catch-all
app.all('*', (req, res, next) => {
  next(new AppError(`Endpoint not found: ${req.originalUrl}`, 404, 'NOT_FOUND'));
});

// Centralized global error handling middleware
app.use(errorHandler);

export default app;
