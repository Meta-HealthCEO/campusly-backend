import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const menuItemCategorySchema = z.enum(['snack', 'drink', 'meal', 'stationery', 'other']);

const allergenTypeSchema = z.enum(['nuts', 'dairy', 'gluten', 'eggs', 'soy', 'fish', 'shellfish']);

const nutritionalInfoSchema = z.object({
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
}).optional();

export const createMenuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  schoolId: objectIdSchema,
  description: z.string().optional(),
  price: z.int().positive('Price must be a positive integer in cents'),
  category: menuItemCategorySchema,
  image: z.string().url('Image must be a valid URL').optional(),
  stock: z.int().min(-1, 'Stock must be -1 (unlimited) or a non-negative integer').optional(),
  allergens: z.array(allergenTypeSchema).optional(),
  allergenWarnings: z.array(z.string()).optional(),
  isHalal: z.boolean().optional(),
  isKosher: z.boolean().optional(),
  nutritionalInfo: nutritionalInfoSchema,
  isDailySpecial: z.boolean().optional(),
  stockAlertThreshold: z.int().min(0, 'Stock alert threshold must be non-negative').optional(),
}).strict();

export const updateMenuItemSchema = createMenuItemSchema.partial().strict();

export const placeOrderSchema = z.object({
  schoolId: objectIdSchema,
  studentId: objectIdSchema,
  items: z
    .array(
      z.object({
        menuItemId: objectIdSchema,
        quantity: z.int().positive('Quantity must be a positive integer'),
      }),
    )
    .min(1, 'At least one item is required'),
  paymentMethod: z.enum(['wallet', 'wristband', 'cash']),
  wristbandId: z.string().optional(),
  allergenOverride: z.boolean().optional(),
}).strict();

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
