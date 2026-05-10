import mongoose from 'mongoose';
import { CurriculumNode } from './model.js';
import { hasRun, markComplete, tryClaim, releaseClaim } from '../../db/migrations/sentinel.js';
import { logger } from '../../common/logger.js';

const MIGRATION_NAME = 'curriculum-backfill-term-from-code';

// Many CAPS source files (notably Business Studies, Economics, etc.) have a
// structural bug: topic and subtopic nodes parentId straight to the SUBJECT
// node instead of going through the TERM. The term nodes exist, but topics
// skip them. As a result the denormalize-hierarchy migration leaves
// `termNumber` null on every affected topic/subtopic, breaking term filters
// in the new-lesson topic picker.
//
// The CAPS code embeds the term number — e.g. `CAPS-BUSINESSSTUDIES-GR12-T2-LEADERSHIP`
// has `T2` in it. This migration parses the code segment to backfill
// `termNumber` on every topic/subtopic that has a null/missing value.
//
// This is corrective data hygiene — re-runnable, idempotent, scoped to topics
// and subtopics. Subject/grade/phase refs are not touched.
const TERM_FROM_CODE_RE = /-T(\d)-/i;

function parseTermFromCode(code: string): number | null {
  const match = code.match(TERM_FROM_CODE_RE);
  if (!match) return null;
  const n = Number(match[1]);
  if (Number.isNaN(n) || n < 1 || n > 4) return null;
  return n;
}

interface RawNode {
  _id: mongoose.Types.ObjectId;
  code: string;
  termNumber: number | null;
}

export async function runBackfillTopicTermFromCode(): Promise<void> {
  if (await hasRun(MIGRATION_NAME)) {
    logger.debug('[migrations] backfill-term-from-code already complete, skipping');
    return;
  }
  const claimed = await tryClaim(MIGRATION_NAME);
  if (!claimed) {
    logger.debug('[migrations] backfill-term-from-code lock held, skipping');
    return;
  }

  try {
    const nodes = await CurriculumNode.find({
      type: { $in: ['topic', 'subtopic'] },
      isDeleted: false,
      $or: [{ termNumber: null }, { termNumber: { $exists: false } }],
    })
      .select('_id code termNumber')
      .lean<RawNode[]>();

    const ops: Array<{
      updateOne: {
        filter: { _id: mongoose.Types.ObjectId };
        update: { $set: { termNumber: number } };
      };
    }> = [];

    for (const node of nodes) {
      const term = parseTermFromCode(node.code);
      if (term === null) continue;
      ops.push({
        updateOne: {
          filter: { _id: node._id },
          update: { $set: { termNumber: term } },
        },
      });
    }

    let updated = 0;
    const CHUNK = 1000;
    for (let i = 0; i < ops.length; i += CHUNK) {
      const slice = ops.slice(i, i + CHUNK);
      if (slice.length === 0) continue;
      const result = await CurriculumNode.bulkWrite(slice, { ordered: false });
      updated += result.modifiedCount ?? 0;
    }

    await markComplete(MIGRATION_NAME);
    logger.info(
      { scanned: nodes.length, updated, unparseable: nodes.length - ops.length },
      '[migrations] backfill-term-from-code complete',
    );
  } catch (err: unknown) {
    await releaseClaim(MIGRATION_NAME);
    logger.error(
      { err },
      '[migrations] backfill-term-from-code failed; lock released for retry',
    );
    throw err;
  }
}
