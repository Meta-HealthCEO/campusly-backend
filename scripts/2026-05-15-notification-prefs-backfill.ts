/**
 * Backfill NotificationPreference documents that pre-date the Task 4 fields.
 *
 * What it does (idempotent — safe to re-run):
 *   1. Adds `categories` (all five flags = true) to any doc missing the field.
 *   2. Sets `schoolId` on any doc missing it, derived from the owning User's schoolId.
 *      Docs whose User cannot be found, or whose User has no schoolId, are skipped
 *      with a warning so the operator can investigate.
 *
 * Once this has run in production, a follow-up commit can:
 *   - Set schoolId to required: true in the Mongoose schema.
 *   - Replace the { userId: 1 } unique index with { userId: 1, schoolId: 1 }.
 *
 * Run:
 *   npx tsx scripts/2026-05-15-notification-prefs-backfill.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '../src/config/env.js';
import { NotificationPreference } from '../src/modules/Notification/model.js';
import { User } from '../src/modules/Auth/model.js';
import { logger } from '../src/common/logger.js';

async function main(): Promise<void> {
  await mongoose.connect(config.mongodb.uri);
  logger.info('Connected to MongoDB. Running NotificationPreference backfill...');

  // ── 1. Backfill categories ────────────────────────────────────────────────
  const categoriesResult = await NotificationPreference.updateMany(
    { categories: { $exists: false } },
    {
      $set: {
        categories: {
          homework: true,
          grades: true,
          attendance: true,
          billing: true,
          announcements: true,
        },
      },
    },
  );
  logger.info(
    `  categories backfilled on ${categoriesResult.modifiedCount} document(s)`,
  );

  // ── 2. Backfill schoolId ─────────────────────────────────────────────────
  type PrefLean = { _id: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId };

  const orphans = await NotificationPreference.find({
    $or: [{ schoolId: { $exists: false } }, { schoolId: null }],
  })
    .select('_id userId')
    .lean<PrefLean[]>();

  logger.info(`  ${orphans.length} pref document(s) missing schoolId`);

  let schoolIdBackfilled = 0;
  let schoolIdSkipped = 0;

  for (const pref of orphans) {
    try {
      type UserLean = { schoolId?: mongoose.Types.ObjectId };
      const user = await User.findById(pref.userId)
        .select('schoolId')
        .lean<UserLean | null>();

      if (!user || !user.schoolId) {
        schoolIdSkipped += 1;
        logger.warn(
          `  skipping pref ${String(pref._id)} — user ${String(pref.userId)} not found or has no schoolId`,
        );
        continue;
      }

      await NotificationPreference.updateOne(
        { _id: pref._id },
        { $set: { schoolId: user.schoolId } },
      );
      schoolIdBackfilled += 1;
    } catch (err: unknown) {
      logger.error(
        { err, prefId: String(pref._id) },
        'Failed to backfill schoolId on NotificationPreference',
      );
      schoolIdSkipped += 1;
    }
  }

  logger.info(
    `  schoolId backfilled on ${schoolIdBackfilled} document(s); skipped ${schoolIdSkipped}`,
  );

  logger.info('Backfill complete.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err: unknown) => {
  logger.error({ err }, 'Backfill migration failed');
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors
  }
  process.exit(1);
});
