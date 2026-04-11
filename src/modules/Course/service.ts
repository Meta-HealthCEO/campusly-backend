import mongoose from 'mongoose';
import {
  Course,
  CourseModule,
  CourseLesson,
  Enrolment,
  type ICourse,
  type ICourseModule,
  type ICourseLesson,
} from './model.js';
import { Student } from '../Student/model.js';
import { Class } from '../Academic/model.js';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from '../../common/errors.js';
import { escapeRegex } from '../../common/utils.js';
import { UserRole } from '../../common/enums.js';
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CourseQueryInput,
  CreateModuleInput,
  UpdateModuleInput,
  ReorderModulesInput,
  CreateLessonInput,
  UpdateLessonInput,
  ReorderLessonsInput,
  RejectCourseInput,
  AssignCourseInput,
} from './validation.js';

// ─── Actor type ────────────────────────────────────────────────────────────

/**
 * Represents the authenticated user performing a course action.
 * Controllers build this from req.user (Task 5).
 * Exported so controllers can construct it without re-importing UserRole
 * separately.
 */
export interface CourseActor {
  userId: string;
  role: UserRole;
  isHOD: boolean;
  isSchoolPrincipal: boolean;
}

// ─── Authorisation helpers ──────────────────────────────────────────────────
//
// NOTE: The campusly `UserRole` enum does not include dedicated `principal` or
// `hod` roles — those are boolean flags (`isHOD`, `isSchoolPrincipal`) on the
// User document and are decoded into the JWT by auth middleware.
//
// Permission tiers:
//   publisher — can approve/reject the review workflow (publish/reject courses)
//               super_admin, school_admin, or any teacher with isHOD/isSchoolPrincipal
//   author    — can create/edit/delete courses
//               super_admin, school_admin, teacher (any)

function canPublish(actor: CourseActor): boolean {
  if (actor.role === UserRole.SUPER_ADMIN || actor.role === UserRole.SCHOOL_ADMIN) {
    return true;
  }
  // Teachers carrying the HOD or principal flag have review authority.
  return actor.isHOD || actor.isSchoolPrincipal;
}

function canAuthor(actor: CourseActor): boolean {
  return (
    actor.role === UserRole.SUPER_ADMIN ||
    actor.role === UserRole.SCHOOL_ADMIN ||
    actor.role === UserRole.TEACHER
  );
}

// super_admin, school_admin, HOD, and principal can edit any course in the
// school. Regular teachers can only edit their own courses.
function assertCanEditCourse(course: ICourse, actor: CourseActor): void {
  // Non-authors (parents, students, SGB members) cannot edit courses at all.
  if (!canAuthor(actor)) {
    throw new ForbiddenError('You are not allowed to edit courses');
  }
  // super_admin, school_admin, HODs and principals can edit any course in the school.
  if (actor.role === UserRole.SUPER_ADMIN || actor.role === UserRole.SCHOOL_ADMIN) {
    return;
  }
  if (actor.isHOD || actor.isSchoolPrincipal) {
    return;
  }
  // Regular teachers can only edit their own courses.
  if (course.createdBy.toString() !== actor.userId) {
    throw new ForbiddenError('You can only edit your own courses');
  }
}

// ─── Lookup helpers ────────────────────────────────────────────────────────

async function getCourseOrThrow(id: string, schoolId: string): Promise<ICourse> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Course not found');
  }
  const course = await Course.findOne({
    _id: new mongoose.Types.ObjectId(id),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
  if (!course) throw new NotFoundError('Course not found');
  return course;
}

async function getModuleOrThrow(
  courseId: string,
  moduleId: string,
  schoolId: string,
): Promise<ICourseModule> {
  if (!mongoose.Types.ObjectId.isValid(moduleId)) {
    throw new NotFoundError('Module not found');
  }
  const mod = await CourseModule.findOne({
    _id: new mongoose.Types.ObjectId(moduleId),
    courseId: new mongoose.Types.ObjectId(courseId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
  if (!mod) throw new NotFoundError('Module not found');
  return mod;
}

async function getLessonOrThrow(
  courseId: string,
  lessonId: string,
  schoolId: string,
): Promise<ICourseLesson> {
  if (!mongoose.Types.ObjectId.isValid(lessonId)) {
    throw new NotFoundError('Lesson not found');
  }
  const lesson = await CourseLesson.findOne({
    _id: new mongoose.Types.ObjectId(lessonId),
    courseId: new mongoose.Types.ObjectId(courseId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
  if (!lesson) throw new NotFoundError('Lesson not found');
  return lesson;
}

// ─── Service ───────────────────────────────────────────────────────────────

export class CourseService {
  // ─── Course CRUD ─────────────────────────────────────────────────────────

  static async createCourse(
    schoolId: string,
    actor: CourseActor,
    data: CreateCourseInput,
  ) {
    if (!canAuthor(actor)) {
      throw new ForbiddenError('You are not allowed to create courses');
    }

    // Slug uniqueness is enforced by a partial unique index but we pre-check
    // to return a clean ConflictError instead of a MongoError 11000.
    const existing = await Course.findOne({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      slug: data.slug,
      isDeleted: false,
    }).lean();
    if (existing) throw new ConflictError('A course with this slug already exists');

    const course = await Course.create({
      ...data,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      createdBy: new mongoose.Types.ObjectId(actor.userId),
      status: 'draft',
      subjectId: data.subjectId ? new mongoose.Types.ObjectId(data.subjectId) : null,
    });
    return course.toObject();
  }

  static async listCourses(
    schoolId: string,
    actor: CourseActor,
    filters: CourseQueryInput,
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const query: Record<string, unknown> = {
      schoolId: soid,
      isDeleted: false,
    };

    if (filters.status) query.status = filters.status;
    if (filters.subjectId) {
      query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    }
    if (filters.gradeLevel !== undefined) query.gradeLevel = filters.gradeLevel;
    if (filters.mine) query.createdBy = new mongoose.Types.ObjectId(actor.userId);
    if (filters.search) {
      query.title = { $regex: escapeRegex(filters.search), $options: 'i' };
    }

    const courses = await Course.find(query)
      .populate([
        { path: 'subjectId', select: 'name' },
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'publishedBy', select: 'firstName lastName' },
      ])
      .sort({ createdAt: -1 })
      .lean();

    return { courses, total: courses.length };
  }

  static async getCourse(id: string, schoolId: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Course not found');
    }
    const soid = new mongoose.Types.ObjectId(schoolId);
    const course = await Course.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: soid,
      isDeleted: false,
    })
      .populate([
        { path: 'subjectId', select: 'name' },
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'publishedBy', select: 'firstName lastName' },
      ])
      .lean();
    if (!course) throw new NotFoundError('Course not found');

    // Fetch modules + lessons in two scoped queries, then stitch together.
    const modules = await CourseModule.find({
      courseId: course._id,
      schoolId: soid,
      isDeleted: false,
    })
      .sort({ orderIndex: 1 })
      .lean();

    const lessons = await CourseLesson.find({
      courseId: course._id,
      schoolId: soid,
      isDeleted: false,
    })
      .sort({ orderIndex: 1 })
      .lean();

    const lessonsByModule: Record<string, typeof lessons> = {};
    for (const l of lessons) {
      const key = l.moduleId.toString();
      if (!lessonsByModule[key]) lessonsByModule[key] = [];
      lessonsByModule[key].push(l);
    }

    const modulesWithLessons = modules.map((m) => ({
      ...m,
      lessons: lessonsByModule[m._id.toString()] ?? [],
    }));

    return { ...course, modules: modulesWithLessons };
  }

  static async updateCourse(
    id: string,
    schoolId: string,
    actor: CourseActor,
    data: UpdateCourseInput,
  ) {
    const course = await getCourseOrThrow(id, schoolId);
    assertCanEditCourse(course, actor);

    // Metadata edits are always allowed (even on published courses).
    // Structural edits (modules / lessons) go through their own endpoints
    // which enforce the draft-only rule.
    //
    // Destructure subjectId out of the plain-object assign so we never write
    // a raw string to an ObjectId schema field. Every other updatable field
    // in UpdateCourseInput is a primitive that Object.assign handles correctly.
    const { subjectId, ...rest } = data;
    Object.assign(course, rest);
    if (subjectId !== undefined) {
      course.subjectId = subjectId
        ? new mongoose.Types.ObjectId(subjectId)
        : null;
    }
    await course.save();
    return course.toObject();
  }

  static async deleteCourse(id: string, schoolId: string, actor: CourseActor) {
    const course = await getCourseOrThrow(id, schoolId);
    assertCanEditCourse(course, actor);

    if (course.status === 'published') {
      throw new BadRequestError('Cannot delete a published course. Archive it instead.');
    }

    course.isDeleted = true;
    await course.save();
    return { deleted: true };
  }

  // ─── Review workflow ─────────────────────────────────────────────────────

  static async submitForReview(id: string, schoolId: string, actor: CourseActor) {
    const course = await getCourseOrThrow(id, schoolId);
    assertCanEditCourse(course, actor);

    if (course.status !== 'draft') {
      throw new BadRequestError(`Cannot submit a course in '${course.status}' state`);
    }

    const lessonCount = await CourseLesson.countDocuments({
      courseId: course._id,
      schoolId: course.schoolId,
      isDeleted: false,
    });
    if (lessonCount === 0) {
      throw new BadRequestError('Cannot submit an empty course for review');
    }

    course.status = 'in_review';
    course.reviewNotes = '';
    await course.save();
    return course.toObject();
  }

  static async publishCourse(id: string, schoolId: string, actor: CourseActor) {
    if (!canPublish(actor)) {
      throw new ForbiddenError('Only school admins, HODs, or principals can publish courses');
    }

    const course = await getCourseOrThrow(id, schoolId);
    if (course.status !== 'in_review') {
      throw new BadRequestError(`Cannot publish a course in '${course.status}' state`);
    }

    course.status = 'published';
    course.publishedBy = new mongoose.Types.ObjectId(actor.userId);
    course.publishedAt = new Date();
    course.reviewNotes = '';
    await course.save();
    return course.toObject();
  }

  static async rejectCourse(
    id: string,
    schoolId: string,
    actor: CourseActor,
    data: RejectCourseInput,
  ) {
    if (!canPublish(actor)) {
      throw new ForbiddenError('Only school admins, HODs, or principals can reject courses');
    }

    const course = await getCourseOrThrow(id, schoolId);
    if (course.status !== 'in_review') {
      throw new BadRequestError(`Cannot reject a course in '${course.status}' state`);
    }

    course.status = 'draft';
    course.reviewNotes = data.reviewNotes;
    await course.save();
    return course.toObject();
  }

  static async archiveCourse(id: string, schoolId: string, actor: CourseActor) {
    const course = await getCourseOrThrow(id, schoolId);
    assertCanEditCourse(course, actor);

    if (course.status !== 'published') {
      throw new BadRequestError(`Cannot archive a course in '${course.status}' state`);
    }

    course.status = 'archived';
    await course.save();
    return course.toObject();
  }

  // ─── Module CRUD ─────────────────────────────────────────────────────────

  static async addModule(
    courseId: string,
    schoolId: string,
    actor: CourseActor,
    data: CreateModuleInput,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (course.status !== 'draft') {
      throw new BadRequestError('Can only add modules to draft courses');
    }

    const mod = await CourseModule.create({
      schoolId: course.schoolId,
      courseId: course._id,
      title: data.title,
      orderIndex: data.orderIndex,
    });
    return mod.toObject();
  }

  static async updateModule(
    courseId: string,
    moduleId: string,
    schoolId: string,
    actor: CourseActor,
    data: UpdateModuleInput,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (course.status !== 'draft') {
      throw new BadRequestError('Can only edit modules in draft courses');
    }

    const mod = await getModuleOrThrow(courseId, moduleId, schoolId);
    if (data.title !== undefined) mod.title = data.title;
    if (data.orderIndex !== undefined) mod.orderIndex = data.orderIndex;
    await mod.save();
    return mod.toObject();
  }

  static async deleteModule(
    courseId: string,
    moduleId: string,
    schoolId: string,
    actor: CourseActor,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (course.status !== 'draft') {
      throw new BadRequestError('Can only delete modules in draft courses');
    }

    const mod = await getModuleOrThrow(courseId, moduleId, schoolId);

    // Cascade: soft-delete all lessons inside this module.
    await CourseLesson.updateMany(
      {
        moduleId: mod._id,
        schoolId: mod.schoolId,
        isDeleted: false,
      },
      { $set: { isDeleted: true } },
    );

    mod.isDeleted = true;
    await mod.save();
    return { deleted: true };
  }

  static async reorderModules(
    courseId: string,
    schoolId: string,
    actor: CourseActor,
    data: ReorderModulesInput,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (course.status !== 'draft') {
      throw new BadRequestError('Can only reorder modules in draft courses');
    }

    // Verify every supplied id actually belongs to this course (prevents
    // reordering modules that aren't ours).
    const ids = data.orders.map((o) => new mongoose.Types.ObjectId(o.id));
    const count = await CourseModule.countDocuments({
      _id: { $in: ids },
      courseId: course._id,
      schoolId: course.schoolId,
      isDeleted: false,
    });
    if (count !== ids.length) {
      throw new BadRequestError('One or more modules do not belong to this course');
    }

    await Promise.all(
      data.orders.map((o) =>
        CourseModule.updateOne(
          {
            _id: new mongoose.Types.ObjectId(o.id),
            courseId: course._id,
            schoolId: course.schoolId,
            isDeleted: false,
          },
          { $set: { orderIndex: o.orderIndex } },
        ),
      ),
    );

    return { reordered: true };
  }

  // ─── Lesson CRUD ─────────────────────────────────────────────────────────

  static async addLesson(
    courseId: string,
    schoolId: string,
    actor: CourseActor,
    data: CreateLessonInput,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (course.status !== 'draft') {
      throw new BadRequestError('Can only add lessons to draft courses');
    }

    // Verify the module belongs to this course.
    await getModuleOrThrow(courseId, data.moduleId, schoolId);

    // Build the lesson document — Zod discriminatedUnion has already
    // guaranteed that exactly the right foreign keys are present.
    const lessonDoc: Record<string, unknown> = {
      schoolId: course.schoolId,
      courseId: course._id,
      moduleId: new mongoose.Types.ObjectId(data.moduleId),
      orderIndex: data.orderIndex,
      title: data.title,
      type: data.type,
      isGraded: data.isGraded,
      passMarkPercent: data.passMarkPercent,
      isRequiredToAdvance: data.isRequiredToAdvance,
      maxAttempts: data.maxAttempts ?? null,
    };

    if (data.type === 'content') {
      lessonDoc.contentResourceId = new mongoose.Types.ObjectId(data.contentResourceId);
    } else if (data.type === 'chapter') {
      lessonDoc.textbookId = new mongoose.Types.ObjectId(data.textbookId);
      lessonDoc.chapterId = new mongoose.Types.ObjectId(data.chapterId);
    } else if (data.type === 'homework') {
      lessonDoc.homeworkId = new mongoose.Types.ObjectId(data.homeworkId);
    } else if (data.type === 'quiz') {
      lessonDoc.quizQuestionIds = data.quizQuestionIds.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }

    const lesson = await CourseLesson.create(lessonDoc);
    return lesson.toObject();
  }

  static async updateLesson(
    courseId: string,
    lessonId: string,
    schoolId: string,
    actor: CourseActor,
    data: UpdateLessonInput,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (course.status !== 'draft') {
      throw new BadRequestError('Can only edit lessons in draft courses');
    }

    const lesson = await getLessonOrThrow(courseId, lessonId, schoolId);

    if (data.title !== undefined) lesson.title = data.title;
    if (data.orderIndex !== undefined) lesson.orderIndex = data.orderIndex;
    if (data.isRequiredToAdvance !== undefined) {
      lesson.isRequiredToAdvance = data.isRequiredToAdvance;
    }
    if (data.passMarkPercent !== undefined) {
      lesson.passMarkPercent = data.passMarkPercent;
    }
    if (data.maxAttempts !== undefined) {
      lesson.maxAttempts = data.maxAttempts ?? null;
    }

    await lesson.save();
    return lesson.toObject();
  }

  static async deleteLesson(
    courseId: string,
    lessonId: string,
    schoolId: string,
    actor: CourseActor,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (course.status !== 'draft') {
      throw new BadRequestError('Can only delete lessons in draft courses');
    }

    const lesson = await getLessonOrThrow(courseId, lessonId, schoolId);
    lesson.isDeleted = true;
    await lesson.save();
    return { deleted: true };
  }

  static async reorderLessons(
    courseId: string,
    schoolId: string,
    actor: CourseActor,
    data: ReorderLessonsInput,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, actor);
    if (course.status !== 'draft') {
      throw new BadRequestError('Can only reorder lessons in draft courses');
    }

    const ids = data.orders.map((o) => new mongoose.Types.ObjectId(o.id));
    const count = await CourseLesson.countDocuments({
      _id: { $in: ids },
      courseId: course._id,
      schoolId: course.schoolId,
      isDeleted: false,
    });
    if (count !== ids.length) {
      throw new BadRequestError('One or more lessons do not belong to this course');
    }

    // Verify every destination moduleId belongs to this course as well —
    // otherwise a client could move a lesson onto a module from a different
    // course (or a deleted / non-existent module) and silently orphan it.
    const destinationModuleIds = Array.from(
      new Set(data.orders.map((o) => o.moduleId)),
    ).map((id) => new mongoose.Types.ObjectId(id));
    const moduleCount = await CourseModule.countDocuments({
      _id: { $in: destinationModuleIds },
      courseId: course._id,
      schoolId: course.schoolId,
      isDeleted: false,
    });
    if (moduleCount !== destinationModuleIds.length) {
      throw new BadRequestError(
        'One or more destination modules do not belong to this course',
      );
    }

    await Promise.all(
      data.orders.map((o) =>
        CourseLesson.updateOne(
          {
            _id: new mongoose.Types.ObjectId(o.id),
            courseId: course._id,
            schoolId: course.schoolId,
            isDeleted: false,
          },
          {
            $set: {
              orderIndex: o.orderIndex,
              moduleId: new mongoose.Types.ObjectId(o.moduleId),
            },
          },
        ),
      ),
    );

    return { reordered: true };
  }

  // ─── Assignment to a class ───────────────────────────────────────────────

  static async assignCourseToClass(
    courseId: string,
    schoolId: string,
    actor: CourseActor,
    data: AssignCourseInput,
  ) {
    if (!canAuthor(actor)) {
      throw new ForbiddenError('Not allowed to assign courses');
    }

    const course = await getCourseOrThrow(courseId, schoolId);
    if (course.status !== 'published') {
      throw new BadRequestError('Can only assign published courses');
    }

    const soid = new mongoose.Types.ObjectId(schoolId);
    const classOid = new mongoose.Types.ObjectId(data.classId);

    // Verify the class belongs to this school.
    const klass = await Class.findOne({
      _id: classOid,
      schoolId: soid,
      isDeleted: false,
    }).lean();
    if (!klass) throw new NotFoundError('Class not found');

    // Fetch all students in the class.
    const students = await Student.find({
      classId: classOid,
      schoolId: soid,
      isDeleted: false,
    })
      .select('_id')
      .lean();

    if (students.length === 0) {
      throw new BadRequestError('No students found in this class');
    }

    // Bulk upsert enrolments. `ordered: false` means duplicates (students
    // already enroled) don't abort the batch; `upsert` handles the "unique"
    // index gracefully.
    const ops = students.map((s) => ({
      updateOne: {
        filter: {
          courseId: course._id,
          studentId: s._id,
          isDeleted: false,
        },
        update: {
          $setOnInsert: {
            isDeleted: false,
            schoolId: course.schoolId,
            courseId: course._id,
            studentId: s._id,
            enrolledBy: new mongoose.Types.ObjectId(actor.userId),
            classId: classOid,
            enrolledAt: new Date(),
            status: 'active' as const,
            progressPercent: 0,
            completedAt: null,
            certificateId: null,
          },
        },
        upsert: true,
      },
    }));

    const result = await Enrolment.bulkWrite(ops, { ordered: false });
    return {
      attempted: students.length,
      newEnrolments: result.upsertedCount ?? 0,
      alreadyEnroled: result.matchedCount ?? 0,
    };
  }

  static async listEnrolments(
    courseId: string,
    schoolId: string,
    actor: CourseActor,
  ) {
    if (!canAuthor(actor)) {
      throw new ForbiddenError('Not allowed to view enrolments');
    }

    const course = await getCourseOrThrow(courseId, schoolId);
    // HODs, principals, and school admins can see all enrolments.
    // Regular teachers can only see enrolments for their own courses.
    if (!canPublish(actor) && course.createdBy.toString() !== actor.userId) {
      throw new ForbiddenError('You can only view enrolments for your own courses');
    }

    const enrolments = await Enrolment.find({
      courseId: course._id,
      schoolId: course.schoolId,
      isDeleted: false,
    })
      .populate([
        { path: 'studentId', select: 'admissionNumber userId' },
        { path: 'classId', select: 'name' },
      ])
      .sort({ enrolledAt: -1 })
      .lean();

    return { enrolments, total: enrolments.length };
  }
}
