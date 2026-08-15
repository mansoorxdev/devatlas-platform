import { z } from 'zod';

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
 * Note: 'author' and 'slug' are excluded from update payload to preserve integrity.
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
      status: z.enum(['draft', 'pending_review', 'changes_requested', 'rejected', 'published', 'all']).optional(),
      sort: z.string().optional(),
    })
    .optional(),
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
      status: z.enum(['draft', 'published', 'pending_review', 'changes_requested', 'rejected'], {
        errorMap: () => ({ message: 'Invalid article status' }),
      }),
    })
    .strict(),
});

/**
 * Validator schema for Writer article creation.
 * Strictly prevents client status/author injection.
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
 * Allows action = 'draft' or 'submit' (or 'resubmit').
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
 * Validator schema for Admin review actions (Request Changes / Reject).
 * Requires reviewNote minimum 5 characters.
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
