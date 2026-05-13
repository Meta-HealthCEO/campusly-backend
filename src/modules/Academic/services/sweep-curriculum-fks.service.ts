// src/modules/Academic/services/sweep-curriculum-fks.service.ts
//
// One-shot migration: rewrite any document that stores a CurriculumNode `_id`
// in a field that should reference school-side Subject/Grade `_id`. These
// stale references were created during the era when `/academic/subjects` and
// `/academic/grades` returned CurriculumNode records masquerading as
// Subject/Grade rows (the standalone-teacher mask, now removed).
//
// Depends on `runBackfillStandaloneAcademicRows` having already created
// school-side Subject and Grade rows with `curriculumNodeId` populated — the
// sweep uses those rows as the lookup table for rewriting FKs.

import mongoose from 'mongoose';
import { hasRun, markComplete, tryClaim, releaseClaim } from '../../../db/migrations/sentinel.js';
import { logger } from '../../../common/logger.js';

// Bumped to v2 because v1's buildLookup only covered curriculum nodes whose
// `_id` survived the "name-collapse" path in ensureSubjectForCurriculumNode
// (multiple curriculum subject nodes share the same stripped title — e.g.
// CAPS-MATHEMATICS-GR1 vs -GR2 — and only the last-processed got its
// curriculumNodeId stamped on the school row). v2 also walks every
// curriculum subject/grade node and title-bridges it into the lookup, so
// every stale FK gets rewritten regardless of which curriculum-node-id it
// happened to store.
const MIGRATION_NAME = 'sweep-curriculum-node-foreign-keys-v2';

interface ScalarFkSpec {
  collection: string;
  field: string;
  kind: 'subject' | 'grade';
}

interface ArrayFkSpec {
  collection: string;
  field: string;
  kind: 'subject' | 'grade';
  isArray: true;
}

type FkSpec = ScalarFkSpec | ArrayFkSpec;

const SCALAR_FKS: ScalarFkSpec[] = [
  { collection: 'homeworks',                field: 'subjectId',  kind: 'subject' },
  { collection: 'questions',                field: 'subjectId',  kind: 'subject' },
  { collection: 'questions',                field: 'gradeId',    kind: 'grade'   },
  { collection: 'subjectrequirements',      field: 'subjectId',  kind: 'subject' },
  { collection: 'subjectrequirements',      field: 'gradeId',    kind: 'grade'   },
  { collection: 'subjectlines',             field: 'gradeId',    kind: 'grade'   },
  { collection: 'classes',                  field: 'gradeId',    kind: 'grade'   },
  { collection: 'textbooks',                field: 'subjectId',  kind: 'subject' },
  { collection: 'textbooks',                field: 'gradeId',    kind: 'grade'   },
  { collection: 'contentresources',         field: 'subjectId',  kind: 'subject' },
  { collection: 'contentresources',         field: 'gradeId',    kind: 'grade'   },
  { collection: 'assessments',              field: 'subjectId',  kind: 'subject' },
  { collection: 'examtimetables',           field: 'subjectId',  kind: 'subject' },
  { collection: 'examtimetables',           field: 'gradeId',    kind: 'grade'   },
  { collection: 'pastpapers',               field: 'subjectId',  kind: 'subject' },
  { collection: 'pastpapers',               field: 'gradeId',    kind: 'grade'   },
  { collection: 'subjectweightings',        field: 'subjectId',  kind: 'subject' },
  { collection: 'subjectweightings',        field: 'gradeId',    kind: 'grade'   },
  { collection: 'remedialtrackings',        field: 'subjectId',  kind: 'subject' },
  { collection: 'timetables',               field: 'subjectId',  kind: 'subject' },
  { collection: 'assessmentstructures',     field: 'subjectId',  kind: 'subject' },
  { collection: 'assessmentstructures',     field: 'gradeId',    kind: 'grade'   },
  { collection: 'assessmentpapers',         field: 'subjectId',  kind: 'subject' },
  { collection: 'assessmentpapers',         field: 'gradeId',    kind: 'grade'   },
];

const ARRAY_FKS: ArrayFkSpec[] = [
  { collection: 'subjectlines', field: 'subjectIds', kind: 'subject', isArray: true },
];

const ALL_FKS: FkSpec[] = [...SCALAR_FKS, ...ARRAY_FKS];

interface AcademicRow {
  _id: mongoose.Types.ObjectId;
  name: string;
  curriculumNodeId: mongoose.Types.ObjectId | null;
}

interface CurriculumNodeRow {
  _id: mongoose.Types.ObjectId;
  title: string;
}

function normaliseName(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Build a curriculumNode._id → academic._id lookup. Two passes:
 *
 *   1. Direct bridge — anywhere `Subject.curriculumNodeId` / `Grade.curriculumNodeId`
 *      is populated, register that mapping.
 *   2. Title bridge — for each academic row, find every CurriculumNode of the
 *      matching `type` whose normalised title equals the row's name. Multiple
 *      curriculum nodes can map to one academic row (e.g. one school
 *      "Mathematics" maps to MATH-GR1, MATH-GR2 ... curriculum nodes after
 *      the strip-grade-suffix migration).
 *
 * Direct-bridge entries win when present so we never overwrite an explicit
 * curriculumNodeId binding with a fuzzy title match.
 */
async function buildLookup(
  kind: 'subject' | 'grade',
): Promise<Map<string, mongoose.Types.ObjectId>> {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Mongo connection has no db handle');
  const academicColl = kind === 'subject' ? 'subjects' : 'grades';
  const nodeType = kind;

  const academicRows = await db
    .collection(academicColl)
    .find<AcademicRow>(
      { isDeleted: false },
      { projection: { _id: 1, name: 1, curriculumNodeId: 1 } },
    )
    .toArray();

  if (academicRows.length === 0) {
    return new Map();
  }

  const map = new Map<string, mongoose.Types.ObjectId>();

  // Pass 1: direct curriculumNodeId binding.
  for (const row of academicRows) {
    if (row.curriculumNodeId) {
      map.set(String(row.curriculumNodeId), row._id);
    }
  }

  // Pass 2: title bridge. Group academic rows by normalised name, then walk
  // matching curriculum nodes for each name.
  const academicByName = new Map<string, mongoose.Types.ObjectId>();
  for (const row of academicRows) {
    academicByName.set(normaliseName(row.name), row._id);
  }

  const titles = Array.from(academicByName.keys());
  if (titles.length === 0) return map;

  const curriculumNodes = await db
    .collection('curriculumnodes')
    .find<CurriculumNodeRow>(
      { type: nodeType, isDeleted: false },
      { projection: { _id: 1, title: 1 } },
    )
    .toArray();

  for (const node of curriculumNodes) {
    const academicId = academicByName.get(normaliseName(node.title));
    if (!academicId) continue;
    const nodeIdStr = String(node._id);
    if (!map.has(nodeIdStr)) {
      map.set(nodeIdStr, academicId);
    }
  }

  return map;
}

interface SweepStats {
  scanned: number;
  rewritten: number;
}

async function sweepScalar(
  spec: ScalarFkSpec,
  lookup: Map<string, mongoose.Types.ObjectId>,
): Promise<SweepStats> {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Mongo connection has no db handle');
  const coll = db.collection(spec.collection);

  let scanned = 0;
  let rewritten = 0;

  for (const [staleIdStr, freshOid] of lookup.entries()) {
    const staleOid = new mongoose.Types.ObjectId(staleIdStr);
    const result = await coll.updateMany(
      { [spec.field]: staleOid },
      { $set: { [spec.field]: freshOid } },
    );
    scanned += result.matchedCount ?? 0;
    rewritten += result.modifiedCount ?? 0;
  }
  return { scanned, rewritten };
}

async function sweepArray(
  spec: ArrayFkSpec,
  lookup: Map<string, mongoose.Types.ObjectId>,
): Promise<SweepStats> {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Mongo connection has no db handle');
  const coll = db.collection(spec.collection);

  let scanned = 0;
  let rewritten = 0;

  // For each stale id, pull it from any array that contains it and push the
  // fresh id (skipping when already present). Two-step so we don't end up
  // with duplicates if the array already had the fresh id. Casts to
  // `Record<string, unknown>` because mongo's $pull / $addToSet generic
  // signatures over a dynamic field name don't narrow cleanly.
  for (const [staleIdStr, freshOid] of lookup.entries()) {
    const staleOid = new mongoose.Types.ObjectId(staleIdStr);
    const matched = await coll.countDocuments({ [spec.field]: staleOid });
    if (matched === 0) continue;
    scanned += matched;
    // Cast through `unknown` because mongo's PullOperator / AddToSetOperator
    // generics over a dynamic field name don't narrow.
    await coll.updateMany(
      { [spec.field]: staleOid },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ $pull: { [spec.field]: staleOid } } as any),
    );
    await coll.updateMany(
      { [spec.field]: { $ne: freshOid } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ $addToSet: { [spec.field]: freshOid } } as any),
    );
    rewritten += matched;
  }
  return { scanned, rewritten };
}

export async function runSweepCurriculumNodeForeignKeys(): Promise<void> {
  if (await hasRun(MIGRATION_NAME)) {
    logger.debug('[migrations] sweep-curriculum-fks already complete, skipping');
    return;
  }
  const claimed = await tryClaim(MIGRATION_NAME);
  if (!claimed) {
    logger.debug('[migrations] sweep-curriculum-fks lock held by another instance, skipping');
    return;
  }

  try {
    const subjectLookup = await buildLookup('subject');
    const gradeLookup = await buildLookup('grade');

    logger.info(
      { subjects: subjectLookup.size, grades: gradeLookup.size },
      '[migrations] sweep-curriculum-fks built lookup tables',
    );

    if (subjectLookup.size === 0 && gradeLookup.size === 0) {
      // No bridged school rows means nothing to rewrite.
      await markComplete(MIGRATION_NAME);
      logger.info('[migrations] sweep-curriculum-fks: no bridges yet, marking complete');
      return;
    }

    const totals: Record<string, SweepStats> = {};

    for (const spec of ALL_FKS) {
      const lookup = spec.kind === 'subject' ? subjectLookup : gradeLookup;
      if (lookup.size === 0) continue;
      const stats = 'isArray' in spec && spec.isArray
        ? await sweepArray(spec, lookup)
        : await sweepScalar(spec as ScalarFkSpec, lookup);
      if (stats.rewritten > 0 || stats.scanned > 0) {
        totals[`${spec.collection}.${spec.field}`] = stats;
      }
    }

    await markComplete(MIGRATION_NAME);
    logger.info({ totals }, '[migrations] sweep-curriculum-fks complete');
  } catch (err: unknown) {
    await releaseClaim(MIGRATION_NAME);
    logger.error({ err }, '[migrations] sweep-curriculum-fks failed; lock released for retry');
    throw err;
  }
}
