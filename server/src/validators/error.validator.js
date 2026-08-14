import { z } from 'zod';
import { ERROR_CATEGORIES, ERROR_LANGUAGES } from '#models/error.model.js';

export const createErrorSchema = z.object({
  body: z
    .object({
      title: z
        .string({ required_error: 'Title is required' })
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .trim(),
      errorMessage: z
        .string({ required_error: 'Raw error message is required' })
        .trim()
        .min(1, 'Raw error message cannot be empty'),
      category: z.enum(ERROR_CATEGORIES, {
        errorMap: () => ({ message: `Category must be one of: ${ERROR_CATEGORIES.join(', ')}` }),
      }),
      language: z.enum(ERROR_LANGUAGES, {
        errorMap: () => ({ message: `Language must be one of: ${ERROR_LANGUAGES.join(', ')}` }),
      }),
      cause: z
        .string({ required_error: 'Error cause explanation is required' })
        .trim()
        .min(1, 'Error cause explanation cannot be empty'),
      solution: z
        .string({ required_error: 'Solution walkthrough is required' })
        .trim()
        .min(1, 'Solution walkthrough cannot be empty'),
      codeFix: z.string().optional().default(''),
      tags: z.array(z.string().trim().toLowerCase()).optional().default([]),
      status: z
        .enum(['draft', 'published'], {
          errorMap: () => ({ message: "Status must be either 'draft' or 'published'" }),
        })
        .optional()
        .default('draft'),
    })
    .strict(),
});

export const updateErrorSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Error solution ID parameter is required' }),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .trim()
        .optional(),
      errorMessage: z.string().trim().min(1, 'Raw error message cannot be empty').optional(),
      category: z
        .enum(ERROR_CATEGORIES, {
          errorMap: () => ({ message: `Category must be one of: ${ERROR_CATEGORIES.join(', ')}` }),
        })
        .optional(),
      language: z
        .enum(ERROR_LANGUAGES, {
          errorMap: () => ({ message: `Language must be one of: ${ERROR_LANGUAGES.join(', ')}` }),
        })
        .optional(),
      cause: z.string().trim().min(1, 'Error cause explanation cannot be empty').optional(),
      solution: z.string().trim().min(1, 'Solution walkthrough cannot be empty').optional(),
      codeFix: z.string().optional(),
      tags: z.array(z.string().trim().toLowerCase()).optional(),
      status: z
        .enum(['draft', 'published'], {
          errorMap: () => ({ message: "Status must be either 'draft' or 'published'" }),
        })
        .optional(),
    })
    .strict(),
});

export const errorQuerySchema = z.object({
  query: z
    .object({
      page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
      limit: z.string().optional().transform((val) => (val ? Math.min(50, Math.max(1, parseInt(val, 10) || 10)) : 10)),
      search: z.string().trim().optional(),
      tag: z.string().trim().toLowerCase().optional(),
      language: z.string().trim().toLowerCase().optional(),
      category: z.string().trim().toLowerCase().optional(),
      status: z.enum(['draft', 'published', 'all']).optional(),
      sort: z.string().optional(),
    })
    .optional(),
});

export const toggleStatusSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Error solution ID parameter is required' }),
  }),
  body: z
    .object({
      status: z.enum(['draft', 'published'], {
        errorMap: () => ({ message: "Status must be either 'draft' or 'published'" }),
      }),
    })
    .strict(),
});
