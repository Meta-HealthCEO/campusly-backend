import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createConsentFormSchema = z.object({
  schoolId: objectIdSchema,
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['trip', 'medical', 'general', 'photo', 'data']),
  targetStudents: z.array(objectIdSchema).optional(),
  requiresBothParents: z.boolean().optional(),
  expiryDate: z.string().datetime().optional(),
  attachmentUrl: z.string().url().optional(),
  createdBy: objectIdSchema,
});

export const updateConsentFormSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  type: z.enum(['trip', 'medical', 'general', 'photo', 'data']).optional(),
  targetStudents: z.array(objectIdSchema).optional(),
  requiresBothParents: z.boolean().optional(),
  expiryDate: z.string().datetime().optional(),
  attachmentUrl: z.string().url().optional(),
});

export const recordConsentResponseSchema = z.object({
  formId: objectIdSchema,
  studentId: objectIdSchema,
  parentId: objectIdSchema,
  response: z.enum(['granted', 'denied']),
  ipAddress: z.string().optional(),
  signature: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateConsentFormInput = z.infer<typeof createConsentFormSchema>;
export type UpdateConsentFormInput = z.infer<typeof updateConsentFormSchema>;
export type RecordConsentResponseInput = z.infer<typeof recordConsentResponseSchema>;
