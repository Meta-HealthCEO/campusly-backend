import mongoose from 'mongoose';
import {
  Course,
  CourseModule,
  CourseLesson,
  Enrolment,
  LessonProgress,
  type ICourseLesson,
  type ILessonProgress,
} from './model.js';
import { Student } from '../Student/model.js';
import { ContentResource } from '../ContentLibrary/model.js';
import { Textbook } from '../Textbook/model.js';
import { Homework } from '../Homework/model.js';
import { Question } from '../QuestionBank/model.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../common/errors.js';
import { escapeRegex } from '../../common/utils.js';

// ─── Catalog (any authenticated user in the school) ────────────────────────

export class CourseStudentService {
  /**
   * List all published courses in the school. Open to any authenticated
   * user — students see this catalog, teachers see it too. The route layer
   * already enforces "must be authenticated"; this service just scopes by
   * schoolId + status='published'.
   */
  static async listCatalog(
    schoolId: string,
    filters: { subjectId?: string; gradeLevel?: number; search?: string },
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const query: Record<string, unknown> = {
      schoolId: soid,
      isDeleted: false,
      status: 'published',
    };
    if (filters.subjectId) {
      query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    }
    if (filters.gradeLevel !== undefined) query.gradeLevel = filters.gradeLevel;
    if (filters.search) {
      query.title = { $regex: escapeRegex(filters.search), $options: 'i' };
    }
    const courses = await Course.find(query)
      .select('-reviewNotes')
      .populate([
        { path: 'subjectId', select: 'name' },
        { path: 'createdBy', select: 'firstName lastName' },
      ])
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();
    return { courses, total: courses.length };
  }

  /**
   * Get a single published course by slug for catalog preview. Returns the
   * full module/lesson tree so the catalog card can show what's inside,
   * but does NOT include the actual content blocks (those gate behind
   * enrolment + per-lesson unlock).
   */
  static async getCatalogPreview(slug: string, schoolId: string) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const course = await Course.findOne({
      schoolId: soid,
      slug,
      isDeleted: false,
      status: 'published',
    })
      .populate([
        { path: 'subjectId', select: 'name' },
        { path: 'createdBy', select: 'firstName lastName' },
      ])
      .lean();
    if (!course) throw new NotFoundError('Course not found');

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
      .select('-quizQuestionIds')
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

  // ─── Student record resolution ─────────────────────────────────────────

  /**
   * Find the Student record for a given User. The JWT carries User._id but
   * Enrolment is keyed on Student._id, so every student endpoint resolves
   * via this helper. Throws ForbiddenError for users without a Student
   * record (e.g. a teacher hitting a student-only endpoint).
   */
  static async getStudentForUser(userId: string, schoolId: string) {
    const student = await Student.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .select('_id')
      .lean();
    if (!student) {
      throw new ForbiddenError('Only students can access this endpoint');
    }
    return student;
  }

  // ─── My enrolments ─────────────────────────────────────────────────────

  /**
   * List the calling student's active + completed enrolments with their
   * course summary. Used by the student "My Courses" grid.
   */
  static async listMyEnrolments(userId: string, schoolId: string) {
    const student = await this.getStudentForUser(userId, schoolId);
    const soid = new mongoose.Types.ObjectId(schoolId);
    const enrolments = await Enrolment.find({
      studentId: student._id,
      schoolId: soid,
      isDeleted: false,
      status: { $in: ['active', 'completed'] },
    })
      .populate({
        path: 'courseId',
        select: 'title slug description coverImageUrl gradeLevel subjectId',
        populate: { path: 'subjectId', select: 'name' },
      })
      .sort({ enrolledAt: -1 })
      .lean();
    return { enrolments, total: enrolments.length };
  }

  /**
   * Get one enrolment with the full course tree + per-lesson progress.
   * The student must own this enrolment, OR the caller must be the course
   * author.
   */
  static async getEnrolment(
    enrolmentId: string,
    userId: string,
    schoolId: string,
  ) {
    if (!mongoose.Types.ObjectId.isValid(enrolmentId)) {
      throw new NotFoundError('Enrolment not found');
    }
    const soid = new mongoose.Types.ObjectId(schoolId);
    const enrolment = await Enrolment.findOne({
      _id: new mongoose.Types.ObjectId(enrolmentId),
      schoolId: soid,
      isDeleted: false,
      status: { $in: ['active', 'completed'] },
    }).lean();
    if (!enrolment) throw new NotFoundError('Enrolment not found');

    const student = await Student.findOne({
      _id: enrolment.studentId,
      schoolId: soid,
      isDeleted: false,
    })
      .select('userId')
      .lean();
    const callerIsStudent = student?.userId.toString() === userId;

    const course = await Course.findOne({
      _id: enrolment.courseId,
      schoolId: soid,
      isDeleted: false,
    })
      .populate([
        { path: 'subjectId', select: 'name' },
        { path: 'createdBy', select: 'firstName lastName' },
      ])
      .lean();
    if (!course) throw new NotFoundError('Course not found');

    // course.createdBy may be either an ObjectId (no populate) or a populated
    // user object. Both shapes need handling.
    const createdById = (course.createdBy as { _id?: mongoose.Types.ObjectId })._id
      ?? (course.createdBy as mongoose.Types.ObjectId);
    const callerIsAuthor = createdById?.toString() === userId;

    if (!callerIsStudent && !callerIsAuthor) {
      throw new ForbiddenError('You do not have access to this enrolment');
    }

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
      .select('-quizQuestionIds')
      .sort({ orderIndex: 1 })
      .lean();

    const progressRows = await LessonProgress.find({
      enrolmentId: enrolment._id,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    const progressByLesson = new Map<string, ILessonProgress>();
    for (const p of progressRows) {
      progressByLesson.set(p.lessonId.toString(), p as unknown as ILessonProgress);
    }

    const sortedLessons = sortLessonsForUnlock(
      lessons as unknown as ICourseLesson[],
      modules,
    );
    const lessonStatusById = computeUnlockStatuses(sortedLessons, progressByLesson);

    const lessonsByModule: Record<string, typeof lessons> = {};
    for (const l of lessons) {
      const key = l.moduleId.toString();
      if (!lessonsByModule[key]) lessonsByModule[key] = [];
      lessonsByModule[key].push(l);
    }

    const modulesWithLessons = modules.map((m) => ({
      ...m,
      lessons: (lessonsByModule[m._id.toString()] ?? []).map((l) => ({
        ...l,
        progress: progressByLesson.get(l._id.toString()) ?? null,
        unlockStatus: lessonStatusById.get(l._id.toString()) ?? 'locked',
      })),
    }));

    return {
      enrolment,
      course: { ...course, modules: modulesWithLessons },
    };
  }

  // ─── Lesson fetch with gating ──────────────────────────────────────────

  /**
   * Return one lesson's full content for a student to render. The server
   * enforces three things:
   *
   *   1. The enrolment belongs to the calling user
   *   2. The lesson is unlocked under the linear-unlock rule
   *   3. The referenced source (ContentResource / Textbook chapter / Homework
   *      / Question Bank quiz) actually exists and belongs to this school
   *
   * Returns the lesson plus the populated source content.
   */
  static async getLessonForStudent(
    enrolmentId: string,
    lessonId: string,
    userId: string,
    schoolId: string,
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(enrolmentId)
      || !mongoose.Types.ObjectId.isValid(lessonId)
    ) {
      throw new NotFoundError('Lesson not found');
    }
    const soid = new mongoose.Types.ObjectId(schoolId);

    const enrolment = await Enrolment.findOne({
      _id: new mongoose.Types.ObjectId(enrolmentId),
      schoolId: soid,
      isDeleted: false,
      status: 'active',
    }).lean();
    if (!enrolment) throw new NotFoundError('Enrolment not found');

    const student = await Student.findOne({
      _id: enrolment.studentId,
      schoolId: soid,
      isDeleted: false,
    })
      .select('userId')
      .lean();
    if (!student || student.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this lesson');
    }

    const lesson = await CourseLesson.findOne({
      _id: new mongoose.Types.ObjectId(lessonId),
      courseId: enrolment.courseId,
      schoolId: soid,
      isDeleted: false,
    }).lean();
    if (!lesson) throw new NotFoundError('Lesson not found');

    const allModules = await CourseModule.find({
      courseId: enrolment.courseId,
      schoolId: soid,
      isDeleted: false,
    })
      .sort({ orderIndex: 1 })
      .lean();
    const allLessons = await CourseLesson.find({
      courseId: enrolment.courseId,
      schoolId: soid,
      isDeleted: false,
    })
      .sort({ orderIndex: 1 })
      .lean();
    const progressRows = await LessonProgress.find({
      enrolmentId: enrolment._id,
      schoolId: soid,
      isDeleted: false,
    }).lean();
    const progressByLesson = new Map<string, ILessonProgress>();
    for (const p of progressRows) {
      progressByLesson.set(
        p.lessonId.toString(),
        p as unknown as ILessonProgress,
      );
    }

    const sortedLessons = sortLessonsForUnlock(
      allLessons as unknown as ICourseLesson[],
      allModules,
    );
    const lessonStatusById = computeUnlockStatuses(sortedLessons, progressByLesson);
    const status = lessonStatusById.get(lesson._id.toString()) ?? 'locked';

    if (status === 'locked') {
      throw new ForbiddenError('Complete the previous lesson first');
    }

    const source = await resolveLessonSource(
      lesson as unknown as ICourseLesson,
      soid,
    );
    return { lesson, source };
  }
}

// ─── Module-private helpers ────────────────────────────────────────────────

/**
 * Sort lessons in linear-unlock order: by module orderIndex, then lesson
 * orderIndex within the module.
 */
export function sortLessonsForUnlock(
  lessons: ICourseLesson[],
  modules: { _id: mongoose.Types.ObjectId; orderIndex: number }[],
): ICourseLesson[] {
  const moduleOrder = new Map<string, number>();
  for (const m of modules) moduleOrder.set(m._id.toString(), m.orderIndex);
  return [...lessons].sort((a, b) => {
    const am = moduleOrder.get(a.moduleId.toString()) ?? 0;
    const bm = moduleOrder.get(b.moduleId.toString()) ?? 0;
    if (am !== bm) return am - bm;
    return a.orderIndex - b.orderIndex;
  });
}

/**
 * Compute the unlock status of every lesson based on completed progress.
 *
 * Rules:
 *   - The first lesson (in sorted order) is always 'available'
 *   - A lesson is 'available' if the previous lesson (in sorted order) has
 *     a LessonProgress row with status === 'completed'
 *   - Otherwise it is 'locked'
 *
 * If a lesson has its own progress row with a status of 'completed' or
 * 'in_progress', we trust that status.
 */
export function computeUnlockStatuses(
  sortedLessons: ICourseLesson[],
  progressByLesson: Map<string, ILessonProgress>,
): Map<string, 'locked' | 'available' | 'in_progress' | 'completed'> {
  const out = new Map<string, 'locked' | 'available' | 'in_progress' | 'completed'>();
  let prevCompleted = true;
  for (const l of sortedLessons) {
    const progress = progressByLesson.get(l._id.toString());
    if (progress && progress.status === 'completed') {
      out.set(l._id.toString(), 'completed');
      prevCompleted = true;
      continue;
    }
    if (progress && progress.status === 'in_progress') {
      out.set(l._id.toString(), 'in_progress');
      prevCompleted = false;
      continue;
    }
    if (prevCompleted) {
      out.set(l._id.toString(), 'available');
    } else {
      out.set(l._id.toString(), 'locked');
    }
    prevCompleted = false;
  }
  return out;
}

/**
 * Fetch the underlying source document for a lesson based on its `type`.
 * Returns the populated source so the controller can hand a single object
 * back to the client.
 */
async function resolveLessonSource(
  lesson: ICourseLesson,
  schoolId: mongoose.Types.ObjectId,
) {
  if (lesson.type === 'content') {
    if (!lesson.contentResourceId) {
      throw new BadRequestError('Lesson is missing its content resource');
    }
    const resource = await ContentResource.findOne({
      _id: lesson.contentResourceId,
      isDeleted: false,
      $or: [{ schoolId }, { schoolId: null }],
    }).lean();
    if (!resource) throw new NotFoundError('Lesson content not found');
    return { kind: 'content' as const, resource };
  }

  if (lesson.type === 'chapter') {
    if (!lesson.textbookId || !lesson.chapterId) {
      throw new BadRequestError('Lesson is missing its textbook chapter');
    }
    const textbook = await Textbook.findOne({
      _id: lesson.textbookId,
      isDeleted: false,
      $or: [{ schoolId }, { schoolId: null }],
    }).lean();
    if (!textbook) throw new NotFoundError('Textbook not found');
    const chapter = textbook.chapters.find(
      (c) => c._id?.toString() === lesson.chapterId?.toString(),
    );
    if (!chapter) throw new NotFoundError('Chapter not found');
    return {
      kind: 'chapter' as const,
      textbook: { _id: textbook._id, title: textbook.title },
      chapter,
    };
  }

  if (lesson.type === 'homework') {
    if (!lesson.homeworkId) {
      throw new BadRequestError('Lesson is missing its homework reference');
    }
    const homework = await Homework.findOne({
      _id: lesson.homeworkId,
      schoolId,
      isDeleted: false,
    }).lean();
    if (!homework) throw new NotFoundError('Homework not found');
    return { kind: 'homework' as const, homework };
  }

  if (lesson.type === 'quiz') {
    if (!lesson.quizQuestionIds || lesson.quizQuestionIds.length === 0) {
      throw new BadRequestError('Lesson is missing its quiz questions');
    }
    // Strip the canonical answer + isCorrect flags so the client can't
    // see correct answers before submitting.
    const questions = await Question.find({
      _id: { $in: lesson.quizQuestionIds },
      isDeleted: false,
      $or: [{ schoolId }, { schoolId: null }],
    }).lean();
    const safe = questions.map((q) => ({
      _id: q._id,
      type: q.type,
      stem: q.stem,
      media: q.media,
      diagram: q.diagram,
      marks: q.marks,
      options: q.options.map((o) => ({ label: o.label, text: o.text })),
    }));
    return { kind: 'quiz' as const, questions: safe };
  }

  throw new BadRequestError(
    `Unknown lesson type: ${(lesson as { type: string }).type}`,
  );
}
