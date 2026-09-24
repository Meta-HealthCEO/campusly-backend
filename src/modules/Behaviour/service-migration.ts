// src/modules/Behaviour/service-migration.ts
//
// Folds the old Merits and Discipline records into the one behaviour log.
// Each record becomes one entry in its learner's log (with its date, teacher
// and the learner's class), remembered by legacyId so a second run skips it.
// Records for learners who have left are counted and left alone. The old
// records stay where they are. A dry run only counts.
//
// Ruling: classId is set to the learner's CURRENT class, not the class they
// were in when the old record was made. Historical accuracy of "which class
// was this learner in on that date" is not critical here — this log's main
// use is a teacher filtering by class today, and a learner's current class is
// the reliable, always-available value for that. Cost if wrong: a handful of
// old entries show under a learner's current class instead of a class they've
// since left; nothing breaks, no numbers are miscounted, and it's already the
// prior behaviour of this script kept unchanged rather than a new regression.

import mongoose from 'mongoose';
import { BehaviourEntry } from './model.js';
import { fromDiscipline, fromMerit } from './legacy-map.js';
import type { CheckedEntry } from './behaviour-rules.js';
import { Discipline, Merit } from '../Attendance/model.js';
import { Student } from '../Student/model.js';

type Id = mongoose.Types.ObjectId;

export interface BehaviourMigrationReport {
  applied: boolean;
  /** Records that moved (or would move). */
  merits: number;
  discipline: number;
  alreadyMoved: number;
  skippedLeftLearners: number;
}

interface Legacy {
  _id: Id;
  schoolId: Id;
  studentId: Id;
  by: Id;
  at: Date;
  entry: CheckedEntry;
}

type Source = 'merits' | 'discipline';

// How many legacy records are read and converted at a time, instead of
// loading the whole Merit/Discipline collection into memory at once.
const DEFAULT_BATCH_SIZE = 500;

/** One batch's worth of records: looks up who's already moved and each learner's class, then inserts the rest. */
async function migrateBatch(
  batch: Array<Legacy & { from: Source }>,
  report: BehaviourMigrationReport,
  apply: boolean,
): Promise<void> {
  if (batch.length === 0) return;

  const moved = new Set((await BehaviourEntry.find({ legacyId: { $in: batch.map((r) => r._id) } }).select('legacyId').lean())
    .map((e) => String(e.legacyId)));
  const students = await Student.find({ _id: { $in: batch.map((r) => r.studentId) }, isDeleted: false }).select('_id schoolId classId').lean();
  const learner = new Map(students.map((s) => [String(s._id), s]));

  const toInsert: Array<Record<string, unknown>> = [];
  for (const r of batch) {
    if (moved.has(String(r._id))) {
      report.alreadyMoved += 1;
      continue;
    }
    const student = learner.get(String(r.studentId));
    // A learner who has left (or moved school) keeps their old record only.
    if (!student || String(student.schoolId) !== String(r.schoolId)) {
      report.skippedLeftLearners += 1;
      continue;
    }
    report[r.from] += 1;
    toInsert.push({
      ...r.entry, schoolId: r.schoolId, studentId: r.studentId, classId: student.classId ?? null, loggedBy: r.by,
      occurredAt: r.at ?? new Date(), source: 'log', requestKey: null, legacyId: r._id, isDeleted: false,
    });
  }
  if (apply && toInsert.length > 0) {
    try {
      await BehaviourEntry.insertMany(toInsert, { ordered: false });
    } catch (err: unknown) {
      // Another run (or an old route's copy) moved some first: the unique legacyId index kept one each.
      const writeErrors = (err as { writeErrors?: Array<{ code?: number; err?: { code?: number } }> }).writeErrors ?? [];
      const onlyDuplicates = writeErrors.length > 0 && writeErrors.every((w) => (w.code ?? w.err?.code) === 11000);
      if (!onlyDuplicates) throw err;
    }
  }
}

/** Pages through one legacy collection with a cursor, converting and migrating it batchSize records at a time. */
async function migrateSource<T>(
  cursor: AsyncIterable<T>,
  toLegacy: (doc: T) => Legacy,
  from: Source,
  report: BehaviourMigrationReport,
  apply: boolean,
  batchSize: number,
): Promise<void> {
  let batch: Array<Legacy & { from: Source }> = [];
  for await (const doc of cursor) {
    batch.push({ ...toLegacy(doc), from });
    if (batch.length >= batchSize) {
      await migrateBatch(batch, report, apply);
      batch = [];
    }
  }
  await migrateBatch(batch, report, apply);
}

export async function migrateBehaviour(opts: { apply: boolean; schoolId?: string; batchSize?: number }): Promise<BehaviourMigrationReport> {
  const report: BehaviourMigrationReport = { applied: opts.apply, merits: 0, discipline: 0, alreadyMoved: 0, skippedLeftLearners: 0 };
  const scope: Record<string, unknown> = { isDeleted: false };
  if (opts.schoolId) scope.schoolId = new mongoose.Types.ObjectId(opts.schoolId);
  const batchSize = opts.batchSize && opts.batchSize > 0 ? opts.batchSize : DEFAULT_BATCH_SIZE;

  await migrateSource(
    Merit.find(scope).lean().cursor(),
    (m) => ({
      _id: m._id as Id, schoolId: m.schoolId as Id, studentId: m.studentId as Id, by: m.awardedBy as Id,
      at: (m as unknown as { createdAt: Date }).createdAt, entry: fromMerit(m as Parameters<typeof fromMerit>[0]),
    }),
    'merits', report, opts.apply, batchSize,
  );
  await migrateSource(
    Discipline.find(scope).lean().cursor(),
    (d) => ({
      _id: d._id as Id, schoolId: d.schoolId as Id, studentId: d.studentId as Id, by: d.reportedBy as Id,
      at: (d as unknown as { createdAt: Date }).createdAt, entry: fromDiscipline(d as Parameters<typeof fromDiscipline>[0]),
    }),
    'discipline', report, opts.apply, batchSize,
  );

  return report;
}
