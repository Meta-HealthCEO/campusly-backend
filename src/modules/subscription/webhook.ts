import type { Request, Response } from 'express';
import crypto from 'crypto';
import { WebhookEvent, Subscription, CheckoutSession, Invoice } from './model.js';
import { SubscriptionService } from './service.js';
import { getOneGateClient } from '../../lib/onegate/index.js';
import type { GatewayTransactionResponse } from '../../lib/onegate/index.js';
import { onegateWebhookSchema } from './validation.js';
import { logger } from '../../common/logger.js';

function hashPayload(payload: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export async function handleOneGateWebhook(req: Request, res: Response): Promise<void> {
  const parsed = onegateWebhookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'bad payload' });
    return;
  }
  const payload = parsed.data;

  const existing = await WebhookEvent.findOne({ gatewayTransactionId: payload.callpay_transaction_id });
  if (existing && existing.status === 'processed') {
    res.json({ ok: true, idempotent: true });
    return;
  }

  const event = existing ?? (await WebhookEvent.create({
    gatewayTransactionId: payload.callpay_transaction_id,
    payloadHash: hashPayload(payload),
    rawPayload: payload,
    status: 'pending',
    verifiedViaLookup: false,
  }));

  try {
    const lookup = await getOneGateClient().getTransaction(payload.callpay_transaction_id);
    event.verifiedViaLookup = true;

    const isRefund = payload.refunded_amount !== undefined && payload.amount === undefined;
    const ref = lookup.merchant_reference;

    if (ref.startsWith('sub_') && !isRefund) {
      await processTokenisation(ref, lookup);
    } else if (ref.startsWith('sub_') && isRefund) {
      await processVerificationRefund(ref, lookup);
    } else if (ref.startsWith('inv_') && !isRefund) {
      await processInvoiceCharge(ref, lookup);
    } else if (ref.startsWith('inv_') && isRefund) {
      await processInvoiceRefund(ref, lookup);
    }

    event.status = 'processed';
    event.processedAt = new Date();
    await event.save();
    res.json({ ok: true });
  } catch (err: unknown) {
    event.status = 'failed';
    event.error = err instanceof Error ? err.message : String(err);
    await event.save();
    logger.error({ err, txId: payload.callpay_transaction_id }, 'OneGate webhook processing failed');
    res.status(500).json({ error: 'webhook processing failed' });
  }
}

async function processTokenisation(merchantRef: string, lookup: GatewayTransactionResponse): Promise<void> {
  const session = await CheckoutSession.findOne({ merchantReference: merchantRef });
  if (!session) throw new Error(`No CheckoutSession for ${merchantRef}`);

  if (lookup.successful !== 1) {
    session.status = 'failed';
    await session.save();
    return;
  }

  const client = getOneGateClient();
  // Per spike findings: the R1 verification charge alone does NOT register
  // a reusable token. We must explicitly call /customer-token with the
  // merchant_reference to register the saved card.
  const token = await client.createCustomerToken(merchantRef);

  const [m, y] = token.expiry_date.split('-').map((s) => parseInt(s, 10));
  await SubscriptionService.startTrial({
    schoolId: session.schoolId,
    planCode: session.planCode,
    cardTokenGuid: token.guid,
    cardLastFour: token.last_four ?? '',
    cardBrand: token.brand ?? '',
    cardExpiryMonth: m,
    cardExpiryYear: y,
  });

  session.status = 'completed';
  await session.save();

  // Refund the R1 verification charge
  await client.refundTransaction(lookup.id);
}

async function processVerificationRefund(_merchantRef: string, _lookup: GatewayTransactionResponse): Promise<void> {
  // Log-only — the verification R1 is not represented as an Invoice row.
  // Future: persist an Invoice with purpose='verification' for audit.
}

async function processInvoiceCharge(merchantRef: string, lookup: GatewayTransactionResponse): Promise<void> {
  const invoice = await Invoice.findOne({ merchantReference: merchantRef });
  if (!invoice) return;
  if (invoice.status === 'pending' && lookup.successful === 1) {
    invoice.status = 'paid';
    invoice.paidAt = new Date();
    invoice.gatewayTransactionId = lookup.id;
    invoice.gatewayReference = lookup.gateway_reference;
    invoice.gatewayResponse = lookup;
    await invoice.save();

    const sub = await Subscription.findById(invoice.subscriptionId);
    if (sub && sub.status !== 'active') {
      sub.status = 'active';
      sub.currentPeriodStart = invoice.periodStart;
      sub.currentPeriodEnd = invoice.periodEnd;
      sub.nextBillingAt = invoice.periodEnd;
      sub.trialEndsAt = null;
      sub.retryCount = 0;
      sub.nextRetryAt = null;
      sub.lastFailureReason = null;
      await sub.save();
      await SubscriptionService.syncSchoolCache(sub);
    }
  }
}

async function processInvoiceRefund(merchantRef: string, lookup: GatewayTransactionResponse): Promise<void> {
  const invoice = await Invoice.findOne({ merchantReference: merchantRef });
  if (!invoice) return;
  const refunded = Math.round(parseFloat(lookup.refunded_amount) * 100);
  invoice.refundedAmount = refunded;
  invoice.status = refunded >= invoice.total ? 'refunded' : 'partially_refunded';
  await invoice.save();
}
