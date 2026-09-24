// src/modules/Course/service-course-generation.ts
//
// Writes a class unit's items after the teacher approves its outline: notes
// and worked examples become library resources, quick checks become question
// bank questions. Runs from the course-generation job (or in-process when the
// queue is down). Each item is claimed atomically, so a second run of the same
// job never writes an item twice, and teacher-edited items are never touched.

import mongoose from 'mongoose';
import { Course, CourseLesson, CourseModule, type ICourse, type ICourseLesson, type ICourseModule } from './model.js';
import { Grade } from '../Academic/model.js';
import { GenerationService } from '../ContentLibrary/service-generation.js';
import { generateAIQuestions } from '../QuestionBank/service-questions-generation.js';
import { Question } from '../QuestionBank/model.js';
import { logger } from '../../common/logger.js';

const CONCURRENCY = 3;
const QUICK_CHECK_QUESTIONS = 4;
/** An item "writing" for longer than this was left behind by a restart: it can be picked up again. */
export const STALE_WRITING_MS = 10 * 60 * 1000;
/** Library resources written for units: kept out of the school's daily AI count (the unit was counted once). */
export const UNIT_RESOURCE_TAG = 'class_unit';

const staleCutoff = () => new Date(Date.now() - STALE_WRITING_MS);
/** Items a run may take: waiting ones, and ones a restart left half-written. */
const claimable = () => ({ $or: [{ genStatus: 'pending' }, { genStatus: 'generating', updatedAt: { $lt: staleCutoff() } }] });

/** Whether the teacher can try an item again: it failed, or a restart left it half-written. */
export function isRetryable(item: { genStatus?: string | null; updatedAt?: Date }): boolean {
  if (item.genStatus === 'failed') return true;
  return item.genStatus === 'generating' && !!item.updatedAt && item.updatedAt.getTime() < Date.now() - STALE_WRITING_MS;
}

/** Quick checks are marked by the chosen option, so every question needs choices and one right answer. */
async function assertAnswerable(ids: mongoose.Types.ObjectId[], schoolId: mongoose.Types.ObjectId): Promise<void> {
  if (ids.length === 0) throw new Error('The quick check came back empty. Try again.');
  const questions = await Question.find({ _id: { $in: ids }, schoolId, isDeleted: false }).select('type options').lean();
  const answerable = questions.length === ids.length && questions.every((q) =>
    q.type === 'mcq' && q.options.length >= 2 && q.options.filter((o) => o.isCorrect).length === 1);
  if (!answerable) {
    await Question.updateMany({ _id: { $in: ids }, schoolId }, { $set: { isDeleted: true } });
    throw new Error('The quick check came back without answer choices. Try again.');
  }
}

type Unit = Pick<ICourse, '_id' | 'schoolId' | 'createdBy' | 'scope'>;
type Item = Pick<ICourseLesson, '_id' | 'title' | 'brief' | 'minutes' | 'objectives' | 'itemKind'>;
type Module = Pick<ICourseModule, 'curriculumNodeId'>;
type ItemUpdate = Partial<Pick<ICourseLesson, 'contentResourceId' | 'quizQuestionIds'>>;

function instructionsFor(item: Item, gradeName: string): string {
  const objectives = item.objectives.length > 0 ? ` Learners should be able to: ${item.objectives.join('; ')}.` : '';
  return [
    `Write "${item.title}" for ${gradeName} learners, about ${item.minutes ?? 8} minutes of their time.`,
    item.brief,
    objectives,
    'Use short sentences, South African English and CAPS terms for this grade.',
  ].filter(Boolean).join(' ');
}

async function writeItem(unit: Unit, module: Module, item: Item, gradeName: string): Promise<ItemUpdate> {
  const scope = unit.scope!;
  const curriculumNodeId = String(module.curriculumNodeId);
  const base = {
    curriculumNodeId,
    gradeId: String(scope.gradeId),
    subjectId: String(scope.subjectId),
    term: scope.termNumber,
    difficulty: 2,
    instructions: instructionsFor(item, gradeName),
  };
  if (item.itemKind === 'quick_check') {
    // Multiple choice only: it's marked by the chosen option, never by matching
    // the AI's answer text, so a learner can't be marked wrong for wording.
    const ids = await generateAIQuestions({
      count: QUICK_CHECK_QUESTIONS,
      questionTypes: ['mcq'],
      difficulty: 'easy',
      cognitiveLevel: 'recall',
      schoolId: String(unit.schoolId),
      teacherId: String(unit.createdBy),
      subjectId: base.subjectId,
      gradeId: base.gradeId,
      curriculumNodeId,
      topicHint: `${item.title}. ${item.brief}`.trim(),
    });
    await assertAnswerable(ids, unit.schoolId);
    return { quizQuestionIds: ids };
  }
  const resource = await GenerationService.generateContent(
    String(unit.schoolId),
    String(unit.createdBy),
    item.itemKind === 'worked_example'
      ? { ...base, type: 'worked_example', blockTypes: ['text', 'step_reveal'] }
      : { ...base, type: 'study_notes', blockTypes: ['text'] },
    { skipUsageLimit: true, tags: [UNIT_RESOURCE_TAG] },
  );
  return { contentResourceId: resource._id as mongoose.Types.ObjectId };
}

async function runOne(unit: Unit, lessonId: mongoose.Types.ObjectId, gradeName: string): Promise<void> {
  const item = await CourseLesson.findOneAndUpdate(
    { _id: lessonId, schoolId: unit.schoolId, isDeleted: false, ...claimable() },
    { $set: { genStatus: 'generating', genError: '' } },
    { returnDocument: 'after' },
  ).lean();
  if (!item) return; // another run has it
  const counters = { _id: unit._id, schoolId: unit.schoolId };
  if (item.teacherEdited) {
    await CourseLesson.updateOne({ _id: item._id, schoolId: unit.schoolId }, { $set: { genStatus: 'ready' } });
    await Course.updateOne(counters, { $inc: { 'generation.done': 1 } });
    return;
  }
  try {
    const module = await CourseModule.findOne({ _id: item.moduleId, schoolId: unit.schoolId, isDeleted: false }).lean();
    if (!module?.curriculumNodeId) throw new Error('This item has no CAPS topic to write from');
    const update = await writeItem(unit, module, item, gradeName);
    await CourseLesson.updateOne({ _id: item._id, schoolId: unit.schoolId }, { $set: { ...update, genStatus: 'ready', genError: '' } });
    await Course.updateOne(counters, { $inc: { 'generation.done': 1 } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'The item could not be written';
    logger.warn({ err, courseId: String(unit._id), lessonId: String(item._id) }, '[course-gen] item failed');
    await CourseLesson.updateOne({ _id: item._id, schoolId: unit.schoolId }, { $set: { genStatus: 'failed', genError: message } });
    await Course.updateOne(counters, { $inc: { 'generation.failed': 1 } });
  }
}

/** Runs `task` over `ids`, at most `limit` at a time. */
async function inPool<T>(ids: T[], limit: number, task: (id: T) => Promise<void>): Promise<void> {
  let next = 0;
  const lanes = Array.from({ length: Math.min(limit, ids.length) }, async () => {
    while (next < ids.length) {
      const id = ids[next];
      next += 1;
      await task(id);
    }
  });
  await Promise.all(lanes);
}

/** Recounts from the items themselves, so retries and double runs can't skew the numbers. */
async function settle(unitId: mongoose.Types.ObjectId, schoolId: mongoose.Types.ObjectId): Promise<void> {
  const counts = await CourseLesson.aggregate<{ _id: string | null; n: number }>([
    { $match: { courseId: unitId, schoolId, isDeleted: false, itemKind: { $ne: null } } },
    { $group: { _id: '$genStatus', n: { $sum: 1 } } },
  ]);
  const of = (status: string) => counts.find((c) => c._id === status)?.n ?? 0;
  const total = counts.reduce((sum, c) => sum + c.n, 0);
  const done = of('ready');
  const failed = of('failed');
  const busy = of('pending') + of('generating');
  const status = busy > 0 ? 'running' : failed === total && total > 0 ? 'failed' : 'done';
  const message = busy > 0
    ? ''
    : failed === 0
      ? `All ${total} items are ready.`
      : `${done} of ${total} ready; ${failed} couldn't be written.`;
  await Course.updateOne(
    { _id: unitId, schoolId },
    { $set: { 'generation.status': status, 'generation.total': total, 'generation.done': done, 'generation.failed': failed, 'generation.message': message, 'generation.finishedAt': busy > 0 ? null : new Date() } },
  );
}

/** Writes the unit's pending items (or just `lessonId`), three at a time. */
export async function runCourseGeneration(courseId: string, schoolId: string, lessonId?: string): Promise<void> {
  const soid = new mongoose.Types.ObjectId(schoolId);
  const unit = await Course.findOne({ _id: new mongoose.Types.ObjectId(courseId), schoolId: soid, isDeleted: false, kind: 'class_unit' }).lean();
  if (!unit?.scope) return;
  await Course.updateOne({ _id: unit._id, schoolId: soid }, { $set: { 'generation.status': 'running', 'generation.startedAt': unit.generation?.startedAt ?? new Date() } });

  const pending = await CourseLesson.find({
    courseId: unit._id,
    schoolId: soid,
    isDeleted: false,
    ...claimable(),
    ...(lessonId ? { _id: new mongoose.Types.ObjectId(lessonId) } : {}),
  }).sort({ orderIndex: 1 }).select('_id').lean();
  const grade = await Grade.findById(unit.scope.gradeId).select('name').lean();
  const gradeName = grade?.name ?? 'these';

  try {
    await inPool(pending.map((p) => p._id as mongoose.Types.ObjectId), CONCURRENCY, (id) => runOne(unit, id, gradeName));
  } finally {
    // Always recount, so an unexpected error can't leave the unit "running".
    await settle(unit._id as mongoose.Types.ObjectId, soid);
  }
}

/** Puts one item back in the queue: used by "Try again" on a failed item. */
export async function resetItemForRetry(courseId: string, schoolId: string, lessonId: string): Promise<void> {
  const soid = new mongoose.Types.ObjectId(schoolId);
  const coid = new mongoose.Types.ObjectId(courseId);
  const res = await CourseLesson.updateOne(
    { _id: new mongoose.Types.ObjectId(lessonId), courseId: coid, schoolId: soid, isDeleted: false,
      $or: [{ genStatus: 'failed' }, { genStatus: 'generating', updatedAt: { $lt: staleCutoff() } }] },
    { $set: { genStatus: 'pending', genError: '' } },
  );
  if (res.matchedCount === 0) return;
  await Course.updateOne({ _id: coid, schoolId: soid }, { $set: { 'generation.status': 'queued', 'generation.finishedAt': null } });
}
