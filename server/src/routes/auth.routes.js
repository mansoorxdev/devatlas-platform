import express from 'express';
import authController from '#controllers/auth.controller.js';
import validate from '#middlewares/validation.middleware.js';
import { loginSchema, registerWriterSchema } from '#validators/auth.validator.js';
import authenticate from '#middlewares/auth.middleware.js';
import asyncWrapper from '#utils/async-wrapper.js';
import { authLoginLimiter, authRefreshLimiter } from '#middlewares/rate-limiter.middleware.js';

const router = express.Router();

// Mount public Writer Registration route
router.post(
  '/writer/register',
  authLoginLimiter,
  validate(registerWriterSchema),
  asyncWrapper(authController.registerWriter.bind(authController))
);

// Mount login route with strict brute-force rate limiter, validation, and async wrapper
router.post(
  '/login',
  authLoginLimiter,
  validate(loginSchema),
  asyncWrapper(authController.login.bind(authController))
);

// Mount me route with authentication middleware (accessible to any authenticated admin or writer)
router.get(
  '/me',
  authenticate,
  asyncWrapper(authController.getMe.bind(authController))
);

// Mount token refresh rotation endpoint with dedicated refresh rate limiter
router.post(
  '/refresh',
  authRefreshLimiter,
  asyncWrapper(authController.refresh.bind(authController))
);

// Mount logout endpoint
router.post('/logout', asyncWrapper(authController.logout.bind(authController)));

export default router;
