import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const categorySchema = z.enum([
  'clothing', 'stationery', 'electronics', 'sports_equipment',
  'lunch_box', 'bag', 'jewellery', 'other',
]);

export const reportItemSchema = z.object({
  schoolId: objectIdSchema,
  type: z.enum(['found', 'lost']),
  itemName: z.string().min(1, 'Item name is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  category: categorySchema,
  locationFound: z.string().trim().optional(),
  locationLost: z.string().trim().optional(),
  dateFound: z.string().datetime().optional(),
  dateLost: z.string().datetime().optional(),
  photos: z.array(z.string().url()).optional(),
  studentId: objectIdSchema.optional(),
}).strict();

export type ReportItemInput = z.infer<typeof reportItemSchema>;

export const claimItemSchema = z.object({
  studentId: objectIdSchema.optional(),
}).strict();

export type ClaimItemInput = z.infer<typeof claimItemSchema>;

export const matchItemSchema = z.object({}).strict();

export const archiveItemsSchema = z.object({
  schoolId: objectIdSchema,
}).strict();

export type ArchiveItemsInput = z.infer<typeof archiveItemsSchema>;
