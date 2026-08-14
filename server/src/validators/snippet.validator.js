import { z } from 'zod';
import { SNIPPET_LANGUAGES } from '../models/snippet.model.js';

/**
 * Validator schema for creating a Snippet.
 * Security Note: 'author' and 'authorId' are strictly forbidden in body and bound server-side from req.user.
 */
export const createSnippetSchema = z.object({
  body: z
    .object({
      title: z
        .string({ required_error: 'Title is required' })
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .trim(),
      summary: z
        .string()
        .max(500, 'Summary cannot exceed 500 characters')
        .trim()
        .optional()
        .default(''),
      code: z
        .string({ required_error: 'Code content is required' })
        .trim()
        .min(1, 'Code content cannot be empty'),
      language: z
        .enum(SNIPPET_LANGUAGES, {
          errorMap: () => ({
            message: `Language must be one of: ${SNIPPET_LANGUAGES.join(', ')}`,
          }),
        }),
      tags: z
        .array(z.string().trim().toLowerCase())
        .optional()
        .default([]),
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
 * Validator schema for updating a Snippet.
 * Security Note: 'author', 'authorId', and 'slug' are forbidden in update payload.
 */
export const updateSnippetSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Snippet ID parameter is required' }),
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
        .max(500, 'Summary cannot exceed 500 characters')
        .trim()
        .optional(),
      code: z
        .string()
        .trim()
        .min(1, 'Code content cannot be empty')
        .optional(),
      language: z
        .enum(SNIPPET_LANGUAGES, {
          errorMap: () => ({
            message: `Language must be one of: ${SNIPPET_LANGUAGES.join(', ')}`,
          }),
        })
        .optional(),
      tags: z
        .array(z.string().trim().toLowerCase())
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
 * Validator schema for query/pagination parameters on Snippet listings.
 */
export const snippetQuerySchema = z.object({
  query: z
    .object({
      page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
      limit: z.string().optional().transform((val) => (val ? Math.min(50, Math.max(1, parseInt(val, 10) || 10)) : 10)),
      search: z.string().trim().optional(),
      tag: z.string().trim().toLowerCase().optional(),
      language: z.string().trim().toLowerCase().optional(),
      status: z.enum(['draft', 'published', 'all']).optional(),
      sort: z.string().optional(),
    })
    .optional(),
});

/**
 * Validator schema for toggling status (publish/unpublish).
 */
export const toggleStatusSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Snippet ID parameter is required' }),
  }),
  body: z
    .object({
      status: z.enum(['draft', 'published'], {
        errorMap: () => ({ message: "Status must be either 'draft' or 'published'" }),
      }),
    })
    .strict(),
});
