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
  lowStockThreshold: z.number().int().nonnegative('Low stock threshold must be a non-negative integer').optional(),
  sizeGuideUrl: z.string().url('Size guide URL must be a valid URL').optional(),
}).strict();

export const updateUniformItemSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  category: uniformCategorySchema.optional(),
  sizes: z.array(z.string()).optional(),
  price: z.number().int().positive('Price must be a positive integer in cents').optional(),
  stock: z.number().int().nonnegative('Stock must be a non-negative integer').optional(),
  image: z.string().url('Image must be a valid URL').optional(),
  isAvailable: z.boolean().optional(),
  lowStockThreshold: z.number().int().nonnegative('Low stock threshold must be a non-negative integer').optional(),
  sizeGuideUrl: z.string().url('Size guide URL must be a valid URL').optional(),
}).strict();

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
}).strict();

export const updateUniformOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'confirmed', 'ready', 'collected', 'cancelled']),
}).strict();

const secondHandConditionSchema = z.enum(['new', 'like_new', 'good', 'fair']);

export const createSecondHandListingSchema = z.object({
  schoolId: objectIdSchema,
  parentId: objectIdSchema,
  itemName: z.string().min(1, 'Item name is required'),
  size: z.string().min(1, 'Size is required'),
  condition: secondHandConditionSchema,
  price: z.number().int().positive('Price must be a positive integer in cents'),
  photos: z.array(z.string()).optional(),
  description: z.string().optional(),
}).strict();

export const updateSecondHandListingSchema = z.object({
  itemName: z.string().min(1, 'Item name is required').optional(),
  size: z.string().min(1, 'Size is required').optional(),
  condition: secondHandConditionSchema.optional(),
  price: z.number().int().positive('Price must be a positive integer in cents').optional(),
  photos: z.array(z.string()).optional(),
  description: z.string().optional(),
}).strict();

// ─── Size Guide Schemas ────────────────────────────────────────────────────

const measurementSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  chest: z.string().min(1, 'Chest measurement is required'),
  waist: z.string().min(1, 'Waist measurement is required'),
  length: z.string().min(1, 'Length measurement is required'),
});

export const createSizeGuideSchema = z.object({
  uniformItemId: objectIdSchema,
  schoolId: objectIdSchema,
  sizeChartImageUrl: z.string().url('Size chart image URL must be a valid URL'),
  measurements: z.array(measurementSchema).optional(),
  notes: z.string().optional(),
}).strict();

export const updateSizeGuideSchema = z.object({
  sizeChartImageUrl: z.string().url('Size chart image URL must be a valid URL').optional(),
  measurements: z.array(measurementSchema).optional(),
  notes: z.string().optional(),
}).strict();

// ─── Pre Order Schemas ─────────────────────────────────────────────────────

const preOrderStatusSchema = z.enum(['pre_order', 'available', 'ready', 'collected']);

export const createPreOrderSchema = z.object({
  uniformItemId: objectIdSchema,
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  size: z.string().min(1, 'Size is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  availableDate: z.coerce.date(),
  notes: z.string().optional(),
}).strict();

export const updatePreOrderStatusSchema = z.object({
  status: preOrderStatusSchema,
}).strict();

// ─── Type Exports ──────────────────────────────────────────────────────────

export type CreateUniformItemInput = z.infer<typeof createUniformItemSchema>;
export type UpdateUniformItemInput = z.infer<typeof updateUniformItemSchema>;
export type CreateUniformOrderInput = z.infer<typeof createUniformOrderSchema>;
export type UpdateUniformOrderStatusInput = z.infer<typeof updateUniformOrderStatusSchema>;
export type CreateSecondHandListingInput = z.infer<typeof createSecondHandListingSchema>;
export type UpdateSecondHandListingInput = z.infer<typeof updateSecondHandListingSchema>;
export type CreateSizeGuideInput = z.infer<typeof createSizeGuideSchema>;
export type UpdateSizeGuideInput = z.infer<typeof updateSizeGuideSchema>;
export type CreatePreOrderInput = z.infer<typeof createPreOrderSchema>;
export type UpdatePreOrderStatusInput = z.infer<typeof updatePreOrderStatusSchema>;
