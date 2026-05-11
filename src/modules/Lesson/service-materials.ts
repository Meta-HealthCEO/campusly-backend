import mongoose from 'mongoose';
import { Lesson } from './model.js';
import type { ILessonMaterial, ILesson, LessonPhase, LessonMaterialKind } from './types.js';
import type { AddMaterialInput, UpdateMaterialInput } from './validation.js';
import { GenerationService } from '../ContentLibrary/service-generation.js';
import { generateComprehensionFromTextbook } from '../Homework/service-homework-comprehension.js';
import {
  generateAIQuestions,
  type GenerateQuestionType,
  type GenerateCognitiveLevel,
  type GenerateDifficulty,
} from '../QuestionBank/service-questions-generation.js';
import {
  generatePaperWithAI,
  type GeneratePaperSection,
  type SimplePaperType,
} from '../QuestionBank/service-papers-generation.js';
import {
  softDeleteEntity,
  toPlainMaterial,
  resolveSubjectGradeForLesson,
} from './service-materials-helpers.js';
import { buildHomeworkRef } from './service-materials-homework.js';

// ── addMaterial ─────────────────────────────────────────────────────────────
export async function addMaterial(
  lessonId: string,
  schoolId: string,
  teacherId: string,
  input: AddMaterialInput,
): Promise<ILessonMaterial> {
  const lesson = await Lesson.findOne({ _id: lessonId, schoolId, isDeleted: false });
  if (!lesson) throw new Error('Lesson not found');

  const materialId = new mongoose.Types.ObjectId();
  const baseMaterial: Record<string, unknown> = {
    _id: materialId,
    kind: input.kind,
    title: input.title,
    teacherNotes: input.teacherNotes,
    generatedAt: new Date(),
  };

  const cleanupIds: mongoose.Types.ObjectId[] = [];
  const cleanupKind: LessonMaterialKind = input.kind;

  try {
    if (input.kind === 'reading') {
      baseMaterial.textbookRef = input.textbookRef;
      if (input.generateComprehension) {
        const { subjectId, gradeId } = await resolveSubjectGradeForLesson(lesson);
        const ids = await generateComprehensionFromTextbook(
          input.textbookRef,
          schoolId,
          teacherId,
          subjectId,
          gradeId,
          lesson.curriculumNodeId.toString(),
          input.comprehensionCount ?? 4,
        );
        baseMaterial.comprehensionQuestionIds = ids;
        cleanupIds.push(...ids);
      }
    } else if (
      input.kind === 'worksheet'
      || input.kind === 'activity'
      || input.kind === 'study_notes'
      || input.kind === 'worked_example'
    ) {
      const { subjectId, gradeId } = await resolveSubjectGradeForLesson(lesson);
      const generationInput = {
        ...input.contentPayload,
        subjectId,
        gradeId,
        curriculumNodeId: lesson.curriculumNodeId.toString(),
      } as unknown as Parameters<typeof GenerationService.generateContent>[2];
      const resource = await GenerationService.generateContent(schoolId, teacherId, generationInput);
      baseMaterial.contentResourceId = resource._id;
      cleanupIds.push(resource._id as mongoose.Types.ObjectId);
    } else if (input.kind === 'quiz') {
      baseMaterial.quizId = new mongoose.Types.ObjectId(input.quizId);
    } else if (input.kind === 'practice_questions') {
      const payload = input.questionPayload as Record<string, unknown>;
      const rawTypes = Array.isArray(payload.questionTypes)
        ? (payload.questionTypes as unknown[]).filter(
            (t): t is GenerateQuestionType =>
              t === 'mcq' || t === 'true_false' || t === 'short_answer' || t === 'structured',
          )
        : [];
      const questionTypes: GenerateQuestionType[] =
        rawTypes.length > 0 ? rawTypes : ['mcq', 'short_answer'];
      const cognitiveLevel =
        payload.cognitiveLevel === 'recall'
        || payload.cognitiveLevel === 'application'
        || payload.cognitiveLevel === 'analysis'
          ? (payload.cognitiveLevel as GenerateCognitiveLevel)
          : undefined;
      const difficulty =
        payload.difficulty === 'easy'
        || payload.difficulty === 'medium'
        || payload.difficulty === 'hard'
          ? (payload.difficulty as GenerateDifficulty)
          : undefined;
      const topicHint =
        typeof payload.topicHint === 'string' ? payload.topicHint : undefined;
      const { subjectId, gradeId } = await resolveSubjectGradeForLesson(lesson);
      const ids = await generateAIQuestions({
        count: typeof payload.count === 'number' ? payload.count : 5,
        questionTypes,
        cognitiveLevel,
        difficulty,
        topicHint,
        schoolId,
        teacherId,
        subjectId,
        gradeId,
        curriculumNodeId: lesson.curriculumNodeId.toString(),
      });
      baseMaterial.questionIds = ids;
      cleanupIds.push(...ids);
    } else if (input.kind === 'homework') {
      baseMaterial.homeworkId = await buildHomeworkRef({
        lesson,
        schoolId,
        teacherId,
        input,
        cleanupIds,
      });
    } else if (input.kind === 'paper') {
      let paperId: mongoose.Types.ObjectId;
      if (input.existingPaperId) {
        paperId = new mongoose.Types.ObjectId(input.existingPaperId);
      } else {
        const payload = (input.createPayload ?? {}) as Record<string, unknown>;
        const paperType =
          payload.paperType === 'test'
          || payload.paperType === 'exam'
          || payload.paperType === 'assessment'
            ? (payload.paperType as SimplePaperType)
            : undefined;
        const sections = Array.isArray(payload.sections)
          ? (payload.sections as unknown[]).filter(
              (s): s is GeneratePaperSection =>
                typeof s === 'object'
                && s !== null
                && typeof (s as GeneratePaperSection).title === 'string'
                && typeof (s as GeneratePaperSection).questionCount === 'number'
                && (
                  (s as GeneratePaperSection).questionType === 'mcq'
                  || (s as GeneratePaperSection).questionType === 'true_false'
                  || (s as GeneratePaperSection).questionType === 'short_answer'
                  || (s as GeneratePaperSection).questionType === 'structured'
                ),
            )
          : undefined;
        const { subjectId, gradeId } = await resolveSubjectGradeForLesson(lesson);
        const paper = await generatePaperWithAI({
          schoolId,
          teacherId,
          subjectId,
          gradeId,
          curriculumNodeId: lesson.curriculumNodeId.toString(),
          paperType,
          totalMarks: typeof payload.totalMarks === 'number' ? payload.totalMarks : undefined,
          durationMinutes:
            typeof payload.durationMinutes === 'number' ? payload.durationMinutes : undefined,
          sections,
          topicHint: typeof payload.topicHint === 'string' ? payload.topicHint : undefined,
          title: typeof payload.title === 'string' ? payload.title : undefined,
        });
        paperId = paper._id as mongoose.Types.ObjectId;
        cleanupIds.push(paperId);
      }
      baseMaterial.paperId = paperId;
    }

    const updated = await Lesson.findOneAndUpdate(
      { _id: lessonId, schoolId, isDeleted: false },
      {
        $push: {
          materials: baseMaterial,
          'phases.$[ph].materialIds': materialId,
        },
      },
      {
        new: true,
        arrayFilters: [{ 'ph.phase': input.phase }],
      },
    );
    if (!updated) throw new Error('Lesson update failed');
    const created = updated.materials.find((m) => m._id.toString() === materialId.toString());
    if (!created) throw new Error('Material write inconsistency');
    return toPlainMaterial(created);
  } catch (err: unknown) {
    for (const id of cleanupIds) {
      await softDeleteEntity(cleanupKind, id);
    }
    throw err;
  }
}

// ── updateMaterial ──────────────────────────────────────────────────────────
export async function updateMaterial(
  lessonId: string,
  materialId: string,
  schoolId: string,
  patch: UpdateMaterialInput,
): Promise<ILessonMaterial> {
  const setOps: Record<string, unknown> = {};
  if (patch.title !== undefined) setOps['materials.$[m].title'] = patch.title;
  if (patch.teacherNotes !== undefined) setOps['materials.$[m].teacherNotes'] = patch.teacherNotes;
  const matOid = new mongoose.Types.ObjectId(materialId);
  const updated = await Lesson.findOneAndUpdate(
    { _id: lessonId, schoolId, isDeleted: false, 'materials._id': matOid },
    { $set: setOps },
    { new: true, arrayFilters: [{ 'm._id': matOid }] },
  );
  if (!updated) throw new Error('Material not found');
  const m = updated.materials.find((x) => x._id.toString() === materialId);
  if (!m) throw new Error('Material write inconsistency');
  return toPlainMaterial(m);
}

// ── moveMaterial ────────────────────────────────────────────────────────────
export async function moveMaterial(
  lessonId: string,
  materialId: string,
  schoolId: string,
  toPhase: LessonPhase,
  toIndex: number,
): Promise<ILesson> {
  const lesson = await Lesson.findOne({ _id: lessonId, schoolId, isDeleted: false });
  if (!lesson) throw new Error('Lesson not found');
  const matId = new mongoose.Types.ObjectId(materialId);
  for (const phase of lesson.phases) {
    phase.materialIds = phase.materialIds.filter((id) => id.toString() !== matId.toString());
  }
  const target = lesson.phases.find((p) => p.phase === toPhase);
  if (!target) throw new Error('Invalid phase');
  const insertAt = Math.min(Math.max(toIndex, 0), target.materialIds.length);
  target.materialIds.splice(insertAt, 0, matId);
  await lesson.save();
  return lesson.toObject() as ILesson;
}

// ── deleteMaterial ──────────────────────────────────────────────────────────
export async function deleteMaterial(
  lessonId: string,
  materialId: string,
  schoolId: string,
): Promise<void> {
  const lesson = await Lesson.findOne({ _id: lessonId, schoolId, isDeleted: false });
  if (!lesson) throw new Error('Lesson not found');
  const material = lesson.materials.find((m) => m._id.toString() === materialId);
  if (!material) throw new Error('Material not found');

  const m = material as {
    contentResourceId?: mongoose.Types.ObjectId;
    homeworkId?: mongoose.Types.ObjectId;
    questionIds?: mongoose.Types.ObjectId[];
    comprehensionQuestionIds?: mongoose.Types.ObjectId[];
  };
  const refIds: mongoose.Types.ObjectId[] = [];
  if (m.contentResourceId) refIds.push(m.contentResourceId);
  if (m.homeworkId) refIds.push(m.homeworkId);
  if (m.questionIds?.length) refIds.push(...m.questionIds);
  if (m.comprehensionQuestionIds?.length) refIds.push(...m.comprehensionQuestionIds);
  for (const id of refIds) {
    await softDeleteEntity(material.kind, id);
  }

  const matOid = new mongoose.Types.ObjectId(materialId);
  await Lesson.updateOne(
    { _id: lessonId, schoolId },
    {
      $pull: {
        materials: { _id: matOid },
        'phases.$[].materialIds': matOid,
      },
    },
  );
}

// ── regenerateMaterial ──────────────────────────────────────────────────────
export async function regenerateMaterial(
  lessonId: string,
  materialId: string,
  schoolId: string,
  teacherId: string,
  payload?: AddMaterialInput,
): Promise<ILessonMaterial> {
  const lesson = await Lesson.findOne({ _id: lessonId, schoolId, isDeleted: false });
  if (!lesson) throw new Error('Lesson not found');
  const existing = lesson.materials.find((m) => m._id.toString() === materialId);
  if (!existing) throw new Error('Material not found');
  if (!payload) throw new Error('Regenerate requires payload (v1)');

  const phaseEntry = lesson.phases.find((p) =>
    p.materialIds.some((id) => id.toString() === materialId),
  );
  await deleteMaterial(lessonId, materialId, schoolId);
  return addMaterial(lessonId, schoolId, teacherId, {
    ...payload,
    phase: phaseEntry?.phase ?? 'practice',
  });
}
