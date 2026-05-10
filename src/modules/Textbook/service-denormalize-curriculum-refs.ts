import mongoose from 'mongoose';
import { Textbook } from './model.js';
import { Subject, Grade } from '../Academic/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { hasRun, markComplete, tryClaim, releaseClaim } from '../../db/migrations/sentinel.js';
import { logger } from '../../common/logger.js';

const MIGRATION_NAME = 'textbook-denormalize-curriculum-refs';

interface RawTextbook {
  _id: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId | null;
  gradeId: mongoose.Types.ObjectId | null;
  subjectNodeId: mongoose.Types.ObjectId | null;
  gradeNodeId: mongoose.Types.ObjectId | null;
}

interface NodeLite {
  _id: mongoose.Types.ObjectId;
  title: string;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findSubjectNodeIdByName(name: string): Promise<mongoose.Types.ObjectId | null> {
  const exact = await CurriculumNode.findOne({
    type: 'subject',
    isDeleted: false,
    title: new RegExp(`^${escapeRegex(name)}$`, 'i'),
  })
    .select('_id title')
    .lean<NodeLite | null>();
  if (exact) return exact._id;

  // Defensive substring fallback for legacy "Business Studies Grade 12" titles
  // that may linger if strip-grade-suffix was bypassed for any reason.
  const fuzzy = await CurriculumNode.findOne({
    type: 'subject',
    isDeleted: false,
    title: new RegExp(escapeRegex(name), 'i'),
  })
    .select('_id title')
    .lean<NodeLite | null>();
  return fuzzy?._id ?? null;
}

async function findGradeNodeIdByName(name: string): Promise<mongoose.Types.ObjectId | null> {
  const exact = await CurriculumNode.findOne({
    type: 'grade',
    isDeleted: false,
    title: new RegExp(`^${escapeRegex(name)}$`, 'i'),
  })
    .select('_id title')
    .lean<NodeLite | null>();
  return exact?._id ?? null;
}

export async function runDenormalizeTextbookCurriculumRefs(): Promise<void> {
  if (await hasRun(MIGRATION_NAME)) {
    logger.debug('[migrations] textbook-denormalize-curriculum-refs already complete, skipping');
    return;
  }
  const claimed = await tryClaim(MIGRATION_NAME);
  if (!claimed) {
    logger.debug(
      '[migrations] textbook-denormalize-curriculum-refs lock held by another instance, skipping',
    );
    return;
  }

  try {
    const textbooks = await Textbook.find({ isDeleted: false })
      .select('_id subjectId gradeId subjectNodeId gradeNodeId')
      .lean<RawTextbook[]>();

    // Resolver caches keyed by hex id of academic Subject/Grade.
    const subjectNodeCache = new Map<string, mongoose.Types.ObjectId | null>();
    const gradeNodeCache = new Map<string, mongoose.Types.ObjectId | null>();

    const ops: Array<{
      updateOne: {
        filter: { _id: mongoose.Types.ObjectId };
        update: {
          $set: {
            subjectNodeId: mongoose.Types.ObjectId | null;
            gradeNodeId: mongoose.Types.ObjectId | null;
          };
        };
      };
    }> = [];

    let unmatchedSubject = 0;
    let unmatchedGrade = 0;
    const skippedTitles: string[] = [];

    for (const tb of textbooks) {
      let subjectNodeId: mongoose.Types.ObjectId | null = null;
      let gradeNodeId: mongoose.Types.ObjectId | null = null;

      if (tb.subjectId) {
        const key = tb.subjectId.toString();
        if (subjectNodeCache.has(key)) {
          subjectNodeId = subjectNodeCache.get(key) ?? null;
        } else {
          const subject = await Subject.findById(tb.subjectId)
            .select('name')
            .lean<{ name: string } | null>();
          if (subject?.name) {
            subjectNodeId = await findSubjectNodeIdByName(subject.name);
          }
          subjectNodeCache.set(key, subjectNodeId);
        }
      }

      if (tb.gradeId) {
        const key = tb.gradeId.toString();
        if (gradeNodeCache.has(key)) {
          gradeNodeId = gradeNodeCache.get(key) ?? null;
        } else {
          const grade = await Grade.findById(tb.gradeId)
            .select('name')
            .lean<{ name: string } | null>();
          if (grade?.name) {
            gradeNodeId = await findGradeNodeIdByName(grade.name);
          }
          gradeNodeCache.set(key, gradeNodeId);
        }
      }

      if (!subjectNodeId) unmatchedSubject += 1;
      if (!gradeNodeId) unmatchedGrade += 1;

      if (!subjectNodeId && !gradeNodeId) {
        skippedTitles.push(tb._id.toString());
        continue;
      }

      ops.push({
        updateOne: {
          filter: { _id: tb._id },
          update: { $set: { subjectNodeId, gradeNodeId } },
        },
      });
    }

    let updated = 0;
    const CHUNK = 500;
    for (let i = 0; i < ops.length; i += CHUNK) {
      const slice = ops.slice(i, i + CHUNK);
      if (slice.length === 0) continue;
      const result = await Textbook.bulkWrite(slice, { ordered: false });
      updated += result.modifiedCount ?? 0;
    }

    await markComplete(MIGRATION_NAME);
    logger.info(
      {
        totalTextbooks: textbooks.length,
        updated,
        skippedNoMatch: skippedTitles.length,
        unmatchedSubject,
        unmatchedGrade,
      },
      '[migrations] textbook-denormalize-curriculum-refs complete',
    );
    if (skippedTitles.length > 0) {
      logger.warn(
        { skippedTextbookIds: skippedTitles.slice(0, 20) },
        '[migrations] some textbooks had neither subject nor grade match (showing first 20)',
      );
    }
  } catch (err: unknown) {
    await releaseClaim(MIGRATION_NAME);
    logger.error(
      { err },
      '[migrations] textbook-denormalize-curriculum-refs failed; lock released for retry',
    );
    throw err;
  }
}
