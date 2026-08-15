import { z } from 'zod';

/**
 * Zod validation schema for Global Search API (GET /api/v1/search?q=...)
 */
export const searchQuerySchema = z.object({
  query: z
    .object({
      q: z
        .string({ required_error: 'Search query is required' })
        .trim()
        .min(2, 'Search query must be at least 2 characters long')
        .max(100, 'Search query cannot exceed 100 characters'),
    })
    .passthrough(),
});

export default searchQuerySchema;
