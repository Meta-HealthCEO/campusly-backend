// src/common/class-roster.ts
//
// Who is in a class (spec §3): a learner's own group (Student.classId) plus
// any other group of the same teacher they joined (Student.subjectClassIds).
// Teacher-side reads use classRosterFilter; learner-side access uses
// learnerClassIds. School learners' subjectClassIds are empty, so for them
// both reduce to classId.
import mongoose from 'mongoose';

type IdLike = string | mongoose.Types.ObjectId;
type Filter = Record<string, unknown>;

const toOid = (id: IdLike): mongoose.Types.ObjectId => new mongoose.Types.ObjectId(String(id));

export interface ClassMember {
  classId?: IdLike | null;
  subjectClassIds?: readonly IdLike[] | null;
}

/**
 * Learners in these classes, added to `base` through $and so an existing $or
 * (a search, a release window) is never overwritten.
 */
export function classRosterFilter(classIds: IdLike | readonly IdLike[], base: Filter = {}): Filter {
  const ids = (Array.isArray(classIds) ? classIds : [classIds as IdLike]).map(toOid);
  const clause = { $or: [{ classId: { $in: ids } }, { subjectClassIds: { $in: ids } }] };
  const existing = Array.isArray(base.$and) ? (base.$and as Filter[]) : [];
  return { ...base, $and: [...existing, clause] };
}

/** Every class a learner is in: their own group first, then the others, no repeats. */
export function learnerClassIds(student: ClassMember): mongoose.Types.ObjectId[] {
  const seen = new Set<string>();
  const ids: mongoose.Types.ObjectId[] = [];
  for (const id of [student.classId, ...(student.subjectClassIds ?? [])]) {
    if (!id || seen.has(String(id))) continue;
    seen.add(String(id));
    ids.push(toOid(id));
  }
  return ids;
}

/** Whether a learner is in this class, through either field. */
export function isInClass(student: ClassMember, classId: IdLike): boolean {
  return learnerClassIds(student).some((id) => String(id) === String(classId));
}

/** Learners bucketed by each requested class they are in; a learner in two requested groups is in both. */
export function groupRosterByClass<T extends ClassMember>(students: readonly T[], classIds: readonly IdLike[]): Map<string, T[]> {
  const wanted = new Set(classIds.map(String));
  const buckets = new Map<string, T[]>();
  for (const student of students) {
    for (const id of learnerClassIds(student)) {
      const key = String(id);
      if (wanted.has(key)) buckets.set(key, [...(buckets.get(key) ?? []), student]);
    }
  }
  return buckets;
}
