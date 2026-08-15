import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import requestLogger from './middlewares/request-logger.middleware.js';
import { publicApiLimiter } from './middlewares/rate-limiter.middleware.js';
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

// Gzip/Brotli HTTP response compression middleware for optimal network payload delivery
app.use(compression());

// Production-grade security headers compatible with React/Vite client
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer-when-downgrade' },
  })
);

// Environment-aware CORS configuration supporting client origin & local dev origin
const allowedOrigins = Array.from(
  new Set([config.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean))
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl, sitemap fetchers)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS Policy: Origin not allowed by Access-Control-Allow-Origin'));
    },
    credentials: true,
  })
);

// Request parsers with 1MB body size limits to allow code & markdown payloads while preventing body-bloating DoS attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Request logging piped through Winston
app.use(requestLogger);

// Mount health check & sitemap endpoints BEFORE rate limiting is applied to /api
app.use('/health', healthRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/sitemap.xml', sitemapRoutes);

// General public API rate limiter (300 requests per 15 minutes)
app.use('/api', publicApiLimiter);

// Mount master API routes
app.use('/api/v1', routes);

// Non-API routes 404 catch-all
app.all('*', (req, res, next) => {
  next(new AppError(`Endpoint not found: ${req.originalUrl}`, 404, 'NOT_FOUND'));
});

// Centralized global error handling middleware
app.use(errorHandler);

export default app;
