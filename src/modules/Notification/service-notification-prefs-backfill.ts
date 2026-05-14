// src/modules/Notification/service-notification-prefs-backfill.ts
//
// One-time startup migration: backfill NotificationPreference documents that
// pre-date the Task 4 fields (categories + schoolId).
//
// This MUST run before the new upsert paths in NotificationService go live —
// legacy pref docs that lack schoolId will collide on the { userId: 1 } unique
// index when a new upsert that includes schoolId is attempted, producing E11000.
// Running at server startup (before any request is handled) guarantees the data
// is clean before the upsert code is reachable.
//
// Idempotent — safe to re-run on every deployment:
//   - categories:  only updates docs where the field is absent ($exists: false)
//   - schoolId:    only updates docs where the field is absent or null
//   - Sentinel:    the migration chain skips entirely on subsequent starts once
//                  the sentinel doc is written.

import mongoose from 'mongoose';
import { NotificationPreference } from './model.js';
import { User } from '../Auth/model.js';
import { hasRun, markComplete, tryClaim, releaseClaim } from '../../db/migrations/sentinel.js';
import { logger } from '../../common/logger.js';

const MIGRATION_NAME = 'backfill-notification-preference-task4-fields';

type PrefLean = { _id: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId };
type UserLean = { schoolId?: mongoose.Types.ObjectId };

export async function runNotificationPrefsBackfill(): Promise<void> {
  if (await hasRun(MIGRATION_NAME)) {
    logger.debug('[migrations] notification-prefs-backfill already complete, skipping');
    return;
  }

  const claimed = await tryClaim(MIGRATION_NAME);
  if (!claimed) {
    logger.debug('[migrations] notification-prefs-backfill claimed by another instance, skipping');
    return;
  }

  try {
    // ── 1. Backfill categories ──────────────────────────────────────────────
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
      `[migrations] notification-prefs: categories backfilled on ${categoriesResult.modifiedCount} doc(s)`,
    );

    // ── 2. Backfill schoolId ────────────────────────────────────────────────
    const orphans = await NotificationPreference.find({
      $or: [{ schoolId: { $exists: false } }, { schoolId: null }],
    })
      .select('_id userId')
      .lean<PrefLean[]>();

    logger.info(
      `[migrations] notification-prefs: ${orphans.length} doc(s) missing schoolId`,
    );

    let schoolIdBackfilled = 0;
    let schoolIdSkipped = 0;

    for (const pref of orphans) {
      try {
        const user = await User.findById(pref.userId)
          .select('schoolId')
          .lean<UserLean | null>();

        if (!user || !user.schoolId) {
          schoolIdSkipped += 1;
          logger.warn(
            `[migrations] notification-prefs: skipping pref ${String(pref._id)} — user ${String(pref.userId)} not found or has no schoolId`,
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
          '[migrations] notification-prefs: failed to backfill schoolId',
        );
        schoolIdSkipped += 1;
      }
    }

    logger.info(
      `[migrations] notification-prefs: schoolId backfilled on ${schoolIdBackfilled} doc(s); skipped ${schoolIdSkipped}`,
    );

    await markComplete(MIGRATION_NAME);
    logger.info('[migrations] notification-prefs-backfill complete');
  } catch (err: unknown) {
    await releaseClaim(MIGRATION_NAME);
    throw err;
  }
}
