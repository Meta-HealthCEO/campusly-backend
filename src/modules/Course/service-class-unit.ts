// src/modules/Course/service-class-unit.ts
//
// Class units: a teacher's unit of work for their own classes. The teacher
// picks class, subject, term and CAPS topics; AI drafts an outline; once the
// teacher approves it, the items are written in the background
// (service-course-generation.ts) and the unit is released to classes.

import crypto from 'crypto';
import mongoose from 'mongoose';
import { Course, CourseLesson, CourseModule, type ICourse } from './model.js';
import { assertCanEditCourse, CourseService, type CourseActor } from './service.js';
import { buildOutlinePrompt, normaliseOutline, type OutlineModule, type OutlineTopic } from './outline.js';
import { Class, Grade, Subject, Timetable } from '../Academic/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { ContentResource } from '../ContentLibrary/model.js';
import { Question } from '../QuestionBank/model.js';
import { Student } from '../Student/model.js';
import { isRetryable, resetItemForRetry } from './service-course-generation.js';
import { AIService } from '../../services/ai.service.js';
import { checkUsageLimit } from '../../middleware/usageLimits.js';
import { enqueueCourseGeneration } from '../../jobs/course-generation.job.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors.js';
import { classRosterFilter } from '../../common/class-roster.js';
import { notifyClassLearners } from '../Notification/learner-notices.js';

export interface CreateClassUnitInput {
  classId: string;
  subjectId: string;
  termNumber: number;
  topicNodeIds: string[];
  title?: string;
}

const QUICK_CHECK_PASS_MARK = 50;
const oid = (id: string | mongoose.Types.ObjectId) => new mongoose.Types.ObjectId(String(id));

/** Admins, principals and HODs may act on any class; a teacher only on classes they teach. */
function actsForWholeSchool(actor: CourseActor): boolean {
  return actor.role === 'super_admin' || actor.role === 'school_admin' || actor.isHOD || actor.isSchoolPrincipal;
}

/** The classes a teacher teaches: their register classes and any class on their timetable. */
export async function teacherClassIds(schoolId: string, teacherId: string): Promise<Set<string>> {
  const soid = oid(schoolId);
  const toid = oid(teacherId);
  const [registerClasses, timetableClasses] = await Promise.all([
    Class.find({ schoolId: soid, teacherId: toid, isDeleted: false }).select('_id').lean(),
    Timetable.distinct('classId', { schoolId: soid, teacherId: toid, isDeleted: false }),
  ]);
  return new Set([...registerClasses.map((c) => String(c._id)), ...timetableClasses.map(String)]);
}

export async function assertTeachesClasses(schoolId: string, actor: CourseActor, classIds: string[], action: 'build' | 'release' = 'build'): Promise<void> {
  if (actsForWholeSchool(actor)) return;
  const mine = await teacherClassIds(schoolId, actor.userId);
  if (classIds.some((id: string) => !mine.has(id))) {
    throw new ForbiddenError(action === 'release' ? 'You can only release units to classes you teach' : 'You can only build units for classes you teach');
  }
}

export function slugFor(title: string): string {
  const base = title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return `${base || 'unit'}-${crypto.randomBytes(3).toString('hex')}`;
}

async function unitOrThrow(courseId: string, schoolId: string): Promise<ICourse> {
  if (!mongoose.Types.ObjectId.isValid(courseId)) throw new NotFoundError('Course not found');
  const course = await Course.findOne({ _id: oid(courseId), schoolId: oid(schoolId), isDeleted: false });
  if (!course) throw new NotFoundError('Course not found');
  if (course.kind !== 'class_unit' || !course.scope) throw new BadRequestError('This course is not a class unit');
  return course;
}

async function scopeTopics(course: ICourse): Promise<OutlineTopic[]> {
  const ids = course.scope?.topicNodeIds ?? [];
  const nodes = await CurriculumNode.find({
    _id: { $in: ids },
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: course.schoolId }],
  }).lean();
  const byId = new Map(nodes.map((n) => [String(n._id), n]));
  return ids
    .map((id) => byId.get(String(id)))
    .filter((n): n is NonNullable<typeof n> => n !== undefined)
    .map((n) => ({
      id: String(n._id),
      title: n.title,
      description: n.description ?? '',
      capsReference: n.metadata?.capsReference ?? '',
      weekNumbers: n.metadata?.weekNumbers ?? [],
    }));
}

/** Soft-deletes the unit's current modules and items, then writes the outline's. */
async function replaceOutline(course: ICourse, modules: OutlineModule[]): Promise<void> {
  const filter = { courseId: course._id, schoolId: course.schoolId, isDeleted: false };
  await CourseLesson.updateMany(filter, { $set: { isDeleted: true } });
  await CourseModule.updateMany(filter, { $set: { isDeleted: true } });
  for (const [moduleIndex, m] of modules.entries()) {
    const mod = await CourseModule.create({
      schoolId: course.schoolId,
      courseId: course._id,
      title: m.title,
      orderIndex: moduleIndex,
      objectives: m.objectives,
      curriculumNodeId: oid(m.curriculumNodeId),
      weekNumbers: m.weekNumbers,
    });
    await CourseLesson.insertMany(m.items.map((item, itemIndex) => ({
      schoolId: course.schoolId,
      courseId: course._id,
      moduleId: mod._id,
      orderIndex: itemIndex,
      title: item.title,
      type: item.kind === 'quick_check' ? 'quiz' : 'content',
      passMarkPercent: item.kind === 'quick_check' ? QUICK_CHECK_PASS_MARK : 70,
      itemKind: item.kind,
      minutes: item.minutes,
      objectives: item.objectives,
      capsRef: item.capsRef,
      brief: item.brief,
      isDeleted: false,
    })));
  }
}

export class ClassUnitService {
  static async create(schoolId: string, actor: CourseActor, input: CreateClassUnitInput) {
    const soid = oid(schoolId);
    const klass = await Class.findOne({ _id: oid(input.classId), schoolId: soid, isDeleted: false }).lean();
    if (!klass) throw new NotFoundError('Class not found');
    await assertTeachesClasses(schoolId, actor, [input.classId]);
    const [subject, grade] = await Promise.all([
      Subject.findOne({ _id: oid(input.subjectId), schoolId: soid, isDeleted: false }).lean(),
      Grade.findOne({ _id: klass.gradeId, schoolId: soid, isDeleted: false }).lean(),
    ]);
    if (!subject) throw new NotFoundError('Subject not found');

    const title = input.title?.trim() || [subject.name, grade?.name, `Term ${input.termNumber}`].filter(Boolean).join(' · ');
    const course = await Course.create({
      schoolId: soid,
      title,
      slug: slugFor(title),
      description: '',
      subjectId: subject._id,
      createdBy: oid(actor.userId),
      status: 'draft',
      kind: 'class_unit',
      scope: {
        gradeId: klass.gradeId,
        subjectId: subject._id,
        termNumber: input.termNumber,
        topicNodeIds: input.topicNodeIds.map((id: string) => oid(id)),
        // Not "released to" yet — that only happens through /release. This is
        // just the class the unit was built for, used to pre-tick that dialog.
        classIds: [],
        builtForClassId: klass._id,
      },
      certificateEnabled: false,
    });
    return course.toObject();
  }

  /** Asks the AI for an outline and replaces the unit's modules and items with it. */
  static async draftOutline(courseId: string, schoolId: string, actor: CourseActor) {
    const course = await unitOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (course.outlineStatus === 'approved') {
      throw new BadRequestError('This outline is approved. Its items are being written.');
    }
    const limit = await checkUsageLimit(schoolId, 'maxAiGenerationsPerDay');
    if (!limit.allowed) {
      throw new BadRequestError("Your school has used today's AI drafts. Try again tomorrow.");
    }

    const topics = await scopeTopics(course);
    if (topics.length === 0) throw new BadRequestError('Pick at least one CAPS topic for this unit.');
    const [subject, grade] = await Promise.all([
      Subject.findOne({ _id: course.scope!.subjectId, schoolId: course.schoolId, isDeleted: false }).select('name').lean(),
      Grade.findOne({ _id: course.scope!.gradeId, schoolId: course.schoolId, isDeleted: false }).select('name').lean(),
    ]);
    const prompt = buildOutlinePrompt(
      { subjectName: subject?.name ?? 'the subject', gradeName: grade?.name ?? 'the grade', termNumber: course.scope!.termNumber },
      topics,
    );
    // Nothing is written until the AI's outline has been checked.
    const modules = normaliseOutline(await AIService.generateJSON<unknown>(prompt.system, prompt.user), topics);

    // The outline may have been approved (in another tab) while the AI was
    // working. Claim it atomically before touching any item: moving it back to
    // 'none' only matches an unapproved outline, and approve refuses anything
    // but 'drafted', so it can't be approved while the items are replaced.
    const claim = await Course.updateOne(
      { _id: course._id, schoolId: course.schoolId, outlineStatus: { $ne: 'approved' } },
      { $set: { outlineStatus: 'none' } },
    );
    if (claim.matchedCount === 0) throw new BadRequestError('This outline is approved. Its items are being written.');

    try {
      await replaceOutline(course, modules);
    } catch (err: unknown) {
      // Hand the outline back as it was, so it can be approved or redrafted.
      await Course.updateOne({ _id: course._id, schoolId: course.schoolId, outlineStatus: 'none' }, { $set: { outlineStatus: course.outlineStatus } });
      throw err;
    }
    const res = await Course.updateOne(
      { _id: course._id, schoolId: course.schoolId, outlineStatus: { $ne: 'approved' } },
      {
        $set: {
          outlineStatus: 'drafted',
          aiGenerated: true,
          estimatedDurationHours: Math.round(modules.flatMap((m) => m.items).reduce((sum, i) => sum + i.minutes, 0) / 6) / 10,
        },
      },
    );
    if (res.matchedCount === 0) throw new BadRequestError('This outline is approved. Its items are being written.');
    return CourseService.getCourse(courseId, schoolId);
  }

  /**
   * Whether drafting this unit's outline is a new AI action: true unless the
   * unit already has an AI outline (a redraft of the same unit isn't counted
   * again; the per-day cap still bounds it). An unknown id counts as new —
   * draftOutline refuses it anyway.
   */
  static async isFirstOutline(courseId: string, schoolId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(courseId)) return true;
    const course = await Course.findOne({ _id: oid(courseId), schoolId: oid(schoolId), isDeleted: false }).select('aiGenerated').lean();
    return !course?.aiGenerated;
  }

  /** The teacher approves the outline: every item is queued to be written. */
  static async approveOutline(courseId: string, schoolId: string, actor: CourseActor) {
    const course = await unitOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (course.outlineStatus !== 'drafted') throw new BadRequestError('Draft the outline first');

    const items = { courseId: course._id, schoolId: course.schoolId, isDeleted: false, itemKind: { $ne: null } };
    const total = await CourseLesson.countDocuments(items);
    if (total === 0) throw new BadRequestError('The outline has no items to write');
    // Conditional on the outline still being exactly 'drafted': two tabs (or
    // a retried request) approving at once must not both queue generation.
    const res = await Course.updateOne(
      { _id: course._id, schoolId: course.schoolId, outlineStatus: 'drafted' },
      { $set: { outlineStatus: 'approved', generation: { status: 'queued', total, done: 0, failed: 0, message: '', startedAt: null, finishedAt: null } } },
    );
    if (res.matchedCount === 0) throw new BadRequestError('Draft the outline first');
    // Only the request that won the approval queues the items; a loser must
    // not reset items the winner may already be writing.
    await CourseLesson.updateMany(items, { $set: { genStatus: 'pending', genError: '' } });
    await enqueueCourseGeneration({ courseId, schoolId });
    return CourseService.getCourse(courseId, schoolId);
  }

  /** What the unit page polls while items are written. */
  static async generationState(courseId: string, schoolId: string, actor: CourseActor) {
    const course = await unitOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    const items = await CourseLesson.find({ courseId: course._id, schoolId: course.schoolId, isDeleted: false, itemKind: { $ne: null } })
      .select('_id genStatus genError updatedAt').lean();
    return {
      outlineStatus: course.outlineStatus,
      generation: course.generation,
      items: items.map((i) => ({ id: String(i._id), genStatus: i.genStatus, genError: i.genError, updatedAt: i.updatedAt })),
    };
  }

  /** "Try again" on an item that couldn't be written. */
  static async retryItem(courseId: string, lessonId: string, schoolId: string, actor: CourseActor) {
    const course = await unitOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (!mongoose.Types.ObjectId.isValid(lessonId)) throw new NotFoundError('Item not found');
    const item = await CourseLesson.findOne({ _id: oid(lessonId), courseId: course._id, schoolId: course.schoolId, isDeleted: false }).lean();
    if (!item) throw new NotFoundError('Item not found');
    if (!isRetryable(item)) throw new BadRequestError("Only an item that couldn't be written can be tried again");
    await resetItemForRetry(courseId, schoolId, lessonId);
    await enqueueCourseGeneration({ courseId, schoolId, lessonId });
  }

  /** An item as the teacher checks it: the written content, or the quick check with its answers. */
  static async previewItem(courseId: string, lessonId: string, schoolId: string, actor: CourseActor) {
    const course = await unitOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (!mongoose.Types.ObjectId.isValid(lessonId)) throw new NotFoundError('Item not found');
    const item = await CourseLesson.findOne({ _id: oid(lessonId), courseId: course._id, schoolId: course.schoolId, isDeleted: false }).lean();
    if (!item) throw new NotFoundError('Item not found');
    if (item.genStatus !== 'ready') {
      return { kind: 'not_ready' as const, title: item.title, genStatus: item.genStatus, genError: item.genError };
    }
    if (item.type === 'quiz') {
      const questions = await Question.find({
        _id: { $in: item.quizQuestionIds },
        isDeleted: false,
        $or: [{ schoolId: course.schoolId }, { schoolId: null }],
      }).select('stem type options answer marks diagram').lean();
      return { kind: 'quiz' as const, title: item.title, questions };
    }
    const resource = item.contentResourceId
      ? await ContentResource.findOne({
        _id: item.contentResourceId,
        isDeleted: false,
        $or: [{ schoolId: course.schoolId }, { schoolId: null }],
      }).select('title blocks').lean()
      : null;
    if (!resource) throw new NotFoundError('This item has no content yet');
    return { kind: 'content' as const, title: item.title, blocks: resource.blocks };
  }

  /**
   * Releases the unit to classes: the owner publishes a class unit (no review
   * queue), then each class is enrolled. Every check runs before anything
   * changes, so a refused release leaves the unit as it was.
   */
  static async release(courseId: string, schoolId: string, actor: CourseActor, classIds: string[]) {
    const course = await unitOrThrow(courseId, schoolId);
    // Groups that already had the unit hear nothing on a repeat release.
    const releasedBefore = new Set((course.scope?.classIds ?? []).map(String));
    assertCanEditCourse(course, actor);
    if (course.outlineStatus !== 'approved') throw new BadRequestError('Approve the outline first');
    const itemFilter = { courseId: course._id, schoolId: course.schoolId, isDeleted: false, itemKind: { $ne: null } };
    const totalItems = await CourseLesson.countDocuments(itemFilter);
    if (totalItems === 0) throw new BadRequestError('This unit has no items left. Add some before releasing.');
    const notReady = await CourseLesson.countDocuments({ ...itemFilter, genStatus: { $ne: 'ready' } });
    if (notReady > 0) {
      throw new BadRequestError(`${notReady} item${notReady === 1 ? '' : 's'} still need${notReady === 1 ? 's' : ''} attention`);
    }

    const ids = [...new Set(classIds)];
    if (ids.length === 0) throw new BadRequestError('Pick at least one class');
    if (ids.some((id: string) => !mongoose.Types.ObjectId.isValid(id))) throw new NotFoundError('Class not found');
    await assertTeachesClasses(schoolId, actor, ids, 'release');
    const classes = await Class.find({ _id: { $in: ids.map((id: string) => oid(id)) }, schoolId: course.schoolId, isDeleted: false })
      .select('_id name').lean();
    if (classes.length !== ids.length) throw new NotFoundError('Class not found');
    for (const klass of classes) {
      const learners = await Student.countDocuments(classRosterFilter(klass._id, { schoolId: course.schoolId, isDeleted: false }));
      if (learners === 0) throw new BadRequestError(`${klass.name} has no learners yet`);
    }

    // Enrolling needs a published course, so publish first — but if no class
    // ends up enrolled, put the unit back as it was rather than leave it
    // published and released to nobody.
    const wasPublished = course.status === 'published';
    const before = { status: course.status, publishedBy: course.publishedBy ?? null, publishedAt: course.publishedAt ?? null };
    if (!wasPublished) {
      course.status = 'published';
      course.publishedBy = oid(actor.userId);
      course.publishedAt = new Date();
      await course.save();
    }

    // Each class is recorded as "released to" only once its learners are
    // actually enrolled — never all of them up front. If enrolling one class
    // fails partway through, the classes already enrolled stay correctly
    // recorded and the failed/remaining ones are not, instead of the whole
    // batch being marked released regardless of what actually happened.
    const results = [];
    try {
      for (const klass of classes) {
        const enrolled = await CourseService.assignCourseToClass(courseId, schoolId, actor, { classId: String(klass._id) }, { fromRelease: true });
        await Course.updateOne({ _id: course._id, schoolId: course.schoolId }, { $addToSet: { 'scope.classIds': klass._id } });
        results.push({ classId: String(klass._id), name: klass.name, newEnrolments: enrolled.newEnrolments });
      }
    } catch (err: unknown) {
      if (!wasPublished && results.length === 0) {
        await Course.updateOne({ _id: course._id, schoolId: course.schoolId }, { $set: before });
      }
      throw err;
    }
    const newlyReleased = results.map((r) => r.classId).filter((id: string) => !releasedBefore.has(id));
    await notifyClassLearners(course.schoolId, newlyReleased, {
      title: `New lesson: ${course.title}`,
      message: 'Your teacher released a new lesson.',
      entityType: 'class_unit',
      entityId: String(course._id),
      link: `/student/courses/${String(course._id)}`,
    });
    return { classes: results };
  }
}
