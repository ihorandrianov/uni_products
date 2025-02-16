import { z } from 'zod';

export const CREATE_PRODUCT_SCHEMA = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(500),
  price: z.number().positive(),
});

export const PRODUCT_SCHEMA = CREATE_PRODUCT_SCHEMA.extend({
  id: z.number().positive(),
});

export const PAGINATION_PARAMS = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val || '10'))
    .pipe(z.number().int().min(1).max(100)),
  cursor: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
    .pipe(z.number().int().default(0)),
});

export const PAGINATION_RESULT = z.object({
  products: z.array(PRODUCT_SCHEMA),
  nextCursor: z.number().nullable(),
});

export const DELETE_PRODUCT_PARAM = z
  .string()
  .transform((val) => parseInt(val || '10'))
  .pipe(z.number().int().min(0));

export type DeleteProductInput = z.input<typeof DELETE_PRODUCT_PARAM>;
export type DeleteProductOutput = z.output<typeof DELETE_PRODUCT_PARAM>;

export type PaginationResult = z.infer<typeof PAGINATION_RESULT>;

export type PaginationInput = z.input<typeof PAGINATION_PARAMS>;
export type PaginationOutput = z.output<typeof PAGINATION_PARAMS>;

export type CreateProductDTO = z.infer<typeof CREATE_PRODUCT_SCHEMA>;

export type Product = z.infer<typeof PRODUCT_SCHEMA>;
