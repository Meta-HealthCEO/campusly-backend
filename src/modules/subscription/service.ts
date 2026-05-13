import type mongoose from 'mongoose';
import { Subscription, Plan, type ISubscription } from './model.js';
import { School } from '../School/model.js';

export interface StartTrialInput {
  schoolId: mongoose.Types.ObjectId;
  planCode: string;
  cardTokenGuid: string;
  cardLastFour: string;
  cardBrand: string;
  cardExpiryMonth: number;
  cardExpiryYear: number;
}

export class SubscriptionService {
  static async createInitialFreeSubscription(schoolId: mongoose.Types.ObjectId): Promise<ISubscription> {
    const existing = await Subscription.findOne({ schoolId });
    if (existing) return existing;
    return Subscription.create({
      schoolId,
      subscriberType: 'teacher',
      planCode: 'free',
      status: 'free',
      retryCount: 0,
      gatewayProvider: 'onegate',
    });
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
}
