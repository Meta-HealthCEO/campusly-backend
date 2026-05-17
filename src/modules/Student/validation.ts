import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const studentBaseSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').optional(),
  lastName: z.string().trim().min(1, 'Last name is required').optional(),
  email: z.email().optional(),
  phone: z.string().trim().optional(),
  userId: objectIdSchema.optional(),
  schoolId: objectIdSchema.optional(),
  gradeId: objectIdSchema,
  classId: objectIdSchema,
  admissionNumber: z.string().trim().optional(),
  guardianIds: z.array(objectIdSchema).optional(),
  enrollmentDate: z.iso.datetime().optional(),
  enrollmentStatus: z
    .enum(['active', 'transferred', 'graduated', 'expelled', 'withdrawn'])
    .optional(),
  dateOfBirth: z.iso.datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  previousSchool: z.string().trim().optional(),
  homeLanguage: z.string().trim().optional(),
  additionalLanguages: z.array(z.string()).optional(),
  transportRequired: z.boolean().optional(),
  afterCareRequired: z.boolean().optional(),
  saIdNumber: z.string().trim().optional(),
  luritsNumber: z.string().trim().optional(),
  deliveryMethod: z.enum(['email', 'slip']),
}).strict();

export const createStudentSchema = studentBaseSchema.superRefine((data, ctx) => {
  if (data.deliveryMethod === 'email' && !data.email) {
    ctx.addIssue({
      code: 'custom',
      path: ['email'],
      message: 'Email is required when delivery method is email-invite',
    });
  }
});

export const updateStudentSchema = studentBaseSchema.partial().strict();
