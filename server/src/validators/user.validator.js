import { z } from 'zod';
import { ALLOWED_AVATAR_IDS } from '../constants/avatars.js';

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
      status: z.enum(['all', 'active', 'deactivated']).optional().default('all'),
    })
    .passthrough(),
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

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
        .trim()
        .optional(),
      bio: z
        .string()
        .max(500, 'Bio must not exceed 500 characters')
        .trim()
        .optional(),
      avatar: z
        .string()
        .trim()
        .refine((val) => ALLOWED_AVATAR_IDS.includes(val), {
          message: 'Invalid avatar selection. Please choose an approved DevAtlas profile avatar ID.',
        })
        .optional(),
      expertise: z
        .array(z.string().trim())
        .max(10, 'Cannot specify more than 10 areas of expertise')
        .optional(),
      socialLinks: z
        .object({
          github: z.string().trim().optional(),
          twitter: z.string().trim().optional(),
          website: z.string().trim().optional(),
        })
        .optional(),
    })
    .strict(),
});
