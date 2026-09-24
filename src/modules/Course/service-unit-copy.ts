// src/modules/Course/service-unit-copy.ts
//
// Reusing class units: copy a unit to another class of the same grade (this
// term or next year), and the school library of released units to copy from.
// A copy is deep: its items' content and quick-check questions are new
// documents, because editing an item writes its content in place and a
// question edit retires the old questions. Learner-side records never come
// along, and no AI is spent.

import mongoose from 'mongoose';
import { Course, CourseLesson, CourseModule, type ICourse, type ICourseLesson } from './model.js';
import { assertCanEditCourse, type CourseActor } from './service.js';
import { assertTeachesClasses, slugFor } from './service-class-unit.js';
import { UNIT_RESOURCE_TAG } from './service-course-generation.js';
import { canCopyFrom, copyTitle, libraryEntry, type LibraryEntry } from './unit-copy.js';
import { Class, Grade, Subject } from '../Academic/model.js';
import { ContentResource } from '../ContentLibrary/model.js';
import { Question } from '../QuestionBank/model.js';
import { User } from '../Auth/model.js';
import { logger } from '../../common/logger.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors.js';

type Id = mongoose.Types.ObjectId;
const oid = (id: string | Id) => new mongoose.Types.ObjectId(String(id));
const LIBRARY_LIMIT = 100;

export interface CopyUnitInput {
  classId: string;
  termNumber: number;
  title?: string;
}

function canEdit(course: ICourse, actor: CourseActor): boolean {
  try {
    assertCanEditCourse(course, actor);
    return true;
  } catch {
    return false;
  }
}

const isWriting = (course: ICourse, lessons: ICourseLesson[]): boolean =>
  course.generation?.status === 'queued' || course.generation?.status === 'running'
  || lessons.some((l) => l.genStatus === 'pending' || l.genStatus === 'generating');

/** New copies of the documents the unit's items own; the map is old id → new id. */
async function cloneDocs(
  collection: mongoose.Collection,
  ids: Id[],
  schoolId: Id,
  change: (doc: Record<string, unknown>) => Record<string, unknown>,
): Promise<Map<string, Id>> {
  const map = new Map<string, Id>();
  if (ids.length === 0) return map;
  const docs = await collection.find({ _id: { $in: ids }, schoolId, isDeleted: false }).toArray();
  if (docs.length === 0) return map;
  const now = new Date();
  const copies = docs.map((doc) => {
    const _id = new mongoose.Types.ObjectId();
    map.set(String(doc._id), _id);
    return { ...change(doc), _id, createdAt: now, updatedAt: now };
  });
  await collection.insertMany(copies);
  return map;
}

async function gradeName(gradeId: Id): Promise<string> {
  const grade = await Grade.findOne({ _id: gradeId, isDeleted: false }).select('name').lean();
  return grade?.name ?? 'this grade';
}

/** Checks the copier may use this unit and this class; returns the unit, its items and the class. */
async function checkCopy(courseId: string, schoolId: string, actor: CourseActor, input: CopyUnitInput) {
  if (!mongoose.Types.ObjectId.isValid(courseId)) throw new NotFoundError('Unit not found');
  const soid = oid(schoolId);
  const source = await Course.findOne({ _id: oid(courseId), schoolId: soid, isDeleted: false }).lean() as ICourse | null;
  if (!source) throw new NotFoundError('Unit not found');
  const editable = canEdit(source, actor);
  const check = canCopyFrom(source, editable);
  if (!check.ok) throw editable ? new BadRequestError(check.reason) : new ForbiddenError(check.reason);
  if (!source.scope) throw new BadRequestError('This unit has no class or grade to copy from.');

  const lessons = await CourseLesson.find({ courseId: source._id, schoolId: soid, isDeleted: false }).lean() as ICourseLesson[];
  if (isWriting(source, lessons)) throw new BadRequestError('Wait until the items are written, then copy the unit.');

  if (!mongoose.Types.ObjectId.isValid(input.classId)) throw new NotFoundError('Class not found');
  const klass = await Class.findOne({ _id: oid(input.classId), schoolId: soid, isDeleted: false }).select('_id gradeId').lean();
  if (!klass) throw new NotFoundError('Class not found');
  await assertTeachesClasses(schoolId, actor, [input.classId]);
  if (String(klass.gradeId) !== String(source.scope.gradeId)) {
    const name = await gradeName(source.scope.gradeId);
    throw new BadRequestError(`This unit is for ${name}. Pick a ${name} class.`);
  }
  return { source, lessons, klass, soid };
}

export class UnitCopyService {
  /** A copy of the unit for one of the copier's classes: their own draft, ready to release. */
  static async copy(courseId: string, schoolId: string, actor: CourseActor, input: CopyUnitInput) {
    const { source, lessons, klass, soid } = await checkCopy(courseId, schoolId, actor, input);
    const scope = source.scope!;
    const createdBy = oid(actor.userId);
    const made: { resources: Id[]; questions: Id[]; course: Id | null } = { resources: [], questions: [], course: null };

    try {
      // The unit's own items get their own content and questions; items the
      // teacher attached from the library keep pointing at the library.
      const own = lessons.filter((l) => l.itemKind);
      const resources = await cloneDocs(
        ContentResource.collection, own.map((l) => l.contentResourceId).filter((id): id is Id => !!id), soid,
        (doc) => ({ ...doc, createdBy, tags: [...new Set([...((doc.tags as string[]) ?? []), UNIT_RESOURCE_TAG])] }),
      );
      made.resources = [...resources.values()];
      const questions = await cloneDocs(
        Question.collection, own.filter((l) => l.itemKind === 'quick_check').flatMap((l) => l.quizQuestionIds ?? []), soid,
        (doc) => ({ ...doc, createdBy, usageCount: 0 }),
      );
      made.questions = [...questions.values()];

      const title = input.title?.trim() || copyTitle(source.title, input.termNumber, scope.termNumber);
      const course = await Course.create({
        schoolId: soid, title, slug: slugFor(title), description: source.description ?? '', subjectId: source.subjectId,
        createdBy, status: 'draft', kind: 'class_unit', outlineStatus: 'approved', generation: source.generation,
        aiGenerated: false, sequential: source.sequential !== false, certificateEnabled: false,
        passMarkPercent: source.passMarkPercent, copiedFrom: source._id,
        scope: { gradeId: scope.gradeId, subjectId: scope.subjectId, termNumber: input.termNumber, topicNodeIds: scope.topicNodeIds, classIds: [klass._id] },
      });
      made.course = course._id as Id;

      const modules = await CourseModule.find({ courseId: source._id, schoolId: soid, isDeleted: false }).sort({ orderIndex: 1 }).lean();
      const moduleMap = new Map<string, Id>();
      for (const m of modules) {
        const copy = await CourseModule.create({
          schoolId: soid, courseId: course._id, title: m.title, orderIndex: m.orderIndex,
          objectives: m.objectives ?? [], curriculumNodeId: m.curriculumNodeId ?? null, weekNumbers: m.weekNumbers ?? [],
        });
        moduleMap.set(String(m._id), copy._id as Id);
      }

      await CourseLesson.insertMany(lessons.filter((l) => moduleMap.has(String(l.moduleId))).map((l) => {
        const { _id: _old, createdAt: _c, updatedAt: _u, ...rest } = l as ICourseLesson & { createdAt?: Date; updatedAt?: Date };
        const contentId = l.contentResourceId ? resources.get(String(l.contentResourceId)) ?? l.contentResourceId : null;
        return {
          ...rest,
          courseId: course._id,
          moduleId: moduleMap.get(String(l.moduleId)),
          contentResourceId: contentId,
          quizQuestionIds: (l.quizQuestionIds ?? []).map((id) => questions.get(String(id)) ?? id),
        };
      }));
      return course.toObject();
    } catch (err: unknown) {
      logger.error({ err, courseId }, '[unit-copy] copy failed; removing what was made');
      await Promise.all([
        ContentResource.updateMany({ _id: { $in: made.resources }, schoolId: soid }, { $set: { isDeleted: true } }),
        Question.updateMany({ _id: { $in: made.questions }, schoolId: soid }, { $set: { isDeleted: true } }),
        made.course ? Course.updateOne({ _id: made.course, schoolId: soid }, { $set: { isDeleted: true } }) : null,
        made.course ? CourseModule.updateMany({ courseId: made.course, schoolId: soid }, { $set: { isDeleted: true } }) : null,
        made.course ? CourseLesson.updateMany({ courseId: made.course, schoolId: soid }, { $set: { isDeleted: true } }) : null,
      ]);
      throw err;
    }
  }

  /** Every released unit in the school, newest first, to copy from. */
  static async library(schoolId: string, actor: CourseActor, filters: { gradeId?: string; subjectId?: string }): Promise<LibraryEntry[]> {
    const soid = oid(schoolId);
    const query: Record<string, unknown> = { schoolId: soid, isDeleted: false, kind: 'class_unit', status: 'published' };
    if (filters.gradeId && mongoose.Types.ObjectId.isValid(filters.gradeId)) query['scope.gradeId'] = oid(filters.gradeId);
    if (filters.subjectId && mongoose.Types.ObjectId.isValid(filters.subjectId)) query['scope.subjectId'] = oid(filters.subjectId);
    const units = await Course.find(query).sort({ publishedAt: -1, createdAt: -1 }).limit(LIBRARY_LIMIT).lean() as ICourse[];
    if (units.length === 0) return [];

    const ids = units.map((u) => u._id as Id);
    const [grades, subjects, authors, lessons] = await Promise.all([
      Grade.find({ _id: { $in: units.map((u) => u.scope?.gradeId).filter((id): id is Id => !!id) }, isDeleted: false }).select('name').lean(),
      Subject.find({ _id: { $in: units.map((u) => u.scope?.subjectId).filter((id): id is Id => !!id) }, schoolId: soid, isDeleted: false }).select('name').lean(),
      User.find({ _id: { $in: units.map((u) => u.createdBy) }, schoolId: soid }).select('firstName lastName').lean(),
      CourseLesson.find({ courseId: { $in: ids }, schoolId: soid, isDeleted: false }).select('courseId minutes').lean(),
    ]);
    const name = <T extends { _id: unknown; name?: string }>(docs: T[]) => new Map(docs.map((d) => [String(d._id), d.name ?? '']));
    const gradeNames = name(grades);
    const subjectNames = name(subjects);
    const authorNames = new Map(authors.map((a) => [String(a._id), `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim()]));

    return units.map((u) => {
      const items = lessons.filter((l) => String(l.courseId) === String(u._id));
      return libraryEntry(u, {
        gradeName: gradeNames.get(String(u.scope?.gradeId)) ?? '',
        subjectName: subjectNames.get(String(u.scope?.subjectId)) ?? '',
        authorName: authorNames.get(String(u.createdBy)) || 'A teacher',
        items: items.length,
        minutes: items.reduce((sum, l) => sum + (l.minutes ?? 0), 0),
        viewerId: actor.userId,
      });
    });
  }
}
