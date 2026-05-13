import mongoose from 'mongoose';
import { Grade, Subject } from '../model.js';

function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function exactRegex(value: string): RegExp {
  const escaped = value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}$`, 'i');
}

function uniqueIds(ids: mongoose.Types.ObjectId[]): mongoose.Types.ObjectId[] {
  const seen = new Set<string>();
  const out: mongoose.Types.ObjectId[] = [];
  for (const id of ids) {
    const key = id.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(id);
  }
  return out;
}

export async function resolveSubjectFilterIds(
  subjectId: string | undefined,
): Promise<mongoose.Types.ObjectId[] | undefined> {
  if (!subjectId) return undefined;

  const subjectOid = toObjectId(subjectId);
  const subject = await Subject.findOne({ _id: subjectOid, isDeleted: false })
    .select('name code')
    .lean();

  if (!subject) return [subjectOid];

  const globalSubjects = await Subject.find({
    schoolId: null,
    isDeleted: false,
    $or: [
      { name: exactRegex(subject.name) },
      ...(subject.code ? [{ code: exactRegex(subject.code) }] : []),
    ],
  })
    .select('_id')
    .lean();

  return uniqueIds([subjectOid, ...globalSubjects.map((doc) => doc._id)]);
}

export async function resolveGradeFilterIds(
  gradeId: string | undefined,
): Promise<mongoose.Types.ObjectId[] | undefined> {
  if (!gradeId) return undefined;

  const gradeOid = toObjectId(gradeId);
  const grade = await Grade.findOne({ _id: gradeOid, isDeleted: false })
    .select('name orderIndex')
    .lean();

  if (!grade) return [gradeOid];

  const globalGrades = await Grade.find({
    schoolId: null,
    isDeleted: false,
    name: exactRegex(grade.name),
  })
    .select('_id')
    .lean();

  return uniqueIds([gradeOid, ...globalGrades.map((doc) => doc._id)]);
}

export async function resolveAcademicFilterIds(filters: {
  subjectId?: string;
  gradeId?: string;
}): Promise<{
  subjectIds?: mongoose.Types.ObjectId[];
  gradeIds?: mongoose.Types.ObjectId[];
}> {
  const [subjectIds, gradeIds] = await Promise.all([
    resolveSubjectFilterIds(filters.subjectId),
    resolveGradeFilterIds(filters.gradeId),
  ]);
  return { subjectIds, gradeIds };
}
