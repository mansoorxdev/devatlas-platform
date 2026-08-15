import { z } from 'zod';
import { ALLOWED_CATEGORIES, ALLOWED_LANGUAGES } from '../constants/editorial.js';

/**
 * Validator schema for creating an Article.
 * Note: 'author' is intentionally excluded and bound exclusively from req.user on the server.
 */
export const createArticleSchema = z.object({
  body: z
    .object({
      title: z
        .string({ required_error: 'Title is required' })
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .trim(),
      summary: z
        .string({ required_error: 'Summary is required' })
        .min(10, 'Summary must be at least 10 characters')
        .max(500, 'Summary cannot exceed 500 characters')
        .trim(),
      content: z
        .string({ required_error: 'Content is required' })
        .min(10, 'Content must be at least 10 characters'),
      tags: z
        .array(z.string().trim().toLowerCase())
        .optional()
        .default([]),
      featuredImage: z.string().trim().optional().default(''),
      seoTitle: z.string().trim().max(200).optional().default(''),
      seoDescription: z.string().trim().max(300).optional().default(''),
      category: z
        .string()
        .trim()
        .refine((val) => ALLOWED_CATEGORIES.includes(val), {
          message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
        })
        .optional()
        .default('Backend'),
      language: z
        .string()
        .trim()
        .refine((val) => ALLOWED_LANGUAGES.includes(val), {
          message: `Language must be one of: ${ALLOWED_LANGUAGES.join(', ')}`,
        })
        .optional()
        .default('English'),
      status: z
        .enum(['draft', 'published'], {
          errorMap: () => ({ message: "Status must be either 'draft' or 'published'" }),
        })
        .optional()
        .default('draft'),
    })
    .strict(),
});

/**
 * Validator schema for updating an Article.
 */
export const updateArticleSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Article ID parameter is required' }),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .trim()
        .optional(),
      summary: z
        .string()
        .min(10, 'Summary must be at least 10 characters')
        .max(500, 'Summary cannot exceed 500 characters')
        .trim()
        .optional(),
      content: z
        .string()
        .min(10, 'Content must be at least 10 characters')
        .optional(),
      tags: z
        .array(z.string().trim().toLowerCase())
        .optional(),
      featuredImage: z.string().trim().optional(),
      seoTitle: z.string().trim().max(200).optional(),
      seoDescription: z.string().trim().max(300).optional(),
      category: z
        .string()
        .trim()
        .refine((val) => ALLOWED_CATEGORIES.includes(val), {
          message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
        })
        .optional(),
      language: z
        .string()
        .trim()
        .refine((val) => ALLOWED_LANGUAGES.includes(val), {
          message: `Language must be one of: ${ALLOWED_LANGUAGES.join(', ')}`,
        })
        .optional(),
      status: z
        .enum(['draft', 'published'], {
          errorMap: () => ({ message: "Status must be either 'draft' or 'published'" }),
        })
        .optional(),
    })
    .strict(),
});

/**
 * Validator schema for query/pagination parameters on Article listings.
 */
export const articleQuerySchema = z.object({
  query: z
    .object({
      page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
      limit: z.string().optional().transform((val) => (val ? Math.min(50, Math.max(1, parseInt(val, 10) || 10)) : 10)),
      search: z.string().trim().optional(),
      tag: z.string().trim().toLowerCase().optional(),
      status: z
        .enum(['draft', 'pending_review', 'changes_requested', 'rejected', 'published', 'unpublished', 'archived', 'all'])
        .optional(),
      writer: z.string().optional(),
      category: z.string().optional(),
      language: z.string().optional(),
      isAssigned: z.enum(['true', 'false', 'all']).optional(),
      isFeatured: z.enum(['true', 'false', 'all']).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      sort: z.string().optional(),
    })
    .passthrough(),
});

/**
 * Validator schema for toggling status (publish/unpublish).
 */
export const toggleStatusSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Article ID parameter is required' }),
  }),
  body: z
    .object({
      status: z.enum(['draft', 'published', 'pending_review', 'changes_requested', 'rejected', 'unpublished', 'archived'], {
        errorMap: () => ({ message: 'Invalid article status' }),
      }),
    })
    .strict(),
});

/**
 * Validator schema for Writer article creation.
 */
export const writerCreateArticleSchema = z.object({
  body: z
    .object({
      title: z
        .string({ required_error: 'Title is required' })
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .trim(),
      summary: z
        .string({ required_error: 'Summary is required' })
        .min(10, 'Summary must be at least 10 characters')
        .max(500, 'Summary cannot exceed 500 characters')
        .trim(),
      content: z
        .string({ required_error: 'Content is required' })
        .min(10, 'Content must be at least 10 characters'),
      tags: z
        .array(z.string().trim().toLowerCase())
        .optional()
        .default([]),
      featuredImage: z.string().trim().optional().default(''),
      seoTitle: z.string().trim().max(200).optional().default(''),
      seoDescription: z.string().trim().max(300).optional().default(''),
      category: z
        .string()
        .trim()
        .refine((val) => ALLOWED_CATEGORIES.includes(val), {
          message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
        })
        .optional()
        .default('Backend'),
      language: z
        .string()
        .trim()
        .refine((val) => ALLOWED_LANGUAGES.includes(val), {
          message: `Language must be one of: ${ALLOWED_LANGUAGES.join(', ')}`,
        })
        .optional()
        .default('English'),
      assignmentId: z.string().optional(),
      action: z
        .enum(['draft', 'submit'], {
          errorMap: () => ({ message: "Action must be 'draft' or 'submit'" }),
        })
        .optional()
        .default('draft'),
    })
    .strict(),
});

/**
 * Validator schema for Writer article updates.
 */
export const writerUpdateArticleSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Article ID parameter is required' }),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .trim()
        .optional(),
      summary: z
        .string()
        .min(10, 'Summary must be at least 10 characters')
        .max(500, 'Summary cannot exceed 500 characters')
        .trim()
        .optional(),
      content: z
        .string()
        .min(10, 'Content must be at least 10 characters')
        .optional(),
      tags: z
        .array(z.string().trim().toLowerCase())
        .optional(),
      featuredImage: z.string().trim().optional(),
      seoTitle: z.string().trim().max(200).optional(),
      seoDescription: z.string().trim().max(300).optional(),
      category: z
        .string()
        .trim()
        .refine((val) => ALLOWED_CATEGORIES.includes(val), {
          message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
        })
        .optional(),
      language: z
        .string()
        .trim()
        .refine((val) => ALLOWED_LANGUAGES.includes(val), {
          message: `Language must be one of: ${ALLOWED_LANGUAGES.join(', ')}`,
        })
        .optional(),
      assignmentId: z.string().optional(),
      action: z
        .enum(['draft', 'submit', 'resubmit'], {
          errorMap: () => ({ message: "Action must be 'draft', 'submit', or 'resubmit'" }),
        })
        .optional(),
    })
    .strict(),
});

/**
 * Validator schema for Admin review actions.
 */
export const reviewActionSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Article ID parameter is required' }),
  }),
  body: z
    .object({
      reviewNote: z
        .string({ required_error: 'Review feedback/reason is required' })
        .min(5, 'Review feedback must be at least 5 characters')
        .max(1000, 'Review feedback cannot exceed 1000 characters')
        .trim(),
    })
    .strict(),
});

/**
 * Validator schema for Admin moderation actions (unpublish, archive, restore, feature).
 */
export const adminModerationSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Article ID parameter is required' }),
  }),
  body: z
    .object({
      note: z.string().trim().max(1000).optional().default(''),
      isFeatured: z.boolean().optional(),
    })
    .strict(),
});
