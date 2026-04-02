import { z } from 'zod/v4';

const glMappingSchema = z.object({
  feeCategory: z.string().min(1, 'Fee category is required'),
  accountCode: z.string().min(1, 'Account code is required'),
  accountName: z.string().min(1, 'Account name is required'),
  vatCode: z.enum(['standard', 'zero_rated', 'exempt']).default('zero_rated'),
}).strict();

const bankMappingSchema = z.object({
  paymentMethod: z.string().min(1, 'Payment method is required'),
  bankAccountCode: z.string().min(1, 'Bank account code is required'),
  bankAccountName: z.string().min(1, 'Bank account name is required'),
}).strict();

export const configSchema = z.object({
  provider: z.enum(['sage_one', 'xero', 'quickbooks', 'pastel', 'none']),
  vatRegistered: z.boolean(),
  vatNumber: z.string().optional(),
  glMapping: z.array(glMappingSchema).default([]),
  bankMapping: z.array(bankMappingSchema).default([]),
  syncFrequency: z.enum(['manual', 'daily', 'weekly']).default('manual'),
}).strict();

export const exportSchema = z.object({
  format: z.enum(['csv', 'sage_csv', 'xero_csv', 'pastel_csv', 'quickbooks_iif']),
  dateFrom: z.string().min(1, 'Start date is required'),
  dateTo: z.string().min(1, 'End date is required'),
}).strict();
