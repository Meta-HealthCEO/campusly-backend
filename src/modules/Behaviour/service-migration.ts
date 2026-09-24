// src/modules/Behaviour/service-migration.ts
//
// Folds the old Merits and Discipline records into the one behaviour log.
// Each record becomes one entry in its learner's log (with its date, teacher
// and the learner's class), remembered by legacyId so a second run skips it.
// Records for learners who have left are counted and left alone. The old
// records stay where they are. A dry run only counts.

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

export async function migrateBehaviour(opts: { apply: boolean; schoolId?: string }): Promise<BehaviourMigrationReport> {
  const report: BehaviourMigrationReport = { applied: opts.apply, merits: 0, discipline: 0, alreadyMoved: 0, skippedLeftLearners: 0 };
  const scope: Record<string, unknown> = { isDeleted: false };
  if (opts.schoolId) scope.schoolId = new mongoose.Types.ObjectId(opts.schoolId);

  const merits = await Merit.find(scope).lean();
  const discipline = await Discipline.find(scope).lean();
  const records: Array<Legacy & { from: 'merits' | 'discipline' }> = [
    ...merits.map((m) => ({
      from: 'merits' as const, _id: m._id as Id, schoolId: m.schoolId as Id, studentId: m.studentId as Id, by: m.awardedBy as Id,
      at: (m as unknown as { createdAt: Date }).createdAt, entry: fromMerit(m),
    })),
    ...discipline.map((d) => ({
      from: 'discipline' as const, _id: d._id as Id, schoolId: d.schoolId as Id, studentId: d.studentId as Id, by: d.reportedBy as Id,
      at: (d as unknown as { createdAt: Date }).createdAt, entry: fromDiscipline(d),
    })),
  ];
  if (records.length === 0) return report;

  const moved = new Set((await BehaviourEntry.find({ legacyId: { $in: records.map((r) => r._id) } }).select('legacyId').lean())
    .map((e) => String(e.legacyId)));
  const students = await Student.find({ _id: { $in: records.map((r) => r.studentId) }, isDeleted: false }).select('_id schoolId classId').lean();
  const learner = new Map(students.map((s) => [String(s._id), s]));

  const toInsert: Array<Record<string, unknown>> = [];
  for (const r of records) {
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
  if (opts.apply && toInsert.length > 0) await BehaviourEntry.insertMany(toInsert, { ordered: false });
  return report;
}
