/**
 * Seeds the ready-made class unit (course-content.ts) for the walkthrough:
 * released to the homeroom class, with three learners at different points so
 * the teacher sees progress. Leaves an existing copy of the unit alone.
 */
import crypto from 'crypto';
import { Types } from 'mongoose';
import { Course, CourseLesson, CourseModule, Enrolment, LessonProgress, QuizAttempt } from '../../modules/Course/model.js';
import { CourseService } from '../../modules/Course/service.js';
import { ContentResource } from '../../modules/ContentLibrary/model.js';
import { CurriculumNode } from '../../modules/CurriculumStructure/model.js';
import { Question } from '../../modules/QuestionBank/model.js';
import { Student } from '../../modules/Student/model.js';
import { UserRole } from '../../common/enums.js';
import { DEMO_UNIT, type DemoUnitItem } from './course-content.js';

type Id = Types.ObjectId;

export interface UnitSeedScope {
  schoolId: Id;
  teacherId: Id;
  classId: Id;
  gradeId: Id;
  subjectId: Id;
  /** Grade 1 Mathematics Term 3 CAPS topic ids. */
  topicIds: Id[];
}

interface SeededItem { id: Id; kind: DemoUnitItem['kind']; questionIds: Id[] }

const blockId = () => crypto.randomBytes(6).toString('hex');

async function contentFor(scope: UnitSeedScope, topicId: Id, item: DemoUnitItem): Promise<Id> {
  const blocks = item.kind === 'worked_example'
    ? [{ blockId: blockId(), type: 'step_reveal', order: 0, content: JSON.stringify({ steps: item.steps ?? [] }) }]
    : [{ blockId: blockId(), type: 'text', order: 0, content: item.text ?? '' }];
  const resource = await ContentResource.create({
    curriculumNodeId: topicId, schoolId: scope.schoolId, type: item.kind === 'worked_example' ? 'worked_example' : 'study_notes',
    format: 'static', title: item.title, blocks, source: 'system', gradeId: scope.gradeId, subjectId: scope.subjectId, term: 3,
    status: 'approved', createdBy: scope.teacherId, estimatedMinutes: item.minutes, tags: ['demo-unit', 'class_unit'],
  });
  return resource._id as Id;
}

async function questionsFor(scope: UnitSeedScope, topicId: Id, item: DemoUnitItem): Promise<Id[]> {
  const docs = await Question.insertMany((item.questions ?? []).map((q) => ({
    curriculumNodeId: topicId, schoolId: scope.schoolId, subjectId: scope.subjectId, gradeId: scope.gradeId,
    type: 'mcq', stem: q.stem, options: q.options, answer: q.options.find((o) => o.isCorrect)?.text ?? '',
    marks: 1, cognitiveLevel: { caps: 'knowledge', blooms: 'remember' }, difficulty: 1, tags: ['demo-unit'],
    source: 'system', status: 'approved', createdBy: scope.teacherId, usageCount: 0, isDeleted: false,
  })));
  return docs.map((d) => d._id as Id);
}

/**
 * Learner progress for the walkthrough, by admission number: the first has
 * passed the first quick check and is at item 4 (Lebo, who can sign in and
 * continue), the second is stuck on that check after two failed tries, a
 * third (if the class has one) has just started.
 */
async function seedProgress(scope: UnitSeedScope, courseId: Id, items: SeededItem[]): Promise<void> {
  const learners = await Student.find({ classId: scope.classId, schoolId: scope.schoolId, isDeleted: false }).sort({ admissionNumber: 1 }).limit(3).lean();
  const plans: Array<{ done: number; scores: number[]; failedTries?: number[] }> = [
    { done: 3, scores: [3] },
    // Two tries at 1 of 4 (25%): below the 50% pass mark.
    { done: 2, scores: [], failedTries: [1, 1] },
    { done: 1, scores: [] },
  ];
  for (const [i, learner] of learners.entries()) {
    const enrolment = await Enrolment.findOne({ courseId, studentId: learner._id, schoolId: scope.schoolId, isDeleted: false });
    if (!enrolment) continue;
    const plan = plans[i];
    let quizIndex = 0;
    for (const [n, item] of items.entries()) {
      if (n > plan.done) break;
      const finished = n < plan.done;
      await LessonProgress.updateOne(
        { enrolmentId: enrolment._id, lessonId: item.id, isDeleted: false },
        { $set: { schoolId: scope.schoolId, studentId: learner._id, courseId, status: finished ? 'completed' : 'in_progress', completedAt: finished ? new Date() : null, scrolledToEnd: finished } },
        { upsert: true },
      );
      if (item.kind === 'quick_check' && finished) {
        const correct = plan.scores[quizIndex] ?? 4;
        quizIndex += 1;
        await QuizAttempt.create({
          schoolId: scope.schoolId, enrolmentId: enrolment._id, studentId: learner._id, courseId, lessonId: item.id, attemptNumber: 1,
          answers: item.questionIds.map((questionId, q) => ({ questionId, answer: q < correct ? 'right' : 'wrong', isCorrect: q < correct, marks: q < correct ? 1 : 0 })),
          totalMarks: item.questionIds.length, earnedMarks: correct, percent: Math.round((correct / item.questionIds.length) * 100), passed: correct * 2 >= item.questionIds.length,
        });
      }
    }
    // A learner stuck on the next quick check: failed tries, no pass.
    const nextItem = items[plan.done];
    if (plan.failedTries && nextItem?.kind === 'quick_check') {
      for (const [t, correct] of plan.failedTries.entries()) {
        await QuizAttempt.create({
          schoolId: scope.schoolId, enrolmentId: enrolment._id, studentId: learner._id, courseId, lessonId: nextItem.id, attemptNumber: t + 1,
          answers: nextItem.questionIds.map((questionId, q) => ({ questionId, answer: q < correct ? 'right' : 'wrong', isCorrect: q < correct, marks: q < correct ? 1 : 0 })),
          totalMarks: nextItem.questionIds.length, earnedMarks: correct, percent: Math.round((correct / nextItem.questionIds.length) * 100), passed: false,
        });
      }
    }
    const percent = Math.round((plan.done / items.length) * 100);
    enrolment.progressPercent = percent;
    if (percent === 100) {
      enrolment.status = 'completed';
      enrolment.completedAt = new Date();
    }
    await enrolment.save();
  }
}

export async function seedCourseUnit(scope: UnitSeedScope): Promise<string | null> {
  const existing = await Course.exists({ schoolId: scope.schoolId, createdBy: scope.teacherId, kind: 'class_unit', title: DEMO_UNIT.title, isDeleted: false });
  if (existing) return DEMO_UNIT.title;
  const topics = await CurriculumNode.find({ _id: { $in: scope.topicIds }, isDeleted: false }).lean();
  const topicByTitle = new Map(topics.map((t) => [t.title, t]));
  const modules = DEMO_UNIT.modules.flatMap((m) => {
    const topic = topicByTitle.get(m.capsTopic);
    return topic ? [{ m, topic }] : [];
  });
  if (modules.length === 0) return null;

  const minutes = modules.flatMap(({ m }) => m.items).reduce((sum, item) => sum + item.minutes, 0);
  const course = await Course.create({
    schoolId: scope.schoolId, title: DEMO_UNIT.title, slug: `numbers-to-99-${crypto.randomBytes(3).toString('hex')}`,
    description: DEMO_UNIT.description, subjectId: scope.subjectId, createdBy: scope.teacherId, status: 'published',
    publishedBy: scope.teacherId, publishedAt: new Date(), kind: 'class_unit', outlineStatus: 'approved', certificateEnabled: false,
    estimatedDurationHours: Math.round((minutes / 60) * 10) / 10,
    scope: { gradeId: scope.gradeId, subjectId: scope.subjectId, termNumber: 3, topicNodeIds: modules.map(({ topic }) => topic._id), classIds: [scope.classId] },
    generation: { status: 'done', total: 0, done: 0, failed: 0, message: '' },
  });

  const items: SeededItem[] = [];
  for (const [mi, { m, topic }] of modules.entries()) {
    const mod = await CourseModule.create({
      schoolId: scope.schoolId, courseId: course._id, title: m.title, orderIndex: mi, objectives: m.objectives,
      curriculumNodeId: topic._id, weekNumbers: topic.metadata?.weekNumbers ?? [],
    });
    for (const [ii, item] of m.items.entries()) {
      const isCheck = item.kind === 'quick_check';
      const questionIds = isCheck ? await questionsFor(scope, topic._id as Id, item) : [];
      const lesson = await CourseLesson.create({
        schoolId: scope.schoolId, courseId: course._id, moduleId: mod._id, orderIndex: ii, title: item.title,
        type: isCheck ? 'quiz' : 'content', contentResourceId: isCheck ? null : await contentFor(scope, topic._id as Id, item),
        quizQuestionIds: questionIds, passMarkPercent: isCheck ? 50 : 70, itemKind: item.kind, minutes: item.minutes,
        objectives: item.objectives, capsRef: topic.metadata?.capsReference || topic.title, brief: item.brief, genStatus: 'ready',
      });
      items.push({ id: lesson._id as Id, kind: item.kind, questionIds });
    }
  }
  await Course.updateOne({ _id: course._id }, { $set: { 'generation.total': items.length, 'generation.done': items.length, 'generation.message': `All ${items.length} items are ready.` } });

  const actor = { userId: String(scope.teacherId), role: UserRole.TEACHER, isHOD: false, isSchoolPrincipal: false };
  // Enrol the class the way a release does (the catalogue assign route refuses class units).
  await CourseService.assignCourseToClass(String(course._id), String(scope.schoolId), actor, { classId: String(scope.classId) }, { fromRelease: true });
  await seedProgress(scope, course._id as Id, items);
  return DEMO_UNIT.title;
}
