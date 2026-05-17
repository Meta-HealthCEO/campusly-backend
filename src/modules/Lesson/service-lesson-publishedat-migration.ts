import { Lesson } from './model.js';
import { hasRun, markComplete, tryClaim, releaseClaim } from '../../db/migrations/sentinel.js';
import { logger } from '../../common/logger.js';

const MIGRATION_NAME = 'lesson-status-to-publishedAt';

/**
 * The old lesson model had a `status: 'draft' | 'ready' | 'taught'` lifecycle.
 * It has been replaced with a single `publishedAt: Date | null` field that
 * gates student visibility, while "taught" now lives entirely on each
 * per-class assignment.
 *
 * This migration:
 *   - `status === 'draft'`       → `publishedAt: null`
 *   - `status in [ready, taught]` → `publishedAt: updatedAt` (an audit-trail
 *                                    approximation; the real publish event
 *                                    was not recorded)
 *   - Removes the now-defunct `status` field from every document.
 *
 * Idempotent. Safe to re-run.
 */
export async function runLessonPublishedAtMigration(): Promise<void> {
  if (await hasRun(MIGRATION_NAME)) {
    logger.debug('[migrations] lesson-publishedAt already complete, skipping');
    return;
  }

  const claimed = await tryClaim(MIGRATION_NAME);
  if (!claimed) {
    logger.debug('[migrations] lesson-publishedAt lock held by another instance, skipping');
    return;
  }

  try {
    const collection = Lesson.collection;

    // Step 1: backfill publishedAt from legacy status where the field hasn't
    // been touched yet (publishedAt is missing OR null and the legacy status
    // exists). Two narrow updates, one per side of the gate.
    const draftRes = await collection.updateMany(
      { status: 'draft', publishedAt: { $exists: false } },
      { $set: { publishedAt: null } },
    );

    const publishedRes = await collection.updateMany(
      { status: { $in: ['ready', 'taught'] }, publishedAt: { $exists: false } },
      // The legacy status had no timestamp for the publish event; updatedAt is
      // the closest signal we have. Use $rename-equivalent: copy updatedAt
      // into publishedAt via aggregation pipeline update.
      [{ $set: { publishedAt: '$updatedAt' } }],
    );

    // Step 2: strip the legacy status field from every document that still
    // carries it. Done unconditionally so the schema stays clean.
    const unsetRes = await collection.updateMany(
      { status: { $exists: true } },
      { $unset: { status: '' } },
    );

    await markComplete(MIGRATION_NAME);
    logger.info(
      {
        unpublishedBackfilled: draftRes.modifiedCount,
        publishedBackfilled: publishedRes.modifiedCount,
        statusFieldsStripped: unsetRes.modifiedCount,
      },
      '[migrations] lesson-publishedAt complete',
    );
  } catch (err: unknown) {
    await releaseClaim(MIGRATION_NAME);
    logger.error({ err }, '[migrations] lesson-publishedAt failed; lock released for retry');
    throw err;
  }
}
