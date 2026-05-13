import crypto from 'crypto';
import type mongoose from 'mongoose';
import { Subscription, Plan, Invoice, CheckoutSession, type ISubscription, type IInvoice } from './model.js';
import { School } from '../School/model.js';
import { getOneGateClient } from '../../lib/onegate/index.js';
import type { ChargeTokenResponse } from '../../lib/onegate/index.js';

export interface StartTrialInput {
  schoolId: mongoose.Types.ObjectId;
  planCode: string;
  cardTokenGuid: string;
  cardLastFour: string;
  cardBrand: string;
  cardExpiryMonth: number;
  cardExpiryYear: number;
}

export interface StartCheckoutInput {
  userId: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  planCode: string;
}

export class SubscriptionStartCheckoutError extends Error {
  constructor(message: string, public readonly code: 'CARD_EXISTS' | 'NOT_PURCHASABLE' | 'NO_SUBSCRIPTION' | 'PLAN_NOT_FOUND') {
    super(message);
    this.name = 'SubscriptionStartCheckoutError';
  }
}

function nanoId(len = 8): string {
  return crypto.randomBytes(len).toString('hex').slice(0, len);
}

function addInterval(date: Date, interval: 'month' | 'year' | null): Date {
  const d = new Date(date);
  if (interval === 'month') d.setMonth(d.getMonth() + 1);
  else if (interval === 'year') d.setFullYear(d.getFullYear() + 1);
  return d;
}

const RETRY_INTERVALS_DAYS = [2, 4, 7];
const MAX_RETRIES = 3;

function recurringReturnUrl(): string {
  return process.env.ONEGATE_RECURRING_RETURN_URL ?? 'https://campusly.app/billing/return';
}

export class SubscriptionService {
  static async createInitialFreeSubscription(schoolId: mongoose.Types.ObjectId): Promise<ISubscription> {
    const existing = await Subscription.findOne({ schoolId });
    if (existing) return existing;
    const sub = await Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'free',
      status: 'free',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
    await SubscriptionService.syncSchoolCache(sub);
    return sub;
  }

  static async syncSchoolCache(sub: ISubscription): Promise<void> {
    await School.updateOne(
      { _id: sub.schoolId },
      {
        $set: {
          'subscription.tier': sub.planCode,
          'subscription.planCode': sub.planCode,
          'subscription.status': sub.status,
          'subscription.expiresAt': sub.currentPeriodEnd,
          'subscription.currentPeriodEnd': sub.currentPeriodEnd,
        },
      },
    );
  }

  static async startTrial(input: StartTrialInput): Promise<ISubscription> {
    const sub = await Subscription.findOne({ schoolId: input.schoolId });
    if (!sub) throw new Error(`No subscription for school ${input.schoolId.toString()}`);
    if (sub.cardTokenGuid) throw new Error('Subscription already has a card on file; use updateCard');

    const plan = await Plan.findOne({ code: input.planCode, isActive: true });
    if (!plan) throw new Error(`Plan ${input.planCode} not found`);
    if (plan.trialDays <= 0) throw new Error(`Plan ${input.planCode} does not support a trial`);

    const trialEndsAt = new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000);

    sub.planCode = plan.code;
    sub.status = 'trialing';
    sub.trialEndsAt = trialEndsAt;
    sub.nextBillingAt = trialEndsAt;
    sub.cardTokenGuid = input.cardTokenGuid;
    sub.cardLastFour = input.cardLastFour;
    sub.cardBrand = input.cardBrand;
    sub.cardExpiryMonth = input.cardExpiryMonth;
    sub.cardExpiryYear = input.cardExpiryYear;
    sub.retryCount = 0;
    sub.lastFailureReason = null;
    await sub.save();

    await SubscriptionService.syncSchoolCache(sub);
    return sub;
  }

  static async cancel(schoolId: mongoose.Types.ObjectId): Promise<ISubscription> {
    const sub = await Subscription.findOne({ schoolId });
    if (!sub) throw new Error('Subscription not found');
    if (sub.status !== 'active' && sub.status !== 'trialing' && sub.status !== 'past_due') {
      throw new Error(`Cannot cancel from status ${sub.status}`);
    }
    if (!sub.currentPeriodEnd && !sub.trialEndsAt) {
      throw new Error('Subscription has no period end');
    }
    sub.status = 'canceled';
    sub.cancelAtPeriodEnd = true;
    sub.canceledAt = new Date();
    sub.nextBillingAt = sub.currentPeriodEnd ?? sub.trialEndsAt;
    await sub.save();
    await SubscriptionService.syncSchoolCache(sub);
    return sub;
  }

  static async resume(schoolId: mongoose.Types.ObjectId): Promise<ISubscription> {
    const sub = await Subscription.findOne({ schoolId });
    if (!sub) throw new Error('Subscription not found');
    if (sub.status !== 'canceled') throw new Error(`Cannot resume from status ${sub.status}`);
    if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() <= Date.now()) {
      throw new Error('Subscription period has ended; resubscribe instead');
    }
    sub.status = 'active';
    sub.cancelAtPeriodEnd = false;
    sub.canceledAt = null;
    sub.nextBillingAt = sub.currentPeriodEnd;
    await sub.save();
    await SubscriptionService.syncSchoolCache(sub);
    return sub;
  }

  static isCardExpired(sub: ISubscription): boolean {
    if (!sub.cardExpiryYear || !sub.cardExpiryMonth) return false;
    const now = new Date();
    const expEnd = new Date(sub.cardExpiryYear, sub.cardExpiryMonth, 0, 23, 59, 59);
    return expEnd.getTime() < now.getTime();
  }

  static async chargeSubscription(subId: mongoose.Types.ObjectId): Promise<void> {
    const sub = await Subscription.findById(subId);
    if (!sub) return;

    if (sub.status === 'canceled') {
      if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() <= Date.now()) {
        await SubscriptionService.endSubscription(sub);
      }
      return;
    }

    if (SubscriptionService.isCardExpired(sub)) {
      sub.status = 'past_due';
      sub.lastFailureReason = 'card_expired';
      sub.nextRetryAt = null;
      sub.nextBillingAt = null;
      await sub.save();
      await SubscriptionService.syncSchoolCache(sub);
      return;
    }

    if (!sub.cardTokenGuid) {
      sub.status = 'free';
      sub.nextBillingAt = null;
      await sub.save();
      await SubscriptionService.syncSchoolCache(sub);
      return;
    }

    const plan = await Plan.findOne({ code: sub.planCode });
    if (!plan) throw new Error(`Plan ${sub.planCode} not found`);

    const merchantReference = 'inv_' + nanoId();
    const periodStart = sub.currentPeriodEnd ?? new Date();
    const periodEnd = addInterval(periodStart, plan.interval);
    const subtotal = plan.amountExclTax;
    const tax = Math.round(subtotal * plan.taxRate);
    const total = subtotal + tax;

    const invoice = await Invoice.create({
      subscriptionId: sub._id,
      schoolId: sub.schoolId,
      planCode: sub.planCode,
      subtotal,
      tax,
      taxRate: plan.taxRate,
      total,
      currency: plan.currency,
      status: 'pending',
      merchantReference,
      periodStart,
      periodEnd,
      attemptedAt: new Date(),
      purpose: 'subscription',
    });

    try {
      const result: ChargeTokenResponse = await getOneGateClient().chargeToken(sub.cardTokenGuid, {
        amount: total / 100,
        reference: merchantReference,
        return_url: recurringReturnUrl(),
      });

      if (result.type === '3ds_redirect') {
        await SubscriptionService.handleChargeFailure(sub, invoice, 'requires_3ds', result);
        return;
      }

      if (result.success === 1) {
        await SubscriptionService.markPaid(sub, invoice, result, periodEnd);
      } else {
        await SubscriptionService.handleChargeFailure(sub, invoice, result.reason ?? 'declined', result);
      }
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : 'gateway_error';
      await SubscriptionService.handleChargeFailure(sub, invoice, reason, { error: reason });
    }
  }

  static async markPaid(
    sub: ISubscription,
    invoice: IInvoice,
    result: { callpay_transaction_id: number; gateway_reference: string; gateway_response: unknown },
    periodEnd: Date,
  ): Promise<void> {
    invoice.status = 'paid';
    invoice.paidAt = new Date();
    invoice.gatewayTransactionId = result.callpay_transaction_id;
    invoice.gatewayReference = result.gateway_reference;
    invoice.gatewayResponse = result.gateway_response;
    await invoice.save();

    sub.status = 'active';
    sub.currentPeriodStart = invoice.periodStart;
    sub.currentPeriodEnd = periodEnd;
    sub.nextBillingAt = periodEnd;
    sub.trialEndsAt = null;
    sub.retryCount = 0;
    sub.nextRetryAt = null;
    sub.lastFailureReason = null;
    await sub.save();
    await SubscriptionService.syncSchoolCache(sub);
  }

  static async handleChargeFailure(
    sub: ISubscription,
    invoice: IInvoice,
    reason: string,
    raw: unknown,
  ): Promise<void> {
    invoice.status = 'failed';
    invoice.failedAt = new Date();
    invoice.failureReason = reason;
    invoice.gatewayResponse = raw;
    await invoice.save();

    sub.lastFailureReason = reason;

    if (sub.status === 'trialing') {
      sub.status = 'free';
      sub.planCode = 'free';
      sub.cardTokenGuid = null;
      sub.cardLastFour = null;
      sub.cardBrand = null;
      sub.cardExpiryMonth = null;
      sub.cardExpiryYear = null;
      sub.trialEndsAt = null;
      sub.nextBillingAt = null;
    } else {
      sub.retryCount = (sub.retryCount ?? 0) + 1;
      if (sub.retryCount > MAX_RETRIES) {
        sub.status = 'free';
        sub.planCode = 'free';
        sub.cardTokenGuid = null;
        sub.cardLastFour = null;
        sub.cardBrand = null;
        sub.cardExpiryMonth = null;
        sub.cardExpiryYear = null;
        sub.nextBillingAt = null;
        sub.nextRetryAt = null;
      } else {
        sub.status = 'past_due';
        const days = RETRY_INTERVALS_DAYS[Math.min(sub.retryCount - 1, RETRY_INTERVALS_DAYS.length - 1)];
        sub.nextRetryAt = new Date(Date.now() + days * 86400000);
        sub.nextBillingAt = sub.nextRetryAt;
      }
    }

    await sub.save();
    await SubscriptionService.syncSchoolCache(sub);
  }

  static async startCheckout(input: StartCheckoutInput): Promise<{ paymentKey: string; sessionId: string; redirectUrl: string }> {
    const sub = await Subscription.findOne({ schoolId: input.schoolId });
    if (!sub) throw new SubscriptionStartCheckoutError('Subscription not found', 'NO_SUBSCRIPTION');
    if (sub.cardTokenGuid) {
      throw new SubscriptionStartCheckoutError('Subscription already has a card on file', 'CARD_EXISTS');
    }

    const existing = await CheckoutSession.findOne({
      userId: input.userId,
      planCode: input.planCode,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });
    if (existing && existing.redirectUrl) {
      return {
        paymentKey: existing.paymentKey,
        sessionId: (existing._id as mongoose.Types.ObjectId).toString(),
        redirectUrl: existing.redirectUrl,
      };
    }

    const plan = await Plan.findOne({ code: input.planCode, isActive: true });
    if (!plan) throw new SubscriptionStartCheckoutError('Plan not found', 'PLAN_NOT_FOUND');
    if (!['pro_monthly', 'pro_annual'].includes(plan.code)) {
      throw new SubscriptionStartCheckoutError('Plan is not purchasable', 'NOT_PURCHASABLE');
    }

    const merchantReference = 'sub_' + nanoId();
    const frontend = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3500';
    const backend = process.env.BACKEND_BASE_URL ?? 'http://localhost:4500';
    // Log so .env reload mistakes are immediately visible in dev. OneGate
    // UAT rejects http://localhost URLs — if you see one of those below,
    // restart the backend after editing .env (tsx watch does not reload .env).
    // eslint-disable-next-line no-console
    console.log('[subscription.startCheckout] frontend=' + frontend + ' backend=' + backend);

    const session = await CheckoutSession.create({
      userId: input.userId,
      schoolId: input.schoolId,
      planCode: input.planCode,
      merchantReference,
      paymentKey: 'pending',
      purpose: 'tokenisation',
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    const sessionId = (session._id as mongoose.Types.ObjectId).toString();
    const result = await getOneGateClient().createPaymentKey({
      payment_type: 'credit_card',
      amount: '1.00',
      merchant_reference: merchantReference,
      success_url: `${frontend}/subscription/success?session=${sessionId}`,
      error_url: `${frontend}/subscription/error?session=${sessionId}`,
      pending_url: `${frontend}/subscription/pending?session=${sessionId}`,
      notify_url: `${backend}/api/webhooks/onegate`,
    });

    session.paymentKey = result.key;
    session.redirectUrl = result.url;
    await session.save();

    return { paymentKey: result.key, sessionId, redirectUrl: result.url };
  }

  static async endSubscription(sub: ISubscription): Promise<void> {
    sub.status = 'free';
    sub.endedAt = new Date();
    sub.planCode = 'free';
    sub.cardTokenGuid = null;
    sub.cardLastFour = null;
    sub.cardBrand = null;
    sub.cardExpiryMonth = null;
    sub.cardExpiryYear = null;
    sub.currentPeriodStart = null;
    sub.currentPeriodEnd = null;
    sub.nextBillingAt = null;
    sub.trialEndsAt = null;
    sub.cancelAtPeriodEnd = false;
    await sub.save();
    await SubscriptionService.syncSchoolCache(sub);
  }
}
