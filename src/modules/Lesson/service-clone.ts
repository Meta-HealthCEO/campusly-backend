// src/modules/Lesson/service-clone.ts
//
// "Reuse this lesson next year" — duplicate an entire lesson record with
// every material, phase ordering, and curriculum link intact, but reset the
// per-class scheduled assignments, reflection notes, and publish state.
//
// Materials reference EXTERNAL docs (ContentResource, Homework, Quiz, Paper)
// — those refs are kept as-is, not deep-copied. Reusing a lesson typically
// means reusing its content; a teacher who wants a divergent copy can edit
// individual materials after cloning.

import mongoose from 'mongoose';
import { Lesson } from './model.js';
import type { ILesson } from './types.js';
import { NotFoundError } from '../../common/errors.js';
import {
  canManageAllLessons,
  isLessonActor,
  lessonAccessFilter,
  toObjectId,
  type LessonScope,
} from './service-access.js';

interface CloneOptions {
  /** Override the cloned title; default is `Copy of <original>`. */
  title?: string;
}

interface CloneSourceLesson {
  schoolId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId | null;
  gradeId: mongoose.Types.ObjectId | null;
  curriculumNodeId: mongoose.Types.ObjectId;
  termNumber: number | null;
  title: string;
  durationMinutes: number;
  objectives: string[];
  phases: Array<{ phase: string; materialIds: mongoose.Types.ObjectId[] }>;
  materials: Array<{
    _id: mongoose.Types.ObjectId;
    kind: string;
    title: string;
    teacherNotes?: string;
    generatedAt?: Date;
    textbookRef?: unknown;
    comprehensionQuestionIds?: mongoose.Types.ObjectId[];
    contentResourceId?: mongoose.Types.ObjectId | null;
    quizId?: mongoose.Types.ObjectId | null;
    questionIds?: mongoose.Types.ObjectId[];
    homeworkId?: mongoose.Types.ObjectId | null;
    paperId?: mongoose.Types.ObjectId | null;
  }>;
  aiGenerated: boolean;
}

export async function cloneLesson(
  sourceId: string,
  scope: LessonScope,
  options: CloneOptions = {},
): Promise<ILesson> {
  const source = await Lesson.findOne({
    _id: toObjectId(sourceId, 'lessonId'),
    ...lessonAccessFilter(scope),
  }).lean<CloneSourceLesson | null>();
  if (!source) throw new NotFoundError('Lesson not found');

  // Mint a fresh ObjectId for every material and rebuild the phases array
  // so its materialIds reference the new ids (not the source's).
  const idMap = new Map<string, mongoose.Types.ObjectId>();
  const clonedMaterials = (source.materials ?? []).map((m) => {
    const newId = new mongoose.Types.ObjectId();
    idMap.set(String(m._id), newId);
    return {
      _id: newId,
      kind: m.kind,
      title: m.title,
      teacherNotes: m.teacherNotes,
      // Drop generatedAt — this is a fresh material from the teacher's POV.
      // External refs preserved as-is (reusing the same content is the point).
      textbookRef: m.textbookRef,
      comprehensionQuestionIds: m.comprehensionQuestionIds ?? [],
      contentResourceId: m.contentResourceId ?? null,
      quizId: m.quizId ?? null,
      questionIds: m.questionIds ?? [],
      homeworkId: m.homeworkId ?? null,
      paperId: m.paperId ?? null,
    };
  });

  const clonedPhases = (source.phases ?? []).map((p) => ({
    phase: p.phase,
    materialIds: (p.materialIds ?? [])
      .map((mid) => idMap.get(String(mid)))
      .filter((id): id is mongoose.Types.ObjectId => !!id),
  }));

  const clonedTitle = options.title?.trim() || `Copy of ${source.title}`;

  const lesson = await Lesson.create({
    schoolId: source.schoolId,
    teacherId: isLessonActor(scope) && scope.role === 'teacher' && !canManageAllLessons(scope)
      ? toObjectId(scope.id, 'teacherId')
      : source.teacherId,
    subjectId: source.subjectId,
    gradeId: source.gradeId,
    curriculumNodeId: source.curriculumNodeId,
    termNumber: source.termNumber,
    title: clonedTitle,
    durationMinutes: source.durationMinutes,
    objectives: source.objectives ?? [],
    phases: clonedPhases,
    materials: clonedMaterials,
    // Reset per-instance state — the clone is a fresh, unpublished lesson:
    publishedAt: null,
    aiGenerated: source.aiGenerated,
    assignedClasses: [],
    reflectionNotes: undefined,
  });

  return lesson.toObject() as ILesson;
}
