// src/modules/Behaviour/service.ts
//
// One behaviour log: a teacher logs a merit, a demerit or an incident for a
// learner they teach (from the Behaviour page, the roster, the register or the
// learner's profile), sees their class's recent behaviour and a learner's
// timeline (with the referrals they made), and can undo their own entry
// within a day. Admins, principals and HODs act for the whole school.

import mongoose from 'mongoose';
import { BehaviourEntry, BEHAVIOUR_SOURCES, type BehaviourSource, type IBehaviourEntry } from './model.js';
import { behaviourSummary, checkEntry, timeline, type EntryInput, type TimelineItem } from './behaviour-rules.js';
import { teacherClassIds } from '../Course/service-class-unit.js';
import { Student } from '../Student/model.js';
import { User } from '../Auth/model.js';
import { PastoralReferral } from '../Pastoral/model.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../common/errors.js';

type Id = mongoose.Types.ObjectId;
const oid = (id: string | Id) => new mongoose.Types.ObjectId(String(id));
const UNDO_WINDOW_MS = 24 * 60 * 60 * 1000;
const CLASS_LIST_LIMIT = 50;
const TIMELINE_LIMIT = 100;
const SCHOOL_LIST_LIMIT = 100;

export interface BehaviourActor {
  id: string;
  role: string;
  schoolId: string;
  isHOD?: boolean;
  isSchoolPrincipal?: boolean;
  isCounselor?: boolean;
}

export interface LogInput extends EntryInput {
  studentId: string;
  source?: string;
  requestKey?: string;
}

const actsForWholeSchool = (a: BehaviourActor): boolean =>
  a.role === 'super_admin' || a.role === 'school_admin' || a.isHOD === true || a.isSchoolPrincipal === true;

async function teaches(actor: BehaviourActor, classId: Id | null | undefined): Promise<boolean> {
  if (actsForWholeSchool(actor)) return true;
  if (!classId) return false;
  return (await teacherClassIds(actor.schoolId, actor.id)).has(String(classId));
}

/** Pastoral's rule: admins and principals see every referral, a counsellor theirs and the unassigned ones, anyone else only those they made. */
function referralScope(a: BehaviourActor): Record<string, unknown> {
  if (a.role === 'super_admin' || a.role === 'school_admin' || a.isSchoolPrincipal === true) return {};
  if (a.isCounselor === true) return { $or: [{ assignedCounselorId: oid(a.id) }, { assignedCounselorId: null }, { referredBy: oid(a.id) }] };
  return { referredBy: oid(a.id) };
}

/** Undo is for what you logged here, within a day; entries copied from old records are changed by an admin. */
const ownRecent = (actor: BehaviourActor, e: { loggedBy: unknown; createdAt: Date; legacyId?: unknown }): boolean =>
  !e.legacyId && String(e.loggedBy) === actor.id && Date.now() - new Date(e.createdAt).getTime() < UNDO_WINDOW_MS;

/** A resent log must be the same log; a changed one is refused rather than answered with the first. */
function sameLog(earlier: IBehaviourEntry, studentId: unknown, kind: unknown, category: unknown): IBehaviourEntry {
  if (String(earlier.studentId) !== String(studentId) || earlier.kind !== kind || earlier.category !== category) {
    throw new ConflictError('This log changed since it was first sent. Log it again.');
  }
  return earlier;
}

async function learnerIn(actor: BehaviourActor, studentId: string) {
  if (!mongoose.Types.ObjectId.isValid(studentId)) throw new NotFoundError('Learner not found');
  const student = await Student.findOne({ _id: oid(studentId), schoolId: oid(actor.schoolId), isDeleted: false })
    .select('_id classId userId').lean();
  if (!student) throw new NotFoundError('Learner not found');
  return student;
}

/**
 * The learner's merit/demerit/incident summary over ALL their entries (not
 * just the ones shown in the timeline). A capped find().limit() would under-
 * count a learner with more than TIMELINE_LIMIT entries, so this aggregates.
 */
async function summaryFor(schoolId: Id, studentId: Id): Promise<ReturnType<typeof behaviourSummary>> {
  const rows = await BehaviourEntry.aggregate<{ _id: string; count: number; points: number }>([
    { $match: { schoolId, studentId, isDeleted: false } },
    { $group: { _id: '$kind', count: { $sum: 1 }, points: { $sum: '$points' } } },
  ]);
  const of = (kind: string) => rows.find((r) => r._id === kind);
  return {
    merits: of('merit')?.count ?? 0,
    demerits: of('demerit')?.count ?? 0,
    incidents: of('incident')?.count ?? 0,
    net: rows.reduce((sum, r) => sum + r.points, 0),
  };
}

async function namesOf(userIds: unknown[], schoolId: Id): Promise<Map<string, string>> {
  const ids = userIds.filter((id) => id && mongoose.Types.ObjectId.isValid(String(id))).map((id) => oid(String(id)));
  const users = await User.find({ _id: { $in: ids }, schoolId }).select('firstName lastName').lean();
  return new Map(users.map((u) => [String(u._id), `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()]));
}

/** Recent entries matching a filter, newest first, with learner and teacher names. */
async function feed(actor: BehaviourActor, filter: Record<string, unknown>, limit: number) {
  const schoolId = oid(actor.schoolId);
  const isAdmin = actor.role === 'super_admin' || actor.role === 'school_admin';
  const entries = await BehaviourEntry.find({ ...filter, schoolId, isDeleted: false }).sort({ occurredAt: -1 }).limit(limit).lean();
  const students = await Student.find({ _id: { $in: entries.map((e) => e.studentId) }, schoolId }).select('userId').lean();
  const userOf = new Map(students.map((s) => [String(s._id), String(s.userId)]));
  const names = await namesOf([...students.map((s) => s.userId), ...entries.map((e) => e.loggedBy)], schoolId);
  return {
    summary: behaviourSummary(entries),
    entries: entries.map((e) => ({
      id: String(e._id), studentId: String(e.studentId), studentName: names.get(userOf.get(String(e.studentId)) ?? '') || 'Learner',
      kind: e.kind, category: e.category, points: e.points, severity: e.severity, note: e.note,
      occurredAt: e.occurredAt, loggedBy: String(e.loggedBy), loggedByName: names.get(String(e.loggedBy)) || null,
      canUndo: isAdmin || ownRecent(actor, e),
    })),
  };
}

export class BehaviourService {
  /** Logs a merit, demerit or incident; the same requestKey twice logs once. */
  static async log(actor: BehaviourActor, input: LogInput): Promise<IBehaviourEntry> {
    const student = await learnerIn(actor, input.studentId);
    if (!(await teaches(actor, student.classId as Id | null))) {
      throw new ForbiddenError('You can only log behaviour for learners you teach.');
    }
    const checked = checkEntry(input);
    const schoolId = oid(actor.schoolId);
    const requestKey = typeof input.requestKey === 'string' && input.requestKey ? input.requestKey.slice(0, 64) : null;
    if (requestKey) {
      const earlier = await BehaviourEntry.findOne({ schoolId, loggedBy: oid(actor.id), requestKey, isDeleted: false });
      if (earlier) return sameLog(earlier, student._id, checked.kind, checked.category);
    }
    const source: BehaviourSource = BEHAVIOUR_SOURCES.includes(input.source as BehaviourSource) ? input.source as BehaviourSource : 'log';
    try {
      return await BehaviourEntry.create({
        ...checked, schoolId, studentId: student._id, classId: student.classId ?? null,
        loggedBy: oid(actor.id), source, requestKey, occurredAt: new Date(),
      });
    } catch (err: unknown) {
      // Two taps racing: the unique requestKey index lets only one through.
      // Skip a soft-deleted entry here too, so a race during a retry-after-undo
      // can't hand back the entry that was just undone.
      if (requestKey && (err as { code?: number }).code === 11000) {
        const winner = await BehaviourEntry.findOne({ schoolId, loggedBy: oid(actor.id), requestKey, isDeleted: false });
        if (winner) return sameLog(winner, student._id, checked.kind, checked.category);
      }
      throw err;
    }
  }

  /** A learner's behaviour and the referrals the viewer may see, newest first, with the summary. */
  static async forLearner(actor: BehaviourActor, studentId: string): Promise<{ summary: ReturnType<typeof behaviourSummary>; items: TimelineItem[] }> {
    const student = await learnerIn(actor, studentId);
    if (!(await teaches(actor, student.classId as Id | null))) {
      throw new ForbiddenError('You can only see behaviour for learners you teach.');
    }
    const schoolId = oid(actor.schoolId);
    const [entries, summary] = await Promise.all([
      BehaviourEntry.find({ schoolId, studentId: student._id, isDeleted: false })
        .sort({ occurredAt: -1 }).limit(TIMELINE_LIMIT).lean(),
      summaryFor(schoolId, student._id as Id),
    ]);
    const referralFilter: Record<string, unknown> = { schoolId, studentId: student._id, isDeleted: false, ...referralScope(actor) };
    const referrals = await PastoralReferral.find(referralFilter).select('reason status createdAt').sort({ createdAt: -1 }).limit(20).lean();
    const names = await namesOf(entries.map((e) => e.loggedBy), schoolId);
    return {
      summary,
      items: timeline(
        entries.map((e) => ({
          id: String(e._id), kind: e.kind, category: e.category, points: e.points, note: e.note,
          occurredAt: e.occurredAt, loggedByName: names.get(String(e.loggedBy)) || null,
        })),
        referrals.map((r) => ({ id: String(r._id), reason: r.reason, status: r.status, createdAt: (r as unknown as { createdAt: Date }).createdAt })),
      ),
    };
  }

  /** A class's recent behaviour, newest first, with each learner's name. */
  static async forClass(actor: BehaviourActor, classId: string) {
    if (!mongoose.Types.ObjectId.isValid(classId)) throw new NotFoundError('Class not found');
    if (!(await teaches(actor, oid(classId)))) throw new ForbiddenError('You can only see behaviour for classes you teach.');
    return feed(actor, { classId: oid(classId) }, CLASS_LIST_LIMIT);
  }

  /** The whole school's recent behaviour, for admins and principals (the admin Behaviour log). */
  static async forSchool(actor: BehaviourActor, opts: { kind?: string }) {
    if (!actsForWholeSchool(actor)) throw new ForbiddenError('Only admins and principals can see the whole school\'s behaviour log.');
    return feed(actor, opts.kind ? { kind: opts.kind } : {}, SCHOOL_LIST_LIMIT);
  }

  /** Undo: the teacher who logged it, within a day; an admin any time. */
  static async undo(actor: BehaviourActor, entryId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(entryId)) throw new NotFoundError('Entry not found');
    const entry = await BehaviourEntry.findOne({ _id: oid(entryId), schoolId: oid(actor.schoolId), isDeleted: false });
    if (!entry) throw new NotFoundError('Entry not found');
    const isAdmin = actor.role === 'super_admin' || actor.role === 'school_admin';
    if (!isAdmin && !ownRecent(actor, entry)) throw new ForbiddenError('You can undo only what you logged, within a day.');
    entry.isDeleted = true;
    await entry.save();
  }
}
