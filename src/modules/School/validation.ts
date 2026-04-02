import { z } from 'zod/v4';

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  province: z.string().min(1, 'Province is required').trim(),
  postalCode: z.string().min(1, 'Postal code is required').trim(),
  country: z.string().min(1, 'Country is required').trim(),
});

const contactInfoSchema = z.object({
  email: z.email(),
  phone: z.string().min(1, 'Phone is required'),
  website: z.string().url().optional(),
});

const subscriptionSchema = z.object({
  tier: z.enum(['basic', 'standard', 'premium']),
  expiresAt: z.coerce.date(),
});

const settingsSchema = z.object({
  academicYear: z.number().int().positive(),
  terms: z.number().int().positive(),
  gradingSystem: z.enum(['percentage', 'letter', 'gpa']),
});

export const createSchoolSchema = z.object({
  name: z.string().min(1, 'School name is required').trim(),
  address: addressSchema,
  logo: z.string().url().optional(),
  contactInfo: contactInfoSchema,
  subscription: subscriptionSchema,
  modulesEnabled: z.array(z.string()).optional(),
  settings: settingsSchema,
  principal: z.string().trim().optional(),
  emisNumber: z.string().trim().optional(),
  type: z.enum(['primary', 'secondary', 'combined', 'special']).optional(),
}).strict();

export const updateSchoolSchema = z.object({
  name: z.string().min(1).trim().optional(),
  address: addressSchema.optional(),
  logo: z.string().url().optional(),
  contactInfo: contactInfoSchema.optional(),
  subscription: subscriptionSchema.optional(),
  modulesEnabled: z.array(z.string()).optional(),
  settings: settingsSchema.optional(),
  principal: z.string().trim().optional(),
  emisNumber: z.string().trim().optional(),
  type: z.enum(['primary', 'secondary', 'combined', 'special']).optional(),
  isActive: z.boolean().optional(),
}).strict();

export const updateSettingsSchema = settingsSchema.partial().strict();

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
