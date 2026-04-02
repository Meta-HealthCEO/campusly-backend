import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const sourceSystemEnum = z.enum(['d6_connect', 'karri', 'adam', 'schooltool', 'excel', 'csv']);

export const uploadFileSchema = z.object({
  schoolId: objectIdSchema,
  sourceSystem: sourceSystemEnum,
  originalName: z.string().min(1, 'File name is required').trim(),
  fileUrl: z.string().min(1, 'File URL is required'),
  fileSize: z.number().positive('File size must be positive'),
}).strict();

export const updateMappingSchema = z.object({
  mapping: z.record(z.string(), z.string()).refine(
    (val) => Object.keys(val).length > 0,
    'At least one field mapping is required',
  ),
}).strict();

export const createTemplateSchema = z.object({
  sourceSystem: sourceSystemEnum,
  entityType: z.enum(['student', 'parent', 'staff', 'grade', 'fee']),
  fieldMappings: z
    .array(
      z.object({
        sourceField: z.string().min(1, 'Source field is required').trim(),
        targetField: z.string().min(1, 'Target field is required').trim(),
        transform: z.string().trim().optional(),
      }),
    )
    .min(1, 'At least one field mapping is required'),
  isDefault: z.boolean().optional(),
}).strict();

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type UpdateMappingInput = z.infer<typeof updateMappingSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
