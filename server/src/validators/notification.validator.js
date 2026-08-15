import { z } from 'zod';

/**
 * Validator schema for querying notifications.
 */
export const notificationQuerySchema = z.object({
  query: z
    .object({
      page: z.string().optional().default('1'),
      limit: z.string().optional().default('10'),
      isRead: z.enum(['all', 'true', 'false']).optional().default('all'),
    })
    .passthrough(),
});

/**
 * Validator schema for parameter ID.
 */
export const notificationParamsSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Notification ID parameter is required' }),
  }),
});
