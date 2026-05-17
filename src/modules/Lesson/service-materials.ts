import mongoose from 'mongoose';
import { Lesson } from './model.js';
import type { ILessonMaterial, ILesson, LessonPhase, LessonMaterialKind } from './types.js';
import type { AddMaterialInput, UpdateMaterialInput } from './validation.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { GenerationService } from '../ContentLibrary/service-generation.js';
import { generateComprehensionFromTextbook } from '../Homework/service-homework-comprehension.js';
import { Homework } from '../Homework/model.js';
import { Quiz } from '../Learning/model.js';
import { AssessmentPaper } from '../QuestionBank/model-papers.js';
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
import {
  lessonAccessFilter,
  ownerFilterForScope,
  schoolIdFromScope,
  schoolObjectId,
  toObjectId,
  type LessonActor,
  type LessonScope,
} from './service-access.js';

// ── addMaterial ─────────────────────────────────────────────────────────────
export async function addMaterial(
  lessonId: string,
  actor: LessonActor,
  input: AddMaterialInput,
): Promise<ILessonMaterial> {
  const schoolId = schoolIdFromScope(actor);
  const teacherId = actor.id;
  const lesson = await Lesson.findOne({
    _id: toObjectId(lessonId, 'lessonId'),
    ...lessonAccessFilter(actor),
  });
  if (!lesson) throw new NotFoundError('Lesson not found');

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
      await assertLinkedRefAvailable('quiz', input.quizId, actor);
      baseMaterial.quizId = toObjectId(input.quizId, 'quizId');
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
        actor,
        input,
        cleanupIds,
      });
    } else if (input.kind === 'paper') {
      let paperId: mongoose.Types.ObjectId;
      if (input.existingPaperId) {
        await assertLinkedRefAvailable('paper', input.existingPaperId, actor);
        paperId = toObjectId(input.existingPaperId, 'paperId');
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
      { _id: toObjectId(lessonId, 'lessonId'), ...lessonAccessFilter(actor) },
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
    if (!updated) throw new NotFoundError('Lesson not found');
    const created = updated.materials.find((m) => m._id.toString() === materialId.toString());
    if (!created) throw new BadRequestError('Material write inconsistency');
    return toPlainMaterial(created);
  } catch (err: unknown) {
    for (const id of cleanupIds) {
      await softDeleteEntity(cleanupKind, id, schoolId);
    }
    throw err;
  }
}

// ── updateMaterial ──────────────────────────────────────────────────────────
export async function updateMaterial(
  lessonId: string,
  materialId: string,
  scope: LessonScope,
  patch: UpdateMaterialInput,
): Promise<ILessonMaterial> {
  const setOps: Record<string, unknown> = {};
  if (patch.title !== undefined) setOps['materials.$[m].title'] = patch.title;
  if (patch.teacherNotes !== undefined) setOps['materials.$[m].teacherNotes'] = patch.teacherNotes;
  const matOid = toObjectId(materialId, 'materialId');
  const updated = await Lesson.findOneAndUpdate(
    {
      _id: toObjectId(lessonId, 'lessonId'),
      ...lessonAccessFilter(scope),
      'materials._id': matOid,
    },
    { $set: setOps },
    { new: true, arrayFilters: [{ 'm._id': matOid }] },
  );
  if (!updated) throw new NotFoundError('Material not found');
  const m = updated.materials.find((x) => x._id.toString() === materialId);
  if (!m) throw new BadRequestError('Material write inconsistency');
  return toPlainMaterial(m);
}

// ── moveMaterial ────────────────────────────────────────────────────────────
export async function moveMaterial(
  lessonId: string,
  materialId: string,
  scope: LessonScope,
  toPhase: LessonPhase,
  toIndex: number,
): Promise<ILesson> {
  const lesson = await Lesson.findOne({
    _id: toObjectId(lessonId, 'lessonId'),
    ...lessonAccessFilter(scope),
  });
  if (!lesson) throw new NotFoundError('Lesson not found');
  const matId = toObjectId(materialId, 'materialId');
  for (const phase of lesson.phases) {
    phase.materialIds = phase.materialIds.filter((id) => id.toString() !== matId.toString());
  }
  const target = lesson.phases.find((p) => p.phase === toPhase);
  if (!target) throw new BadRequestError('Invalid phase');
  const insertAt = Math.min(Math.max(toIndex, 0), target.materialIds.length);
  target.materialIds.splice(insertAt, 0, matId);
  await lesson.save();
  return lesson.toObject() as ILesson;
}

// ── deleteMaterial ──────────────────────────────────────────────────────────
export async function deleteMaterial(
  lessonId: string,
  materialId: string,
  scope: LessonScope,
): Promise<void> {
  const lesson = await Lesson.findOne({
    _id: toObjectId(lessonId, 'lessonId'),
    ...lessonAccessFilter(scope),
  });
  if (!lesson) throw new NotFoundError('Lesson not found');
  const material = lesson.materials.find((m) => m._id.toString() === materialId);
  if (!material) throw new NotFoundError('Material not found');

  const matOid = toObjectId(materialId, 'materialId');
  const result = await Lesson.updateOne(
    { _id: toObjectId(lessonId, 'lessonId'), ...lessonAccessFilter(scope) },
    {
      $pull: {
        materials: { _id: matOid },
        'phases.$[].materialIds': matOid,
      },
    },
  );
  if (result.matchedCount === 0) throw new NotFoundError('Lesson not found');
}

// ── regenerateMaterial ──────────────────────────────────────────────────────
export async function regenerateMaterial(
  lessonId: string,
  materialId: string,
  actor: LessonActor,
  payload?: AddMaterialInput,
): Promise<ILessonMaterial> {
  const lesson = await Lesson.findOne({
    _id: toObjectId(lessonId, 'lessonId'),
    ...lessonAccessFilter(actor),
  });
  if (!lesson) throw new NotFoundError('Lesson not found');
  const existing = lesson.materials.find((m) => m._id.toString() === materialId);
  if (!existing) throw new NotFoundError('Material not found');
  if (!payload) throw new BadRequestError('Regenerate requires payload (v1)');

  const phaseEntry = lesson.phases.find((p) =>
    p.materialIds.some((id) => id.toString() === materialId),
  );
  const phase = phaseEntry?.phase ?? payload.phase ?? 'practice';
  const originalIndex = Math.max(
    0,
    phaseEntry?.materialIds.findIndex((id) => id.toString() === materialId) ?? 0,
  );
  const replacement = await addMaterial(lessonId, actor, {
    ...payload,
    phase,
  });
  await deleteMaterial(lessonId, materialId, actor);
  await moveMaterial(lessonId, replacement._id.toString(), actor, phase, originalIndex);
  return replacement;
}

async function assertLinkedRefAvailable(
  kind: 'quiz' | 'homework' | 'paper',
  rawId: string,
  scope: LessonScope,
): Promise<void> {
  const id = toObjectId(rawId, `${kind}Id`);
  const schoolId = schoolObjectId(scope);

  if (kind === 'quiz') {
    const ok = await Quiz.exists({
      _id: id,
      schoolId,
      isDeleted: false,
      ...ownerFilterForScope(scope, 'teacherId'),
    });
    if (!ok) throw new BadRequestError('Quiz is not available for this lesson');
    return;
  }

  if (kind === 'homework') {
    const ok = await Homework.exists({
      _id: id,
      schoolId,
      isDeleted: false,
      ...ownerFilterForScope(scope, 'teacherId'),
    });
    if (!ok) throw new BadRequestError('Homework is not available for this lesson');
    return;
  }

  const ok = await AssessmentPaper.exists({
    _id: id,
    schoolId,
    isDeleted: false,
    ...ownerFilterForScope(scope, 'createdBy'),
  });
  if (!ok) throw new BadRequestError('Paper is not available for this lesson');
}
