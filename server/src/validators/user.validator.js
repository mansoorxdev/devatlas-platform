import { z } from 'zod';

export const writerQuerySchema = z.object({
  query: z
    .object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
      search: z.string().trim().optional().default(''),
    })
    .optional(),
});

export const toggleUserStatusSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'User ID parameter is required' }),
  }),
  body: z
    .object({
      isActive: z.boolean({
        required_error: 'isActive status is required',
        invalid_type_error: 'isActive must be a boolean',
      }),
    })
    .strict(),
});
