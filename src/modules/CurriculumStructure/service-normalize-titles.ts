import mongoose from 'mongoose';
import { CurriculumNode } from './model.js';
import { hasRun, markComplete, tryClaim, releaseClaim } from '../../db/migrations/sentinel.js';
import { logger } from '../../common/logger.js';

const MIGRATION_NAME = 'curriculum-strip-grade-suffix-from-subject-titles';

// Matches a trailing " Grade <N>" or " Gr <N>" segment (with optional comma/period
// separator) at the end of a string. CAPS subject titles are sometimes seeded with
// the grade embedded — e.g. "Business Studies Grade 12" — even though the node is
// already nested under a Grade ancestor. The redundancy breaks title-based lookups
// (academic Subject ↔ curriculum Subject) and pollutes AI prompts.
const GRADE_SUFFIX_RE = /[\s,.\-:]+(?:Grade|Gr\.?)\s*\d{1,2}\s*$/i;

function strip(title: string): string {
  return title.replace(GRADE_SUFFIX_RE, '').trim();
}

export async function runStripGradeSuffixFromSubjects(): Promise<void> {
  if (await hasRun(MIGRATION_NAME)) {
    logger.debug('[migrations] subject-title strip already complete, skipping');
    return;
  }
  const claimed = await tryClaim(MIGRATION_NAME);
  if (!claimed) {
    logger.debug('[migrations] subject-title strip lock held by another instance, skipping');
    return;
  }

  try {
    const subjects = await CurriculumNode.find({
      type: 'subject',
      isDeleted: false,
      title: GRADE_SUFFIX_RE,
    }).lean<{ _id: mongoose.Types.ObjectId; title: string }[]>();

    let updated = 0;
    for (const node of subjects) {
      const next = strip(node.title);
      if (next && next !== node.title) {
        await CurriculumNode.updateOne({ _id: node._id }, { $set: { title: next } });
        updated += 1;
      }
    }

    await markComplete(MIGRATION_NAME);
    logger.info(
      { matched: subjects.length, updated },
      '[migrations] subject-title strip complete',
    );
  } catch (err: unknown) {
    await releaseClaim(MIGRATION_NAME);
    logger.error({ err }, '[migrations] subject-title strip failed; lock released for retry');
    throw err;
  }
}
