import express from 'express';
import assignmentController from '#controllers/assignment.controller.js';
import validate from '#middlewares/validation.middleware.js';
import authenticate from '#middlewares/auth.middleware.js';
import authorizeAdmin from '#middlewares/admin.middleware.js';
import authorizeWriter from '#middlewares/writer.middleware.js';
import asyncWrapper from '#utils/async-wrapper.js';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  assignmentQuerySchema,
} from '#validators/assignment.validator.js';

const router = express.Router();

// --- ADMIN ROUTES ---

// Create assignment
router.post(
  '/admin',
  authenticate,
  authorizeAdmin,
  validate(createAssignmentSchema),
  asyncWrapper(assignmentController.createAssignment.bind(assignmentController))
);

// Get paginated assignments
router.get(
  '/admin',
  authenticate,
  authorizeAdmin,
  validate(assignmentQuerySchema),
  asyncWrapper(assignmentController.getAdminAssignments.bind(assignmentController))
);

// Get single assignment
router.get(
  '/admin/:id',
  authenticate,
  authorizeAdmin,
  asyncWrapper(assignmentController.getAssignmentByIdAdmin.bind(assignmentController))
);

// Update assignment
router.patch(
  '/admin/:id',
  authenticate,
  authorizeAdmin,
  validate(updateAssignmentSchema),
  asyncWrapper(assignmentController.updateAssignmentAdmin.bind(assignmentController))
);

// Cancel assignment
router.patch(
  '/admin/:id/cancel',
  authenticate,
  authorizeAdmin,
  asyncWrapper(assignmentController.cancelAssignmentAdmin.bind(assignmentController))
);

// --- WRITER ROUTES ---

// Get writer's own assignments
router.get(
  '/writer',
  authenticate,
  authorizeWriter,
  validate(assignmentQuerySchema),
  asyncWrapper(assignmentController.getWriterAssignments.bind(assignmentController))
);

// Get writer's single assignment by ID
router.get(
  '/writer/:id',
  authenticate,
  authorizeWriter,
  asyncWrapper(assignmentController.getWriterAssignmentById.bind(assignmentController))
);

// Start assignment action
router.patch(
  '/writer/:id/start',
  authenticate,
  authorizeWriter,
  asyncWrapper(assignmentController.startAssignmentWriter.bind(assignmentController))
);

export default router;
