import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

export const createWalletSchema = z.object({
  studentId: objectIdSchema,
  schoolId: objectIdSchema,
  dailyLimit: z.int().positive('Daily limit must be a positive integer').optional(),
  currency: z.string().optional(),
  autoTopUpEnabled: z.boolean().optional(),
  autoTopUpAmount: z.int().positive('Auto top-up amount must be a positive integer in cents').optional(),
  autoTopUpThreshold: z.int().positive('Auto top-up threshold must be a positive integer in cents').optional(),
}).strict();

export const loadMoneySchema = z.object({
  amount: z.int().positive('Amount must be a positive integer in cents'),
  description: z.string().optional(),
}).strict();

export const deductMoneySchema = z.object({
  amount: z.int().positive('Amount must be a positive integer in cents'),
  description: z.string().min(1, 'Description is required'),
}).strict();

export const linkWristbandSchema = z.object({
  wristbandId: z.string().min(1, 'Wristband ID is required'),
  studentId: objectIdSchema,
}).strict();

export const updateDailyLimitSchema = z.object({
  dailyLimit: z.int().positive('Daily limit must be a positive integer in cents'),
}).strict();

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type LoadMoneyInput = z.infer<typeof loadMoneySchema>;
export type DeductMoneyInput = z.infer<typeof deductMoneySchema>;
export type LinkWristbandInput = z.infer<typeof linkWristbandSchema>;
export type UpdateDailyLimitInput = z.infer<typeof updateDailyLimitSchema>;
