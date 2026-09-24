// src/modules/Behaviour/legacy-sync.ts
//
// The admin Discipline page and the old merit route still write the old
// records. Each write is copied into the one behaviour log (matched on
// legacyId), so the log stays complete: created, edited and deleted together.

import mongoose from 'mongoose';
import { BehaviourEntry } from './model.js';
import { fromDiscipline, fromMerit } from './legacy-map.js';
import type { CheckedEntry } from './behaviour-rules.js';
import { Student } from '../Student/model.js';

interface LegacyBase {
  _id: unknown;
  schoolId: unknown;
  studentId: unknown;
  isDeleted?: boolean;
  createdAt?: Date;
}

/** The id of a reference, whether it came back filled in (populated) or not; null when it's missing. */
function refId(v: unknown): mongoose.Types.ObjectId | null {
  const id = String((v as { _id?: unknown } | null)?._id ?? v ?? '');
  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
}

async function sync(record: LegacyBase, by: unknown, entry: CheckedEntry): Promise<void> {
  const studentId = refId(record.studentId);
  if (!studentId) return;
  const loggedBy = refId(by);
  const student = await Student.findOne({ _id: studentId }).select('classId').lean();
  await BehaviourEntry.updateOne(
    { legacyId: refId(record._id) },
    {
      $set: { ...entry, isDeleted: record.isDeleted === true },
      $setOnInsert: {
        schoolId: record.schoolId, studentId, classId: student?.classId ?? null,
        ...(loggedBy ? { loggedBy } : {}), occurredAt: record.createdAt ?? new Date(),
        source: 'log', requestKey: null,
      },
    },
    { upsert: true },
  );
}

export function syncDiscipline(d: LegacyBase & { type: string; severity: string; description?: string; reportedBy: unknown }): Promise<void> {
  return sync(d, d.reportedBy, fromDiscipline(d));
}

export function syncMerit(m: LegacyBase & { type: string; category: string; points: number; reason?: string; awardedBy: unknown }): Promise<void> {
  return sync(m, m.awardedBy, fromMerit(m));
}
