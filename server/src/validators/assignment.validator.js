import { z } from 'zod';

/**
 * Validator schema for creating an Article Assignment / Content Brief (Admin only).
 */
export const createAssignmentSchema = z.object({
  body: z
    .object({
      title: z
        .string({ required_error: 'Title is required' })
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .trim(),
      brief: z
        .string({ required_error: 'Content brief is required' })
        .min(10, 'Brief must be at least 10 characters')
        .max(3000, 'Brief cannot exceed 3000 characters')
        .trim(),
      writer: z
        .string({ required_error: 'Writer ID is required' })
        .min(1, 'Writer ID cannot be empty'),
      category: z.string().trim().optional().default('General'),
      language: z.string().trim().optional().default('English'),
      targetKeywords: z.array(z.string().trim()).optional().default([]),
      targetWordCount: z
        .number({ invalid_type_error: 'Target word count must be a number' })
        .min(100, 'Target word count must be at least 100 words')
        .max(20000, 'Target word count cannot exceed 20,000 words')
        .optional()
        .default(1000),
      deadline: z
        .string({ required_error: 'Deadline is required' })
        .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid deadline date format' }),
      priority: z
        .enum(['low', 'medium', 'high', 'urgent'], {
          errorMap: () => ({ message: "Priority must be 'low', 'medium', 'high', or 'urgent'" }),
        })
        .optional()
        .default('medium'),
      additionalInstructions: z.string().trim().optional().default(''),
    })
    .strict(),
});

/**
 * Validator schema for updating an Article Assignment (Admin only).
 */
export const updateAssignmentSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Assignment ID parameter is required' }),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .trim()
        .optional(),
      brief: z
        .string()
        .min(10, 'Brief must be at least 10 characters')
        .max(3000, 'Brief cannot exceed 3000 characters')
        .trim()
        .optional(),
      writer: z.string().min(1).optional(),
      category: z.string().trim().optional(),
      language: z.string().trim().optional(),
      targetKeywords: z.array(z.string().trim()).optional(),
      targetWordCount: z.number().min(100).max(20000).optional(),
      deadline: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid deadline date format' })
        .optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      additionalInstructions: z.string().trim().optional(),
    })
    .strict(),
});

/**
 * Validator schema for querying assignments.
 */
export const assignmentQuerySchema = z.object({
  query: z
    .object({
      page: z.string().optional().default('1'),
      limit: z.string().optional().default('10'),
      status: z.enum(['assigned', 'in_progress', 'submitted', 'completed', 'cancelled', 'all']).optional().default('all'),
      priority: z.enum(['low', 'medium', 'high', 'urgent', 'all']).optional().default('all'),
      search: z.string().optional().default(''),
      writer: z.string().optional(),
    })
    .passthrough(),
});
