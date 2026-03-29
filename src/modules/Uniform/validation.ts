import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const uniformCategorySchema = z.enum(['shirt', 'pants', 'skirt', 'blazer', 'tie', 'shoes', 'sports', 'other']);

export const createUniformItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  schoolId: objectIdSchema,
  description: z.string().optional(),
  category: uniformCategorySchema,
  sizes: z.array(z.string()).optional(),
  price: z.number().int().positive('Price must be a positive integer in cents'),
  stock: z.number().int().nonnegative('Stock must be a non-negative integer').optional(),
  image: z.string().url('Image must be a valid URL').optional(),
  isAvailable: z.boolean().optional(),
});

export const updateUniformItemSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  category: uniformCategorySchema.optional(),
  sizes: z.array(z.string()).optional(),
  price: z.number().int().positive('Price must be a positive integer in cents').optional(),
  stock: z.number().int().nonnegative('Stock must be a non-negative integer').optional(),
  image: z.string().url('Image must be a valid URL').optional(),
  isAvailable: z.boolean().optional(),
});

export const createUniformOrderSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  items: z
    .array(
      z.object({
        uniformItemId: objectIdSchema,
        size: z.string().min(1, 'Size is required'),
        quantity: z.number().int().positive('Quantity must be a positive integer'),
        unitPrice: z.number().int().nonnegative('Unit price must be a non-negative integer in cents'),
        totalPrice: z.number().int().nonnegative('Total price must be a non-negative integer in cents'),
      }),
    )
    .min(1, 'At least one item is required'),
  totalAmount: z.number().int().nonnegative('Total amount must be a non-negative integer in cents'),
});

export const updateUniformOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'ready', 'collected', 'cancelled']),
});

export type CreateUniformItemInput = z.infer<typeof createUniformItemSchema>;
export type UpdateUniformItemInput = z.infer<typeof updateUniformItemSchema>;
export type CreateUniformOrderInput = z.infer<typeof createUniformOrderSchema>;
export type UpdateUniformOrderStatusInput = z.infer<typeof updateUniformOrderStatusSchema>;
