import mongoose from 'mongoose';
import { Lesson } from './model.js';
import type { ILessonMaterial, ILesson, LessonPhase } from './types.js';
import type { AddMaterialInput, UpdateMaterialInput } from './validation.js';
import { GenerationService } from '../ContentLibrary/service-generation.js';
import { HomeworkService } from '../Homework/service.js';
import { ContentResource } from '../ContentLibrary/model.js';
import { Question } from '../QuestionBank/model.js';
import { Homework } from '../Homework/model.js';
import { logger } from '../../common/logger.js';

// ── Stubs (real implementations land in later tasks) ────────────────────────
// Forward declaration — real impl arrives in Task 7.
async function generateComprehensionFromTextbook(
  _ref: unknown,
  _schoolId: string,
  _teacherId: string,
  _subjectId: string,
  _gradeId: string,
  _curriculumNodeId: string,
  _count: number,
): Promise<mongoose.Types.ObjectId[]> {
  throw new Error('generateComprehensionFromTextbook not yet implemented (Task 7)');
}

// Stub — QuestionsService has no batch AI generator yet; planned for a later task.
async function generateAIQuestions(
  _payload: Record<string, unknown> & {
    schoolId: string;
    teacherId: string;
    subjectId: string;
    gradeId: string;
    curriculumNodeId: string;
  },
): Promise<mongoose.Types.ObjectId[]> {
  throw new Error('generateAIQuestions not yet implemented (Task TBD)');
}

// Stub — PapersService.createPaper exists but no standalone AI helper export.
async function generatePaperWithAI(
  _payload: Record<string, unknown> & { schoolId: string; teacherId: string },
): Promise<{ _id: mongoose.Types.ObjectId }> {
  throw new Error('generatePaperWithAI not yet implemented (Task TBD)');
}

// ── Compensation ────────────────────────────────────────────────────────────
async function softDeleteEntity(
  kind: string,
  id: mongoose.Types.ObjectId | undefined,
): Promise<void> {
  if (!id) return;
  try {
    if (kind === 'worksheet' || kind === 'activity' || kind === 'notes' || kind === 'worked_example') {
      await ContentResource.updateOne({ _id: id }, { $set: { isDeleted: true } });
    } else if (kind === 'practice_questions') {
      await Question.updateOne({ _id: id }, { $set: { isDeleted: true } });
    } else if (kind === 'homework') {
      await Homework.updateOne({ _id: id }, { $set: { isDeleted: true } });
    }
  } catch (err: unknown) {
    logger.error({ kind, id: id.toString(), err }, '[lesson] compensation cleanup failed');
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function toPlainMaterial(m: ILessonMaterial): ILessonMaterial {
  const maybeDoc = m as unknown as { toObject?: () => ILessonMaterial };
  return typeof maybeDoc.toObject === 'function' ? maybeDoc.toObject() : m;
}

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

  let cleanupId: mongoose.Types.ObjectId | undefined;
  const cleanupKind: string = input.kind;

  try {
    if (input.kind === 'reading') {
      baseMaterial.textbookRef = input.textbookRef;
      if (input.generateComprehension) {
        const ids = await generateComprehensionFromTextbook(
          input.textbookRef,
          schoolId,
          teacherId,
          lesson.subjectId.toString(),
          lesson.gradeId.toString(),
          lesson.curriculumNodeId.toString(),
          input.comprehensionCount ?? 4,
        );
        baseMaterial.comprehensionQuestionIds = ids;
      }
    } else if (
      input.kind === 'worksheet'
      || input.kind === 'activity'
      || input.kind === 'notes'
      || input.kind === 'worked_example'
    ) {
      const generationInput = {
        ...input.contentPayload,
        subjectId: lesson.subjectId.toString(),
        gradeId: lesson.gradeId.toString(),
        curriculumNodeId: lesson.curriculumNodeId.toString(),
      } as unknown as Parameters<typeof GenerationService.generateContent>[2];
      const resource = await GenerationService.generateContent(schoolId, teacherId, generationInput);
      baseMaterial.contentResourceId = resource._id;
      cleanupId = resource._id as mongoose.Types.ObjectId;
    } else if (input.kind === 'quiz') {
      baseMaterial.quizId = new mongoose.Types.ObjectId(input.quizId);
    } else if (input.kind === 'practice_questions') {
      const ids = await generateAIQuestions({
        ...input.questionPayload,
        schoolId,
        teacherId,
        subjectId: lesson.subjectId.toString(),
        gradeId: lesson.gradeId.toString(),
        curriculumNodeId: lesson.curriculumNodeId.toString(),
      });
      baseMaterial.questionIds = ids;
    } else if (input.kind === 'homework') {
      let homeworkId: mongoose.Types.ObjectId;
      if (input.existingHomeworkId) {
        homeworkId = new mongoose.Types.ObjectId(input.existingHomeworkId);
      } else {
        const hw = await HomeworkService.create(
          {
            ...input.createPayload,
            schoolId,
            classId: lesson.classId.toString(),
            subjectId: lesson.subjectId.toString(),
          } as never,
          teacherId,
        );
        homeworkId = hw._id as mongoose.Types.ObjectId;
        cleanupId = homeworkId;
      }
      baseMaterial.homeworkId = homeworkId;
    } else if (input.kind === 'paper') {
      let paperId: mongoose.Types.ObjectId;
      if (input.existingPaperId) {
        paperId = new mongoose.Types.ObjectId(input.existingPaperId);
      } else {
        const paper = await generatePaperWithAI({
          ...input.createPayload,
          schoolId,
          teacherId,
        });
        paperId = paper._id;
        cleanupId = paperId;
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
    if (cleanupId) await softDeleteEntity(cleanupKind, cleanupId);
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

  const refId =
    (material as { contentResourceId?: mongoose.Types.ObjectId }).contentResourceId
    ?? (material as { homeworkId?: mongoose.Types.ObjectId }).homeworkId
    ?? undefined;
  await softDeleteEntity(material.kind, refId);

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
