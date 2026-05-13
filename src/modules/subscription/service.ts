import type mongoose from 'mongoose';
import { Subscription, type ISubscription } from './model.js';
import { School } from '../School/model.js';

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
}
