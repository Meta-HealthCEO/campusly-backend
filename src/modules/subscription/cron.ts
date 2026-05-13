import type mongoose from 'mongoose';
import { Worker, Queue } from 'bullmq';
import { Subscription } from './model.js';
import { SubscriptionService } from './service.js';
import { redisConnection } from '../../jobs/queues.js';
import { logger } from '../../common/logger.js';

const STALE_LOCK_MS = 10 * 60 * 1000;
const BATCH_SIZE = 50;

export async function processBillingTick(): Promise<void> {
  await releaseStaleLocks();

  const now = new Date();
  const due = await Subscription.find({
    nextBillingAt: { $lte: now },
    status: { $in: ['trialing', 'active', 'past_due', 'canceled'] },
    processingLockedAt: null,
  }).limit(BATCH_SIZE);

  for (const sub of due) {
    const claimed = await Subscription.findOneAndUpdate(
      { _id: sub._id, processingLockedAt: null },
      { $set: { processingLockedAt: now } },
      { new: true },
    );
    if (!claimed) continue;
    try {
      await SubscriptionService.chargeSubscription(sub._id as mongoose.Types.ObjectId);
    } finally {
      await Subscription.updateOne({ _id: sub._id }, { $set: { processingLockedAt: null } });
    }
  }
}

async function releaseStaleLocks(): Promise<void> {
  const cutoff = new Date(Date.now() - STALE_LOCK_MS);
  await Subscription.updateMany(
    { processingLockedAt: { $lt: cutoff } },
    { $set: { processingLockedAt: null } },
  );
}

export const subscriptionBillingQueue = new Queue('subscription-billing', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

export function createSubscriptionBillingWorker(): Worker {
  const worker = new Worker(
    'subscription-billing',
    async () => {
      logger.info('[SubscriptionBillingJob] Tick start');
      await processBillingTick();
      logger.info('[SubscriptionBillingJob] Tick complete');
    },
    { connection: redisConnection },
  );

  worker.on('failed', (job, err) => {
    logger.error(`[SubscriptionBillingJob] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}

export async function scheduleSubscriptionBilling(): Promise<void> {
  await subscriptionBillingQueue.upsertJobScheduler(
    'subscription-billing-tick',
    { every: 5 * 60 * 1000 },
    { name: 'tick', data: {} },
  );
  logger.info('[SubscriptionBillingJob] Scheduled 5-minute billing tick');
}
