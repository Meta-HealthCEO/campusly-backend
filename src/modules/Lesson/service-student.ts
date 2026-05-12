import mongoose from 'mongoose';
import type { HydratedDocument } from 'mongoose';
import { Lesson } from './model.js';
// Side-effect import: ensures the Subject model is registered with Mongoose
// so .populate('subjectId') works without a MissingSchemaError.
import '../Academic/model.js';
import type { IStudent } from '../Student/model.js';
import type { StudentLessonSummary } from './types-student.js';
import type { StudentLessonListQuery } from './validation-student.js';

interface PopulatedSubject {
  _id: mongoose.Types.ObjectId;
  name?: string;
  title?: string;
}

function isPopulatedSubject(
  subject: PopulatedSubject | mongoose.Types.ObjectId | null,
): subject is PopulatedSubject {
  return subject !== null && typeof subject === 'object' && !(subject instanceof mongoose.Types.ObjectId);
}

function lessonToSummary(
  doc: Record<string, unknown>,
  studentClassId: mongoose.Types.ObjectId,
): StudentLessonSummary {
  const assigned = (
    doc.assignedClasses as Array<{
      classId: mongoose.Types.ObjectId;
      scheduledDate: Date;
      status: 'planned' | 'taught';
    }>
  ).find((a) => a.classId.toString() === studentClassId.toString());
  const materials = (doc.materials as Array<{ kind: string }>) ?? [];
  const subject = doc.subjectId as PopulatedSubject | mongoose.Types.ObjectId | null;
  const subjectName = isPopulatedSubject(subject) ? subject.name ?? subject.title ?? '' : '';
  const subjectId = isPopulatedSubject(subject)
    ? subject._id.toString()
    : subject !== null
      ? subject.toString()
      : '';
  return {
    id: (doc._id as mongoose.Types.ObjectId).toString(),
    title: doc.title as string,
    subjectId,
    subjectName,
    scheduledDate: assigned?.scheduledDate.toISOString() ?? new Date().toISOString(),
    status: assigned?.status ?? 'planned',
    materialCount: materials.length,
    hasHomework: materials.some((m) => m.kind === 'homework'),
    hasQuiz: materials.some((m) => m.kind === 'quiz' || m.kind === 'practice_questions'),
  };
}

export async function listLessonsForStudent(
  student: HydratedDocument<IStudent>,
  query: StudentLessonListQuery,
): Promise<StudentLessonSummary[]> {
  const filter: Record<string, unknown> = {
    schoolId: student.schoolId,
    isDeleted: false,
    status: { $in: ['ready', 'taught'] },
    'assignedClasses.classId': student.classId,
  };
  if (query.subjectId) {
    filter.subjectId = new mongoose.Types.ObjectId(query.subjectId);
  }
  if (query.search) {
    filter.title = { $regex: query.search, $options: 'i' };
  }

  const docs = await Lesson.find(filter)
    .populate('subjectId', 'name title')
    .lean()
    .exec();

  const summaries = docs.map((d) => lessonToSummary(d as unknown as Record<string, unknown>, student.classId));

  if (query.status && query.status !== 'all') {
    return summaries.filter((s) => s.status === query.status);
  }

  // Sort: taught first (most recent), then planned (chronological).
  return summaries.sort((a, b) => {
    if (a.status === b.status) {
      return a.status === 'taught'
        ? new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
        : new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    }
    return a.status === 'taught' ? -1 : 1;
  });
}
