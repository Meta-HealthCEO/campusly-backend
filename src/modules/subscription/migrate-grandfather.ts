import type mongoose from 'mongoose';
import { Subscription } from './model.js';
import { School } from '../School/model.js';
import { SubscriptionService } from './service.js';

// 90 days from cutover (2026-05-13 → 2026-08-11). Override via
// GRANDFATHER_CUTOFF_ISO if the rollout date shifts.
export const GRANDFATHER_CUTOFF = new Date(
  process.env.GRANDFATHER_CUTOFF_ISO ?? '2026-08-13T00:00:00Z',
);

export async function migrateGrandfather(): Promise<{
  grandfathered: number;
  freeBackfilled: number;
}> {
  let grandfathered = 0;
  let freeBackfilled = 0;

  const schools = await School.find({}).select('_id plan createdAt');
  for (const school of schools) {
    const existing = await Subscription.findOne({ schoolId: school._id });
    if (existing) continue;

    const schoolId = school._id as mongoose.Types.ObjectId;

    if (school.plan === 'standalone') {
      const sub = await Subscription.create({
        schoolId,
        subscriberType: 'teacher',
        planCode: 'pro_monthly',
        status: 'active',
        currentPeriodStart: school.createdAt ?? new Date(),
        currentPeriodEnd: GRANDFATHER_CUTOFF,
        nextBillingAt: GRANDFATHER_CUTOFF,
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        retryCount: 0,
        gatewayProvider: 'onegate',
      });
      await SubscriptionService.syncSchoolCache(sub);
      grandfathered++;
    } else {
      await SubscriptionService.createInitialFreeSubscription(schoolId);
      freeBackfilled++;
    }
  }

  return { grandfathered, freeBackfilled };
}

// CLI mode: detect direct invocation via tsx. Same pattern as seed.ts.
const invokedPath = process.argv[1]?.replace(/\\/g, '/') ?? '';
const moduleUrl = import.meta.url;
if (
  invokedPath &&
  (moduleUrl === `file:///${invokedPath}` ||
    moduleUrl === `file://${invokedPath}` ||
    moduleUrl.endsWith(invokedPath))
) {
  (async () => {
    const m = await import('mongoose');
    await m.default.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/campusly');
    const result = await migrateGrandfather();
    console.log('Migration result:', result);
    await m.default.disconnect();
  })().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
