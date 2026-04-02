import { z } from 'zod/v4';
import { objectIdSchema } from '../../common/validation.js';

export const initiatePaymentSchema = z.object({
  invoiceIds: z.array(objectIdSchema).min(1, 'At least one invoice ID is required'),
  returnUrl: z.url('Return URL must be a valid URL'),
  cancelUrl: z.url('Cancel URL must be a valid URL'),
}).strict();

export const initiateWalletTopupSchema = z.object({
  walletId: objectIdSchema,
  amount: z.number().int().min(500, 'Minimum top-up amount is R5 (500 cents)'),
  returnUrl: z.url('Return URL must be a valid URL'),
  cancelUrl: z.url('Cancel URL must be a valid URL'),
}).strict();

export const gatewayConfigSchema = z.object({
  provider: z.enum(['payfast', 'yoco', 'paystack', 'stripe']),
  credentials: z.object({
    merchantId: z.string().min(1, 'Merchant ID is required'),
    merchantKey: z.string().min(1, 'Merchant key is required'),
    passphrase: z.string().min(1, 'Passphrase is required'),
    sandboxMode: z.boolean(),
  }).strict(),
  enabled: z.boolean(),
}).strict();

export const refundSchema = z.object({
  onlinePaymentId: objectIdSchema,
  amount: z.number().int().min(1, 'Refund amount must be at least 1 cent'),
  reason: z.string().min(1, 'Refund reason is required'),
}).strict();

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type InitiateWalletTopupInput = z.infer<typeof initiateWalletTopupSchema>;
export type GatewayConfigInput = z.infer<typeof gatewayConfigSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
