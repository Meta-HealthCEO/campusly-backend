import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const COURSE_STATUSES = ['draft', 'in_review', 'published', 'archived'] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

export const LESSON_TYPES = ['content', 'chapter', 'homework', 'quiz'] as const;
export type LessonType = (typeof LESSON_TYPES)[number];

export const ENROLMENT_STATUSES = ['active', 'completed', 'dropped'] as const;
export type EnrolmentStatus = (typeof ENROLMENT_STATUSES)[number];

export const LESSON_PROGRESS_STATUSES = [
  'locked',
  'available',
  'in_progress',
  'completed',
] as const;
export type LessonProgressStatus = (typeof LESSON_PROGRESS_STATUSES)[number];

// ─── Course ────────────────────────────────────────────────────────────────

export interface ICourse extends Document {
  schoolId: Types.ObjectId;
  isDeleted: boolean;

  title: string;
  slug: string;
  description: string;
  coverImageUrl: string;

  subjectId: Types.ObjectId | null;
  gradeLevel: number | null;
  tags: string[];
  estimatedDurationHours: number | null;

  createdBy: Types.ObjectId;
  status: CourseStatus;
  publishedBy: Types.ObjectId | null;
  publishedAt: Date | null;
  reviewNotes: string;

  passMarkPercent: number;
  certificateEnabled: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },

    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    coverImageUrl: { type: String, default: '' },

    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', default: null },
    gradeLevel: { type: Number, default: null, min: 1, max: 12 },
    tags: { type: [String], default: [] },
    estimatedDurationHours: { type: Number, default: null, min: 0 },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: COURSE_STATUSES, default: 'draft', index: true },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    publishedAt: { type: Date, default: null },
    reviewNotes: { type: String, default: '' },

    passMarkPercent: { type: Number, default: 60, min: 0, max: 100 },
    certificateEnabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Partial unique index: slugs only need to be unique among non-deleted courses
// in the same school. This lets a school re-use a slug after soft-deleting.
courseSchema.index(
  { schoolId: 1, slug: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
courseSchema.index({ schoolId: 1, status: 1 });
courseSchema.index({ schoolId: 1, createdBy: 1 });

export const Course = mongoose.model<ICourse>('Course', courseSchema);

// ─── CourseModule ──────────────────────────────────────────────────────────

export interface ICourseModule extends Document {
  schoolId: Types.ObjectId;
  isDeleted: boolean;
  courseId: Types.ObjectId;
  title: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseModuleSchema = new Schema<ICourseModule>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true },
    orderIndex: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

courseModuleSchema.index({ courseId: 1, orderIndex: 1 });

export const CourseModule = mongoose.model<ICourseModule>(
  'CourseModule',
  courseModuleSchema,
);

// ─── CourseLesson ──────────────────────────────────────────────────────────

export interface ICourseLesson extends Document {
  schoolId: Types.ObjectId;
  isDeleted: boolean;
  courseId: Types.ObjectId;
  moduleId: Types.ObjectId;
  orderIndex: number;

  title: string;
  type: LessonType;

  contentResourceId: Types.ObjectId | null;
  textbookId: Types.ObjectId | null;
  chapterId: Types.ObjectId | null;
  homeworkId: Types.ObjectId | null;
  quizQuestionIds: Types.ObjectId[];

  isGraded: boolean;
  passMarkPercent: number;
  isRequiredToAdvance: boolean;
  maxAttempts: number | null;

  createdAt: Date;
  updatedAt: Date;
}

const courseLessonSchema = new Schema<ICourseLesson>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    moduleId: { type: Schema.Types.ObjectId, ref: 'CourseModule', required: true, index: true },
    orderIndex: { type: Number, required: true, default: 0 },

    title: { type: String, required: true, trim: true },
    type: { type: String, enum: LESSON_TYPES, required: true },

    contentResourceId: {
      type: Schema.Types.ObjectId,
      ref: 'ContentResource',
      default: null,
    },
    textbookId: { type: Schema.Types.ObjectId, ref: 'Textbook', default: null },
    // chapterId is the _id of a subdoc inside Textbook.chapters[], not a
    // top-level collection reference. Subdoc IDs cannot be populated via
    // .populate() — consumers must load the parent Textbook and find the
    // chapter manually. Do not add a ref: here.
    chapterId: { type: Schema.Types.ObjectId, default: null },
    homeworkId: { type: Schema.Types.ObjectId, ref: 'Homework', default: null },
    quizQuestionIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Question',
      default: [],
    },

    isGraded: { type: Boolean, default: false },
    passMarkPercent: { type: Number, default: 70, min: 0, max: 100 },
    isRequiredToAdvance: { type: Boolean, default: false },
    maxAttempts: { type: Number, default: null, min: 1 },
  },
  { timestamps: true },
);

courseLessonSchema.index({ courseId: 1, moduleId: 1, orderIndex: 1 });

export const CourseLesson = mongoose.model<ICourseLesson>(
  'CourseLesson',
  courseLessonSchema,
);

// ─── Enrolment ─────────────────────────────────────────────────────────────

export interface IEnrolment extends Document {
  schoolId: Types.ObjectId;
  isDeleted: boolean;

  courseId: Types.ObjectId;
  studentId: Types.ObjectId;
  enrolledBy: Types.ObjectId;
  classId: Types.ObjectId | null;
  enrolledAt: Date;

  status: EnrolmentStatus;
  progressPercent: number;
  completedAt: Date | null;
  certificateId: Types.ObjectId | null;
}

const enrolmentSchema = new Schema<IEnrolment>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },

    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    enrolledBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', default: null },
    enrolledAt: { type: Date, default: () => new Date() },

    status: { type: String, enum: ENROLMENT_STATUSES, default: 'active', index: true },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    completedAt: { type: Date, default: null },
    certificateId: { type: Schema.Types.ObjectId, ref: 'Certificate', default: null },
  },
);

// Unique on active (non-deleted) (courseId, studentId) pairs.
enrolmentSchema.index(
  { courseId: 1, studentId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
enrolmentSchema.index({ studentId: 1, status: 1 });
enrolmentSchema.index({ courseId: 1, classId: 1 });

export const Enrolment = mongoose.model<IEnrolment>('Enrolment', enrolmentSchema);

// ─── LessonProgress (stub, fleshed out in Plan B) ──────────────────────────

export interface ILessonProgress extends Document {
  schoolId: Types.ObjectId;
  isDeleted: boolean;
  enrolmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  lessonId: Types.ObjectId;
  status: LessonProgressStatus;
  completedAt: Date | null;
  interactionsDone: number;
  interactionsTotal: number;
  scrolledToEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    enrolmentId: { type: Schema.Types.ObjectId, ref: 'Enrolment', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'CourseLesson', required: true },
    status: {
      type: String,
      enum: LESSON_PROGRESS_STATUSES,
      default: 'locked',
    },
    completedAt: { type: Date, default: null },
    interactionsDone: { type: Number, default: 0, min: 0 },
    interactionsTotal: { type: Number, default: 0, min: 0 },
    scrolledToEnd: { type: Boolean, default: false },
  },
  { timestamps: true },
);

lessonProgressSchema.index(
  { enrolmentId: 1, lessonId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

export const LessonProgress = mongoose.model<ILessonProgress>(
  'LessonProgress',
  lessonProgressSchema,
);

// ─── QuizAttempt (stub, fleshed out in Plan B) ─────────────────────────────

export interface IQuizAttemptAnswer {
  questionId: Types.ObjectId;
  answer: unknown;
  isCorrect: boolean;
  marks: number;
}

export interface IQuizAttempt extends Document {
  schoolId: Types.ObjectId;
  isDeleted: boolean;
  enrolmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  lessonId: Types.ObjectId;
  attemptNumber: number;
  answers: IQuizAttemptAnswer[];
  totalMarks: number;
  earnedMarks: number;
  percent: number;
  passed: boolean;
  submittedAt: Date;
}

const quizAttemptAnswerSchema = new Schema<IQuizAttemptAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { type: Schema.Types.Mixed },
    isCorrect: { type: Boolean, default: false },
    marks: { type: Number, default: 0 },
  },
  { _id: false },
);

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    enrolmentId: { type: Schema.Types.ObjectId, ref: 'Enrolment', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'CourseLesson', required: true },
    attemptNumber: { type: Number, required: true, min: 1 },
    answers: { type: [quizAttemptAnswerSchema], default: [] },
    totalMarks: { type: Number, default: 0 },
    earnedMarks: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    submittedAt: { type: Date, default: () => new Date() },
  },
);

quizAttemptSchema.index(
  { enrolmentId: 1, lessonId: 1, attemptNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

// NOTE: Mongoose model name is 'CourseQuizAttempt' (not 'QuizAttempt') to
// avoid collision with the Learning module's QuizAttempt model. The exported
// TypeScript binding stays `QuizAttempt` because it's module-local.
export const QuizAttempt = mongoose.model<IQuizAttempt>(
  'CourseQuizAttempt',
  quizAttemptSchema,
);

// ─── Certificate (stub, fleshed out in Plan C) ─────────────────────────────

export interface ICertificate extends Document {
  schoolId: Types.ObjectId;
  isDeleted: boolean;

  enrolmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;

  studentName: string;
  courseName: string;
  schoolName: string;

  issuedAt: Date;
  issuedBy: Types.ObjectId;
  pdfUrl: string;
  verificationCode: string;
}

const certificateSchema = new Schema<ICertificate>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },

    enrolmentId: { type: Schema.Types.ObjectId, ref: 'Enrolment', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },

    studentName: { type: String, required: true },
    courseName: { type: String, required: true },
    schoolName: { type: String, required: true },

    issuedAt: { type: Date, default: () => new Date() },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pdfUrl: { type: String, default: '' },
    verificationCode: { type: String, required: true },
  },
);

certificateSchema.index({ verificationCode: 1 }, { unique: true });
certificateSchema.index(
  { enrolmentId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

export const Certificate = mongoose.model<ICertificate>(
  'Certificate',
  certificateSchema,
);
