import { z } from 'zod/v4';

export const checkoutInputSchema = z
  .object({
    planCode: z.enum(['pro_monthly', 'pro_annual']),
  })
  .strict();
export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

export const cancelInputSchema = z.object({}).strict();

export const onegateWebhookSchema = z
  .object({
    success: z.number().optional(),
    status: z.string().optional(),
    organisation_id: z.number().optional(),
    amount: z.string().optional(),
    refunded_amount: z.string().optional(),
    callpay_transaction_id: z.number(),
    reason: z.string().optional(),
    user: z.string().optional(),
    merchant_reference: z.string(),
    gateway_reference: z.string().optional(),
    gateway_response: z.unknown().optional(),
    currency: z.string().optional(),
    payment_key: z.string().optional(),
  })
  .catchall(z.unknown());
export type OneGateWebhookPayload = z.infer<typeof onegateWebhookSchema>;
