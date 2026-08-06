import express from 'express';
import authController from '#controllers/auth.controller.js';
import validate from '#middlewares/validation.middleware.js';
import { loginSchema } from '#validators/auth.validator.js';
import asyncWrapper from '#utils/async-wrapper.js';

const router = express.Router();

// Mount login route with validation and async wrapper
router.post('/login', validate(loginSchema), asyncWrapper(authController.login.bind(authController)));

export default router;
