import { z } from 'zod';
import { ALLOWED_AVATAR_IDS } from '../constants/avatars.js';

export const writerApplySchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Name is required' })
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
        .trim(),
      email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email address')
        .trim()
        .toLowerCase(),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must not exceed 128 characters'),
      bio: z
        .string()
        .max(500, 'Bio must not exceed 500 characters')
        .trim()
        .optional()
        .default(''),
      expertise: z
        .array(z.string().trim())
        .max(10, 'Cannot specify more than 10 areas of expertise')
        .optional()
        .default([]),
      avatar: z
        .string()
        .trim()
        .refine((val) => ALLOWED_AVATAR_IDS.includes(val), {
          message: 'Invalid avatar selection.',
        })
        .optional()
        .default('avatar-01'),
    })
    .strict(),
});

export const applicationActionSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Application ID parameter is required' }),
  }),
  body: z
    .object({
      rejectionReason: z
        .string()
        .min(5, 'Rejection reason must be at least 5 characters')
        .max(500, 'Rejection reason must not exceed 500 characters')
        .trim()
        .optional(),
    })
    .strict(),
});

export const applicationQuerySchema = z.object({
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
      status: z.enum(['pending', 'approved', 'rejected', 'all']).optional().default('pending'),
    })
    .passthrough(),
});
