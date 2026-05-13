// Phase 0 discovery findings (Campusly student portal Phase 1):
// - Student.schoolId is required (Student model).
// - School.plan is 'standalone' | 'school'; standalone teachers get a synthetic School doc.
// - School.modulesEnabled is string[]; Phase 1 standalone schools likely have [].
// - Homework has no lessonId field; backlink uses reverse lookup via Lesson.materials[].homeworkId.
// - QuizAttemptUI exists at FE: src/components/learning/QuizAttemptUI.tsx.

import { Student } from '../modules/Student/model.js';
import type { IStudent } from '../modules/Student/model.js';
import type { HydratedDocument } from 'mongoose';

export async function resolveStudentFromUserId(
  userId: string,
  schoolId: string,
): Promise<HydratedDocument<IStudent> | null> {
  return Student.findOne({ userId, schoolId, isDeleted: false });
}
