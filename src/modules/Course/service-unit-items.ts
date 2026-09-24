// src/modules/Course/service-unit-items.ts
//
// A teacher changing a unit's items: editing notes, worked-example steps and
// quick-check questions; asking the AI for an easier, harder, shorter,
// simpler or translated version; choosing whether learners go in order; and
// adding a revision item on the questions the class got wrong. Every edit or
// rewrite marks the item teacherEdited, so background writing never touches
// it again. Content edits are allowed after release (fixing a mistake).

import crypto from 'crypto';
import mongoose from 'mongoose';
import { Course, CourseLesson, CourseModule, type ICourse, type ICourseLesson } from './model.js';
import { assertCanEditCourse, type CourseActor } from './service.js';
import { checkNotesEdit, checkQuestionsEdit, checkStepsEdit, rewriteInstruction, type QuestionEdit, type RewriteAction } from './item-edits.js';
import { assertAnswerable } from './service-course-generation.js';
import { ContentResource } from '../ContentLibrary/model.js';
import { GenerationService } from '../ContentLibrary/service-generation.js';
import { Question } from '../QuestionBank/model.js';
import { generateAIQuestions } from '../QuestionBank/service-questions-generation.js';
import { Grade } from '../Academic/model.js';
import { checkUsageLimit } from '../../middleware/usageLimits.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';

const oid = (id: string | mongoose.Types.ObjectId) => new mongoose.Types.ObjectId(String(id));
const blockId = () => crypto.randomBytes(6).toString('hex');
const REVISION_MINUTES = 6;
const MAX_REVISION_QUESTIONS = 5;

async function editableItem(courseId: string, lessonId: string, schoolId: string, actor: CourseActor) {
  if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lessonId)) throw new NotFoundError('Item not found');
  const course = await Course.findOne({ _id: oid(courseId), schoolId: oid(schoolId), isDeleted: false });
  if (!course) throw new NotFoundError('Course not found');
  assertCanEditCourse(course, actor);
  const item = await CourseLesson.findOne({ _id: oid(lessonId), courseId: course._id, schoolId: course.schoolId, isDeleted: false });
  if (!item) throw new NotFoundError('Item not found');
  return { course, item };
}

async function gradeNameOf(course: ICourse): Promise<string> {
  if (!course.scope) return 'these';
  const grade = await Grade.findById(course.scope.gradeId).select('name').lean();
  return grade?.name ?? 'these';
}

async function markEdited(item: ICourseLesson, extra: Partial<Pick<ICourseLesson, 'quizQuestionIds' | 'contentResourceId'>> = {}): Promise<void> {
  await CourseLesson.updateOne(
    { _id: item._id, schoolId: item.schoolId },
    { $set: { ...extra, teacherEdited: true, genStatus: 'ready', genError: '' } },
  );
}

/** New answerable questions for a quick check, filed like the unit's own. */
async function createQuestions(course: ICourse, item: ICourseLesson, questions: QuestionEdit[], createdBy: string): Promise<mongoose.Types.ObjectId[]> {
  const mod = await CourseModule.findOne({ _id: item.moduleId, schoolId: course.schoolId, isDeleted: false }).select('curriculumNodeId').lean();
  const old = await Question.findOne({ _id: { $in: item.quizQuestionIds }, schoolId: course.schoolId }).select('curriculumNodeId').lean();
  const curriculumNodeId = mod?.curriculumNodeId ?? old?.curriculumNodeId;
  if (!curriculumNodeId || !course.scope) throw new BadRequestError('This quick check has no CAPS topic to file its questions under.');
  const docs = await Question.insertMany(questions.map((q) => ({
    curriculumNodeId, schoolId: course.schoolId, subjectId: course.scope!.subjectId, gradeId: course.scope!.gradeId,
    type: 'mcq', stem: q.stem, options: q.options, answer: q.options.find((o) => o.isCorrect)?.text ?? '',
    marks: 1, cognitiveLevel: { caps: 'knowledge', blooms: 'remember' }, difficulty: 2, tags: ['class_unit'],
    source: 'teacher', status: 'approved', createdBy: oid(createdBy), usageCount: 0, isDeleted: false,
  })));
  return docs.map((d) => d._id as mongoose.Types.ObjectId);
}

async function swapQuestions(item: ICourseLesson, next: mongoose.Types.ObjectId[]): Promise<void> {
  const previous = item.quizQuestionIds;
  await markEdited(item, { quizQuestionIds: next });
  // The old questions were written for this item; retire them so they don't linger in the bank.
  await Question.updateMany({ _id: { $in: previous }, schoolId: item.schoolId }, { $set: { isDeleted: true } });
}

export class UnitItemsService {
  /** Saves edited notes (text blocks) or worked-example steps. */
  static async saveContent(
    courseId: string, lessonId: string, schoolId: string, actor: CourseActor,
    body: { blocks?: Array<{ blockId?: string; type: string; content: string }>; steps?: Array<{ title: string; content: string }> },
  ) {
    const { item } = await editableItem(courseId, lessonId, schoolId, actor);
    if (item.itemKind !== 'notes' && item.itemKind !== 'worked_example') throw new BadRequestError('This item has no text to edit');
    if (!item.contentResourceId) throw new BadRequestError("This item hasn't been written yet");
    const blocks = item.itemKind === 'worked_example'
      ? [{ blockId: blockId(), type: 'step_reveal', order: 0, content: JSON.stringify({ steps: checkStepsEdit(body.steps ?? []) }) }]
      : checkNotesEdit((body.blocks ?? []).map((b) => ({ blockId: b.blockId || blockId(), type: b.type, content: b.content })))
        .map((b, i) => ({ ...b, order: i }));
    const res = await ContentResource.updateOne(
      { _id: item.contentResourceId, schoolId: item.schoolId, isDeleted: false },
      { $set: { blocks } },
    );
    if (res.matchedCount === 0) throw new NotFoundError("This item's content was not found");
    await markEdited(item);
  }

  /** Replaces a quick check's questions with the teacher's own. */
  static async saveQuestions(
    courseId: string, lessonId: string, schoolId: string, actor: CourseActor,
    body: { questions: Array<{ stem: string; options: Array<{ text: string; isCorrect: boolean }> }> },
  ) {
    const { course, item } = await editableItem(courseId, lessonId, schoolId, actor);
    if (item.itemKind !== 'quick_check') throw new BadRequestError('This item is not a quick check');
    const questions = checkQuestionsEdit(body.questions);
    await swapQuestions(item, await createQuestions(course, item, questions, actor.userId));
  }

  /** Asks the AI to rewrite an item; on failure the item stays as it was. */
  static async rewrite(
    courseId: string, lessonId: string, schoolId: string, actor: CourseActor,
    body: { action: RewriteAction; language?: string },
  ) {
    const { course, item } = await editableItem(courseId, lessonId, schoolId, actor);
    const instruction = rewriteInstruction(body.action, { gradeName: await gradeNameOf(course), language: body.language });
    const limit = await checkUsageLimit(schoolId, 'maxAiGenerationsPerDay');
    if (!limit.allowed) throw new BadRequestError('Your school has used today\'s AI allowance. Try again tomorrow.');

    if (item.itemKind === 'quick_check') {
      if (!course.scope) throw new BadRequestError('This unit has no scope');
      const mod = await CourseModule.findOne({ _id: item.moduleId, schoolId: course.schoolId, isDeleted: false }).select('curriculumNodeId').lean();
      if (!mod?.curriculumNodeId) throw new BadRequestError('This quick check has no CAPS topic to write from.');
      const ids = await generateAIQuestions({
        count: Math.max(1, item.quizQuestionIds.length || 4),
        questionTypes: ['mcq'],
        difficulty: body.action === 'easier' ? 'easy' : body.action === 'harder' ? 'hard' : 'medium',
        cognitiveLevel: 'recall',
        schoolId, teacherId: actor.userId,
        subjectId: String(course.scope.subjectId), gradeId: String(course.scope.gradeId),
        curriculumNodeId: String(mod.curriculumNodeId),
        topicHint: `${item.title}. ${instruction}`,
      });
      await assertAnswerable(ids, course.schoolId);
      await swapQuestions(item, ids);
      return;
    }
    if (!item.contentResourceId) throw new BadRequestError("This item hasn't been written yet");
    const resource = await ContentResource.findOne({ _id: item.contentResourceId, schoolId: item.schoolId, isDeleted: false }).select('createdBy').lean();
    if (!resource) throw new NotFoundError("This item's content was not found");
    // The unit's resources belong to its author; the edit right was checked above.
    await GenerationService.refineContent(String(item.contentResourceId), schoolId, String(resource.createdBy), { instruction });
    await markEdited(item);
  }

  /** Whether learners must finish each item before the next opens. */
  static async updateSettings(courseId: string, schoolId: string, actor: CourseActor, body: { sequential: boolean }) {
    if (!mongoose.Types.ObjectId.isValid(courseId)) throw new NotFoundError('Course not found');
    const course = await Course.findOne({ _id: oid(courseId), schoolId: oid(schoolId), isDeleted: false });
    if (!course) throw new NotFoundError('Course not found');
    assertCanEditCourse(course, actor);
    course.sequential = body.sequential;
    await course.save();
    return { sequential: course.sequential };
  }

  /** Adds a revision item, right after the check, on the questions the class got wrong. */
  static async addRevisionItem(
    courseId: string, schoolId: string, actor: CourseActor,
    body: { afterLessonId: string; questionIds: string[] },
  ) {
    const { course, item: check } = await editableItem(courseId, body.afterLessonId, schoolId, actor);
    if (!course.scope) throw new BadRequestError('This unit has no scope');
    const mod = await CourseModule.findOne({ _id: check.moduleId, schoolId: course.schoolId, isDeleted: false }).lean();
    if (!mod?.curriculumNodeId) throw new BadRequestError('This part of the unit has no CAPS topic to write from.');
    const ids = body.questionIds.filter((id) => mongoose.Types.ObjectId.isValid(id)).slice(0, MAX_REVISION_QUESTIONS).map((id) => oid(id));
    const questions = await Question.find({ _id: { $in: ids }, $or: [{ schoolId: course.schoolId }, { schoolId: null }] }).select('stem').lean();
    if (questions.length === 0) throw new BadRequestError('Pick the questions to revise');

    const gradeName = await gradeNameOf(course);
    const topic = check.title.replace(/^Check:\s*/i, '').trim() || check.title;
    const resource = await GenerationService.generateContent(schoolId, actor.userId, {
      curriculumNodeId: String(mod.curriculumNodeId),
      type: 'study_notes',
      gradeId: String(course.scope.gradeId),
      subjectId: String(course.scope.subjectId),
      term: course.scope.termNumber,
      blockTypes: ['text'],
      difficulty: 2,
      instructions: [
        `Write a short revision note for ${gradeName} learners who got these questions wrong:`,
        ...questions.map((q, i) => `${i + 1}. ${q.stem}`),
        'Re-teach the idea behind each one with a fresh example, simply, then give one practice example to try.',
      ].join('\n'),
    });

    await CourseLesson.updateMany(
      { moduleId: check.moduleId, schoolId: course.schoolId, isDeleted: false, orderIndex: { $gt: check.orderIndex } },
      { $inc: { orderIndex: 1 } },
    );
    const revision = await CourseLesson.create({
      schoolId: course.schoolId, courseId: course._id, moduleId: check.moduleId, orderIndex: check.orderIndex + 1,
      title: `Revision: ${topic}`, type: 'content', contentResourceId: resource._id, itemKind: 'notes',
      minutes: REVISION_MINUTES, objectives: [], capsRef: check.capsRef, brief: 'Revision of the questions the class got wrong',
      genStatus: 'ready', teacherEdited: true,
    });
    return revision.toObject();
  }
}
