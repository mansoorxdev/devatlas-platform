import express from 'express';
import authController from '#controllers/auth.controller.js';
import validate from '#middlewares/validation.middleware.js';
import { loginSchema } from '#validators/auth.validator.js';
import authenticate from '#middlewares/auth.middleware.js';
import authorizeAdmin from '#middlewares/admin.middleware.js';
import asyncWrapper from '#utils/async-wrapper.js';

const router = express.Router();

// Mount login route with validation and async wrapper
router.post('/login', validate(loginSchema), asyncWrapper(authController.login.bind(authController)));

// Mount me route with authentication and authorization check middlewares
router.get(
  '/me',
  authenticate,
  authorizeAdmin,
  asyncWrapper(authController.getMe.bind(authController))
);

export default router;
