// src/schemas/cartWishlistSchemas.ts

import { z } from 'zod';

// ─── Reusable field definitions ───────────────────────────────────────────────

const courseIdField = z
  .string({ error: 'Course ID is required' })
  .trim()
  .min(1, 'Course ID is required');

// ─── Cart Schemas ─────────────────────────────────────────────────────────────

export const AddToCartSchema = z.object({
  courseId: courseIdField,
  priceAtAdd: z
    .number({ error: 'Price is required' })
    .min(0, 'Price cannot be negative')
    .optional()
    .default(0),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;

export const AddToWishlistSchema = z.object({
  courseId: courseIdField,
});

export type AddToWishlistInput = z.infer<typeof AddToWishlistSchema>;
