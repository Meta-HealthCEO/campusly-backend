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
import { AIService } from '../../services/ai.service.js';
import { checkUsageLimit } from '../../middleware/usageLimits.js';
import { assertCourseGenerationAccess } from '../subscription/entitlements.js';
import { enqueueCourseGeneration } from '../../jobs/course-generation.job.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors.js';

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

export async function assertTeachesClasses(schoolId: string, actor: CourseActor, classIds: string[]): Promise<void> {
  if (actsForWholeSchool(actor)) return;
  const mine = await teacherClassIds(schoolId, actor.userId);
  if (classIds.some((id: string) => !mine.has(id))) {
    throw new ForbiddenError('You can only build units for classes you teach');
  }
}

function slugFor(title: string): string {
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
      Grade.findOne({ _id: klass.gradeId, isDeleted: false }).lean(),
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
        classIds: [klass._id],
      },
      certificateEnabled: false,
    });
    return course.toObject();
  }

  /** Asks the AI for an outline and replaces the unit's modules and items with it. */
  static async draftOutline(courseId: string, schoolId: string, actor: CourseActor, isStandaloneTeacher: boolean) {
    const course = await unitOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (course.outlineStatus === 'approved') {
      throw new BadRequestError('This outline is approved. Its items are being written.');
    }
    await assertCourseGenerationAccess(schoolId, isStandaloneTeacher);
    const limit = await checkUsageLimit(schoolId, 'maxAiGenerationsPerDay');
    if (!limit.allowed) {
      throw new BadRequestError(`Daily AI generation limit reached (${limit.current}/${limit.limit}). Try again tomorrow.`);
    }

    const topics = await scopeTopics(course);
    if (topics.length === 0) throw new BadRequestError('Pick at least one CAPS topic for this unit.');
    const [subject, grade] = await Promise.all([
      Subject.findById(course.scope!.subjectId).select('name').lean(),
      Grade.findById(course.scope!.gradeId).select('name').lean(),
    ]);
    const prompt = buildOutlinePrompt(
      { subjectName: subject?.name ?? 'the subject', gradeName: grade?.name ?? 'the grade', termNumber: course.scope!.termNumber },
      topics,
    );
    // Nothing is written until the AI's outline has been checked.
    const modules = normaliseOutline(await AIService.generateJSON<unknown>(prompt.system, prompt.user), topics);

    await replaceOutline(course, modules);
    course.outlineStatus = 'drafted';
    course.aiGenerated = true;
    course.estimatedDurationHours = Math.round(modules.flatMap((m) => m.items).reduce((sum, i) => sum + i.minutes, 0) / 6) / 10;
    await course.save();
    return CourseService.getCourse(courseId, schoolId);
  }

  /** The teacher approves the outline: every item is queued to be written. */
  static async approveOutline(courseId: string, schoolId: string, actor: CourseActor) {
    const course = await unitOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (course.outlineStatus !== 'drafted') throw new BadRequestError('Draft the outline first');

    const items = { courseId: course._id, schoolId: course.schoolId, isDeleted: false, itemKind: { $ne: null } };
    const total = await CourseLesson.countDocuments(items);
    if (total === 0) throw new BadRequestError('The outline has no items to write');
    await CourseLesson.updateMany(items, { $set: { genStatus: 'pending', genError: '' } });
    course.outlineStatus = 'approved';
    course.generation = { status: 'queued', total, done: 0, failed: 0, message: '', startedAt: null, finishedAt: null };
    await course.save();
    await enqueueCourseGeneration({ courseId, schoolId });
    return course.toObject();
  }
}
