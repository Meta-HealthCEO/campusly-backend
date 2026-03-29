import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const menuItemCategorySchema = z.enum(['snack', 'drink', 'meal', 'stationery', 'other']);

export const createMenuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  schoolId: objectIdSchema,
  description: z.string().optional(),
  price: z.int().positive('Price must be a positive integer in cents'),
  category: menuItemCategorySchema,
  image: z.string().url('Image must be a valid URL').optional(),
  stock: z.int().min(-1, 'Stock must be -1 (unlimited) or a non-negative integer').optional(),
  nutritionalInfo: z.string().optional(),
  allergenWarnings: z.array(z.string()).optional(),
  isDailySpecial: z.boolean().optional(),
  stockAlertThreshold: z.int().min(0, 'Stock alert threshold must be non-negative').optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

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
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
