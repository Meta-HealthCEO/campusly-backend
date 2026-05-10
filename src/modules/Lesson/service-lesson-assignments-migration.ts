import mongoose from 'mongoose';
import { Lesson } from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { hasRun, markComplete, tryClaim, releaseClaim } from '../../db/migrations/sentinel.js';
import { logger } from '../../common/logger.js';

const MIGRATION_NAME = 'lesson-classid-to-assigned-classes';
const CHUNK_SIZE = 1000;

/**
 * Pre-refactor every Lesson had `classId: ObjectId` and `date: Date`. The
 * refactor decouples the pack from the class — `assignedClasses[]` carries the
 * per-class scheduledDate/status. This migration walks every Lesson, and for
 * those still in the legacy shape produces a single-entry assignedClasses[]
 * mirroring the old (classId, date) pair, plus denormalises termNumber from
 * the CurriculumNode.
 *
 * Idempotent: if a Lesson already has a non-empty assignedClasses[] we skip
 * it. Safe to re-run after a partial failure.
 *
 * The legacy `classId` and `date` fields stay in the documents — Mongoose
 * strict mode will silently strip them on the next save under the new schema.
 * We don't $unset them here because doing so on a 100k-doc collection adds
 * latency for zero functional benefit.
 */
export async function runLessonAssignmentsMigration(): Promise<void> {
  if (await hasRun(MIGRATION_NAME)) {
    logger.debug('[migrations] lesson-assignments already complete, skipping');
    return;
  }

  const claimed = await tryClaim(MIGRATION_NAME);
  if (!claimed) {
    logger.debug('[migrations] lesson-assignments lock held by another instance, skipping');
    return;
  }

  try {
    // Read straight from the underlying collection so we see the legacy
    // classId/date fields that the new ILesson interface no longer declares
    // (Mongoose .lean<ILesson>() typing would imply they don't exist).
    const collection = Lesson.collection;

    // Pull only the docs that still need migrating: missing assignedClasses
    // entirely, or have an empty array.
    const cursor = collection.find(
      {
        $or: [
          { assignedClasses: { $exists: false } },
          { assignedClasses: { $size: 0 } },
        ],
      },
      {
        projection: {
          _id: 1,
          classId: 1,
          date: 1,
          status: 1,
          curriculumNodeId: 1,
          termNumber: 1,
        },
      },
    );

    type LegacyLesson = {
      _id: mongoose.Types.ObjectId;
      classId?: mongoose.Types.ObjectId;
      date?: Date;
      status?: string;
      curriculumNodeId?: mongoose.Types.ObjectId;
      termNumber?: number | null;
    };

    let buffer: LegacyLesson[] = [];
    let migrated = 0;
    let skipped = 0;
    let total = 0;

    const flush = async (): Promise<void> => {
      if (buffer.length === 0) return;

      // Bulk-look up termNumber for any docs that don't already have it set.
      // Reading the denormalised CurriculumNode.termNumber keeps the migration
      // self-contained — no transitive joins required at runtime.
      const nodeIds = Array.from(
        new Set(
          buffer
            .filter((d) => d.termNumber == null && d.curriculumNodeId)
            .map((d) => d.curriculumNodeId!.toString()),
        ),
      ).map((id) => new mongoose.Types.ObjectId(id));

      const nodes = nodeIds.length
        ? await CurriculumNode.find(
            { _id: { $in: nodeIds } },
            { _id: 1, termNumber: 1 },
          ).lean<{ _id: mongoose.Types.ObjectId; termNumber?: number | null }[]>()
        : [];
      const nodeTermMap = new Map<string, number | null>();
      for (const n of nodes) {
        nodeTermMap.set(n._id.toString(), n.termNumber ?? null);
      }

      const ops: Array<{
        updateOne: {
          filter: { _id: mongoose.Types.ObjectId };
          update: Record<string, unknown>;
        };
      }> = [];

      for (const doc of buffer) {
        // Cannot synthesise an assignment without a classId+date. Such legacy
        // docs (if any exist from earlier broken writes) get an empty
        // assignedClasses array — they become library lessons.
        if (!doc.classId || !doc.date) {
          ops.push({
            updateOne: {
              filter: { _id: doc._id },
              update: { $set: { assignedClasses: [] } },
            },
          });
          skipped += 1;
          continue;
        }

        const wasTaught = doc.status === 'taught';
        const assignment: Record<string, unknown> = {
          _id: new mongoose.Types.ObjectId(),
          classId: doc.classId,
          scheduledDate: doc.date,
          status: wasTaught ? 'taught' : 'planned',
        };
        if (wasTaught) assignment.taughtAt = doc.date;

        const setOps: Record<string, unknown> = {
          assignedClasses: [assignment],
        };

        // Backfill termNumber if missing on the lesson but available on the
        // topic. Don't overwrite a value already set on the lesson.
        if (doc.termNumber == null && doc.curriculumNodeId) {
          const t = nodeTermMap.get(doc.curriculumNodeId.toString());
          if (typeof t === 'number') setOps.termNumber = t;
        }

        ops.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: setOps },
          },
        });
        migrated += 1;
      }

      if (ops.length > 0) {
        await collection.bulkWrite(ops, { ordered: false });
      }
      buffer = [];
    };

    for await (const doc of cursor) {
      total += 1;
      buffer.push(doc as LegacyLesson);
      if (buffer.length >= CHUNK_SIZE) {
        await flush();
      }
    }
    await flush();

    await markComplete(MIGRATION_NAME);
    logger.info(
      { migrated, skipped, total },
      '[migrations] lesson-assignments complete',
    );
  } catch (err: unknown) {
    await releaseClaim(MIGRATION_NAME);
    logger.error(
      { err },
      '[migrations] lesson-assignments failed; lock released for retry',
    );
    throw err;
  }
}
