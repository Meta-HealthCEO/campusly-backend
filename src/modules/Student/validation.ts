import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(1, 'Phone is required'),
});

const medicalAidInfoSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  memberNumber: z.string().min(1, 'Member number is required'),
  mainMember: z.string().min(1, 'Main member is required'),
});

const medicalProfileSchema = z.object({
  allergies: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  bloodType: z.string().optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  medicalAidInfo: medicalAidInfoSchema.optional(),
});

export const createStudentSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').optional(),
  lastName: z.string().trim().min(1, 'Last name is required').optional(),
  email: z.email().optional(),
  phone: z.string().trim().optional(),
  userId: objectIdSchema.optional(),
  schoolId: objectIdSchema.optional(),
  gradeId: objectIdSchema,
  classId: objectIdSchema,
  admissionNumber: z.string().min(1, 'Admission number is required'),
  guardianIds: z.array(objectIdSchema).optional(),
  enrollmentDate: z.iso.datetime().optional(),
  enrollmentStatus: z
    .enum(['active', 'transferred', 'graduated', 'expelled', 'withdrawn'])
    .optional(),
  medicalProfile: medicalProfileSchema.optional(),
  dateOfBirth: z.iso.datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  previousSchool: z.string().trim().optional(),
  homeLanguage: z.string().trim().optional(),
  additionalLanguages: z.array(z.string()).optional(),
  transportRequired: z.boolean().optional(),
  afterCareRequired: z.boolean().optional(),
  saIdNumber: z.string().trim().optional(),
  luritsNumber: z.string().trim().optional(),
}).strict();

export const updateStudentSchema = createStudentSchema.partial().strict();

export const updateMedicalProfileSchema = z.object({
  allergies: z.array(z.string()).default([]),
  conditions: z.array(z.string()).default([]),
  bloodType: z.string().optional(),
  emergencyContacts: z.array(emergencyContactSchema).default([]),
  medicalAidInfo: medicalAidInfoSchema.optional(),
}).strict();
