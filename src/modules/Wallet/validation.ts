import { z } from 'zod/v4';

export const createWalletSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  schoolId: z.string().min(1, 'School ID is required'),
  dailyLimit: z.int().positive('Daily limit must be a positive integer').optional(),
  currency: z.string().optional(),
  autoTopUpEnabled: z.boolean().optional(),
  autoTopUpAmount: z.int().positive('Auto top-up amount must be a positive integer in cents').optional(),
  autoTopUpThreshold: z.int().positive('Auto top-up threshold must be a positive integer in cents').optional(),
});

export const loadMoneySchema = z.object({
  amount: z.int().positive('Amount must be a positive integer in cents'),
  description: z.string().optional(),
});

export const deductMoneySchema = z.object({
  amount: z.int().positive('Amount must be a positive integer in cents'),
  description: z.string().min(1, 'Description is required'),
});

export const linkWristbandSchema = z.object({
  wristbandId: z.string().min(1, 'Wristband ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
});

export const updateDailyLimitSchema = z.object({
  dailyLimit: z.int().positive('Daily limit must be a positive integer in cents'),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type LoadMoneyInput = z.infer<typeof loadMoneySchema>;
export type DeductMoneyInput = z.infer<typeof deductMoneySchema>;
export type LinkWristbandInput = z.infer<typeof linkWristbandSchema>;
export type UpdateDailyLimitInput = z.infer<typeof updateDailyLimitSchema>;
