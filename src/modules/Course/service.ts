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

// ─── Authorisation helpers ──────────────────────────────────────────────────
//
// NOTE: The campusly `UserRole` enum does not include dedicated `principal` or
// `hod` roles — those responsibilities are handled by `school_admin` (with an
// optional `isSchoolPrincipal` flag on the User document that's not relevant
// here). So the "publisher" tier collapses to super_admin + school_admin, and
// the "author" tier adds teachers on top.

const PUBLISHER_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN];
const AUTHOR_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.SCHOOL_ADMIN,
  UserRole.TEACHER,
];

function canPublish(role: UserRole): boolean {
  return PUBLISHER_ROLES.includes(role);
}

function canAuthor(role: UserRole): boolean {
  return AUTHOR_ROLES.includes(role);
}

// Teachers can only edit their own drafts. School admins can edit any draft in
// their school. super_admin can edit anything.
function assertCanEditCourse(course: ICourse, userId: string, role: UserRole): void {
  if (role === UserRole.SUPER_ADMIN) return;
  if (canPublish(role)) return;
  if (course.createdBy.toString() !== userId) {
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
    userId: string,
    role: UserRole,
    data: CreateCourseInput,
  ) {
    if (!canAuthor(role)) {
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
      createdBy: new mongoose.Types.ObjectId(userId),
      status: 'draft',
      subjectId: data.subjectId ? new mongoose.Types.ObjectId(data.subjectId) : null,
    });
    return course.toObject();
  }

  static async listCourses(
    schoolId: string,
    userId: string,
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
    if (filters.mine) query.createdBy = new mongoose.Types.ObjectId(userId);
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
    const course = await getCourseOrThrow(id, schoolId);
    const populated = await Course.findById(course._id)
      .populate([
        { path: 'subjectId', select: 'name' },
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'publishedBy', select: 'firstName lastName' },
      ])
      .lean();

    // Fetch modules + lessons in two queries, then stitch together.
    const modules = await CourseModule.find({
      courseId: course._id,
      schoolId: course.schoolId,
      isDeleted: false,
    })
      .sort({ orderIndex: 1 })
      .lean();

    const lessons = await CourseLesson.find({
      courseId: course._id,
      schoolId: course.schoolId,
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

    return { ...populated, modules: modulesWithLessons };
  }

  static async updateCourse(
    id: string,
    schoolId: string,
    userId: string,
    role: UserRole,
    data: UpdateCourseInput,
  ) {
    const course = await getCourseOrThrow(id, schoolId);
    assertCanEditCourse(course, userId, role);

    // Metadata edits are always allowed (even on published courses).
    // Structural edits (modules / lessons) go through their own endpoints
    // which enforce the draft-only rule.
    Object.assign(course, data);
    if (data.subjectId !== undefined) {
      course.subjectId = data.subjectId
        ? new mongoose.Types.ObjectId(data.subjectId)
        : null;
    }
    await course.save();
    return course.toObject();
  }

  static async deleteCourse(id: string, schoolId: string, userId: string, role: UserRole) {
    const course = await getCourseOrThrow(id, schoolId);
    assertCanEditCourse(course, userId, role);

    if (course.status === 'published') {
      throw new BadRequestError('Cannot delete a published course. Archive it instead.');
    }

    course.isDeleted = true;
    await course.save();
    return { deleted: true };
  }

  // ─── Review workflow ─────────────────────────────────────────────────────

  static async submitForReview(id: string, schoolId: string, userId: string, role: UserRole) {
    const course = await getCourseOrThrow(id, schoolId);
    assertCanEditCourse(course, userId, role);

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

  static async publishCourse(id: string, schoolId: string, userId: string, role: UserRole) {
    if (!canPublish(role)) {
      throw new ForbiddenError('Only school admins can publish courses');
    }

    const course = await getCourseOrThrow(id, schoolId);
    if (course.status !== 'in_review') {
      throw new BadRequestError(`Cannot publish a course in '${course.status}' state`);
    }

    course.status = 'published';
    course.publishedBy = new mongoose.Types.ObjectId(userId);
    course.publishedAt = new Date();
    course.reviewNotes = '';
    await course.save();
    return course.toObject();
  }

  static async rejectCourse(
    id: string,
    schoolId: string,
    userId: string,
    role: UserRole,
    data: RejectCourseInput,
  ) {
    if (!canPublish(role)) {
      throw new ForbiddenError('Only school admins can reject courses');
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

  static async archiveCourse(id: string, schoolId: string, userId: string, role: UserRole) {
    const course = await getCourseOrThrow(id, schoolId);
    assertCanEditCourse(course, userId, role);

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
    userId: string,
    role: UserRole,
    data: CreateModuleInput,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, userId, role);
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
    userId: string,
    role: UserRole,
    data: UpdateModuleInput,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, userId, role);
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
    userId: string,
    role: UserRole,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, userId, role);
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
    userId: string,
    role: UserRole,
    data: ReorderModulesInput,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, userId, role);
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
    userId: string,
    role: UserRole,
    data: CreateLessonInput,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, userId, role);
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
    userId: string,
    role: UserRole,
    data: UpdateLessonInput,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, userId, role);
    if (course.status !== 'draft') {
      throw new BadRequestError('Can only edit lessons in draft courses');
    }

    const lesson = await getLessonOrThrow(courseId, lessonId, schoolId);

    if (data.title !== undefined) lesson.title = data.title;
    if (data.orderIndex !== undefined) lesson.orderIndex = data.orderIndex;
    if (data.isRequiredToAdvance !== undefined) {
      lesson.isRequiredToAdvance = data.isRequiredToAdvance;
    }
    if (data.passMarkPercent !== undefined && data.passMarkPercent !== null) {
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
    userId: string,
    role: UserRole,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, userId, role);
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
    userId: string,
    role: UserRole,
    data: ReorderLessonsInput,
  ) {
    const course = await getCourseOrThrow(courseId, schoolId);
    assertCanEditCourse(course, userId, role);
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
    userId: string,
    role: UserRole,
    data: AssignCourseInput,
  ) {
    if (!canAuthor(role)) {
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
            schoolId: course.schoolId,
            courseId: course._id,
            studentId: s._id,
            enrolledBy: new mongoose.Types.ObjectId(userId),
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
    userId: string,
    role: UserRole,
  ) {
    if (!canAuthor(role)) {
      throw new ForbiddenError('Not allowed to view enrolments');
    }

    const course = await getCourseOrThrow(courseId, schoolId);
    // Teachers can only see enrolments for their own course. School admins see all.
    if (!canPublish(role) && course.createdBy.toString() !== userId) {
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
