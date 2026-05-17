import mongoose from 'mongoose';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { ContentResource } from '../ContentLibrary/model.js';
import { Question, AssessmentPaper } from '../QuestionBank/model.js';
import { Homework } from '../Homework/model.js';
import { logger } from '../../common/logger.js';
import type { ILesson, ILessonMaterial, LessonMaterialKind } from './types.js';

// ── Compensation ────────────────────────────────────────────────────────────

/**
 * Soft-deletes the side-effect doc created by an addMaterial flow when the
 * lesson update itself fails — keeps the database from leaking orphaned
 * ContentResource / Question / Homework / AssessmentPaper docs.
 */
export async function softDeleteEntity(
  kind: LessonMaterialKind,
  id: mongoose.Types.ObjectId | undefined,
  schoolId?: string,
): Promise<void> {
  if (!id) return;
  const scoped = schoolId && mongoose.isValidObjectId(schoolId)
    ? { _id: id, schoolId: new mongoose.Types.ObjectId(schoolId) }
    : { _id: id };
  try {
    if (
      kind === 'worksheet' || kind === 'activity'
      || kind === 'study_notes' || kind === 'worked_example'
    ) {
      await ContentResource.updateOne(scoped, { $set: { isDeleted: true } });
    } else if (kind === 'practice_questions') {
      await Question.updateOne(scoped, { $set: { isDeleted: true } });
    } else if (kind === 'reading') {
      // Comprehension questions stored on the reading material are Question docs
      await Question.updateOne(scoped, { $set: { isDeleted: true } });
    } else if (kind === 'homework') {
      await Homework.updateOne(scoped, { $set: { isDeleted: true } });
    } else if (kind === 'paper') {
      await AssessmentPaper.updateOne(scoped, { $set: { isDeleted: true } });
    }
  } catch (err: unknown) {
    logger.error({ kind, id: id.toString(), err }, '[lesson] compensation cleanup failed');
  }
}

// ── Mongoose subdoc unwrap ──────────────────────────────────────────────────

export function toPlainMaterial(m: ILessonMaterial): ILessonMaterial {
  const maybeDoc = m as unknown as { toObject?: () => ILessonMaterial };
  return typeof maybeDoc.toObject === 'function' ? maybeDoc.toObject() : m;
}

// ── Subject/grade resolution ────────────────────────────────────────────────

/**
 * Resolve the subject/grade IDs for downstream AI generators (content,
 * questions, comprehension, papers). Prefer the IDs stored on the lesson;
 * fall back to the topic node's denormalized refs when the lesson was
 * created without them (standalone teacher portal). Throws a clear error
 * when neither source has the IDs — better than silently writing bad refs
 * into Question/ContentResource/Homework docs.
 */
export async function resolveSubjectGradeForLesson(
  lesson: ILesson,
): Promise<{ subjectId: string; gradeId: string }> {
  let subjectId = lesson.subjectId?.toString();
  let gradeId = lesson.gradeId?.toString();
  if (!subjectId || !gradeId) {
    const node = await CurriculumNode.findById(lesson.curriculumNodeId)
      .select('subjectId gradeId')
      .lean<{
        subjectId?: mongoose.Types.ObjectId | null;
        gradeId?: mongoose.Types.ObjectId | null;
      } | null>();
    if (!subjectId && node?.subjectId) subjectId = node.subjectId.toString();
    if (!gradeId && node?.gradeId) gradeId = node.gradeId.toString();
  }
  if (!subjectId || !gradeId) {
    throw new Error(
      'Cannot generate material: lesson and its curriculum topic both lack subject/grade refs',
    );
  }
  return { subjectId, gradeId };
}
