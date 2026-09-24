// src/modules/Behaviour/reads.ts
//
// How other modules (counsellor wellbeing, parent digest, report card, AI
// report comments, teacher workbench) read a learner's behaviour: from the
// one behaviour log only.

import mongoose from 'mongoose';
import { BehaviourEntry, type IBehaviourEntry } from './model.js';

type IdLike = string | mongoose.Types.ObjectId;
const oid = (id: IdLike) => new mongoose.Types.ObjectId(String(id));

export interface BehaviourTotals {
  meritPoints: number;
  meritCount: number;
  demeritPoints: number;
  demeritCount: number;
  incidentCount: number;
}

/** Merit and demerit points (demerits as a positive number) and counts for a learner. */
export async function behaviourTotals(studentId: IdLike, schoolId?: IdLike): Promise<BehaviourTotals> {
  const match: Record<string, unknown> = { studentId: oid(studentId), isDeleted: false };
  if (schoolId) match.schoolId = oid(schoolId);
  const rows = await BehaviourEntry.aggregate<{ _id: string; points: number; count: number }>([
    { $match: match },
    { $group: { _id: '$kind', points: { $sum: { $abs: '$points' } }, count: { $sum: 1 } } },
  ]);
  const of = (kind: string) => rows.find((r) => r._id === kind);
  return {
    meritPoints: of('merit')?.points ?? 0,
    meritCount: of('merit')?.count ?? 0,
    demeritPoints: of('demerit')?.points ?? 0,
    demeritCount: of('demerit')?.count ?? 0,
    incidentCount: of('incident')?.count ?? 0,
  };
}

/** A learner's latest entries, newest first, optionally of some kinds or within a time range. */
export async function recentEntries(
  studentId: IdLike,
  schoolId: IdLike,
  opts: { kinds?: string[]; limit: number; from?: Date; to?: Date },
): Promise<IBehaviourEntry[]> {
  const filter: Record<string, unknown> = { studentId: oid(studentId), schoolId: oid(schoolId), isDeleted: false };
  if (opts.kinds) filter.kind = { $in: opts.kinds };
  if (opts.from || opts.to) filter.occurredAt = { ...(opts.from ? { $gte: opts.from } : {}), ...(opts.to ? { $lt: opts.to } : {}) };
  return BehaviourEntry.find(filter).sort({ occurredAt: -1 }).limit(opts.limit).lean<IBehaviourEntry[]>();
}
