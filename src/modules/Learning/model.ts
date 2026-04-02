import mongoose, { Document, Schema, Types } from 'mongoose';

// ─── Quiz Types ────────────────────────────────────────────────────────────────

export type QuizType = 'mcq' | 'true_false' | 'mixed';
export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'matching';
export type QuizStatus = 'draft' | 'published' | 'closed';
export type StudyMaterialType = 'notes' | 'video' | 'link' | 'document' | 'past_paper';
export type TrendDirection = 'improving' | 'stable' | 'declining';

// ─── Quiz ──────────────────────────────────────────────────────────────────────

export interface IQuizOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuizQuestion {
  questionText: string;
  questionType: QuestionType;
  options: IQuizOption[];
  correctAnswer: string;
  points: number;
  explanation?: string;
}

export interface IQuiz extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  subjectId: Types.ObjectId;
  classId: Types.ObjectId;
  title: string;
  description?: string;
  type: QuizType;
  questions: IQuizQuestion[];
  totalPoints: number;
  timeLimit?: number;
  attempts: number;
  shuffleQuestions: boolean;
  dueDate?: Date;
  status: QuizStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizOptionSchema = new Schema<IQuizOption>(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false },
);

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    questionText: { type: String, required: true },
    questionType: {
      type: String,
      enum: ['mcq', 'true_false', 'short_answer', 'matching'],
      required: true,
    },
    options: { type: [quizOptionSchema], default: [] },
    correctAnswer: { type: String, required: true },
    points: { type: Number, required: true, min: 1 },
    explanation: { type: String },
  },
  { _id: false },
);

const quizSchema = new Schema<IQuiz>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ['mcq', 'true_false', 'mixed'], required: true },
    questions: {
      type: [quizQuestionSchema],
      required: true,
      validate: [(v: IQuizQuestion[]) => v.length <= 200, 'Maximum 200 questions allowed'],
    },
    totalPoints: { type: Number, required: true, min: 1 },
    timeLimit: { type: Number, min: 1 },
    attempts: { type: Number, default: 1, min: 1 },
    shuffleQuestions: { type: Boolean, default: false },
    dueDate: { type: Date },
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

quizSchema.index({ schoolId: 1, isDeleted: 1 });
quizSchema.index({ schoolId: 1, classId: 1, subjectId: 1 });
quizSchema.index({ teacherId: 1 });
quizSchema.index({ status: 1, dueDate: -1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);

// ─── Quiz Attempt ──────────────────────────────────────────────────────────────

export interface IQuizAnswer {
  questionIndex: number;
  selectedOption?: number;
  textAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface IQuizAttempt extends Document {
  quizId: Types.ObjectId;
  studentId: Types.ObjectId;
  answers: IQuizAnswer[];
  totalScore: number;
  percentage: number;
  startedAt: Date;
  completedAt?: Date;
  attempt: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizAnswerSchema = new Schema<IQuizAnswer>(
  {
    questionIndex: { type: Number, required: true },
    selectedOption: { type: Number },
    textAnswer: { type: String },
    isCorrect: { type: Boolean, required: true },
    pointsEarned: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    answers: { type: [quizAnswerSchema], required: true },
    totalScore: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
    attempt: { type: Number, required: true, min: 1 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

quizAttemptSchema.index({ quizId: 1, studentId: 1 });
quizAttemptSchema.index({ studentId: 1 });

export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);

// ─── Study Material ────────────────────────────────────────────────────────────

export interface ICurriculumRef {
  subject: string;
  grade: string;
  term: string;
  topic: string;
}

export interface IStudyMaterial extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  subjectId: Types.ObjectId;
  gradeId: Types.ObjectId;
  term: number;
  topic: string;
  type: StudyMaterialType;
  title: string;
  description?: string;
  fileUrl?: string;
  videoUrl?: string;
  externalLink?: string;
  tags: string[];
  curriculum: ICurriculumRef;
  downloads: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const curriculumRefSchema = new Schema<ICurriculumRef>(
  {
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    term: { type: String, required: true },
    topic: { type: String, required: true },
  },
  { _id: false },
);

const studyMaterialSchema = new Schema<IStudyMaterial>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    term: { type: Number, required: true, min: 1, max: 4 },
    topic: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['notes', 'video', 'link', 'document', 'past_paper'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fileUrl: { type: String },
    videoUrl: { type: String },
    externalLink: { type: String },
    tags: { type: [String], default: [] },
    curriculum: { type: curriculumRefSchema, required: true },
    downloads: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

studyMaterialSchema.index({ schoolId: 1, isDeleted: 1 });
studyMaterialSchema.index({ schoolId: 1, subjectId: 1, gradeId: 1 });
studyMaterialSchema.index({ tags: 1 });
studyMaterialSchema.index({ 'curriculum.subject': 1, 'curriculum.grade': 1, 'curriculum.term': 1 });

export const StudyMaterial = mongoose.model<IStudyMaterial>('StudyMaterial', studyMaterialSchema);

// ─── Rubric ────────────────────────────────────────────────────────────────────

export interface IRubricLevel {
  label: string;
  description: string;
  points: number;
}

export interface IRubricCriterion {
  name: string;
  description: string;
  levels: IRubricLevel[];
}

export interface IRubric extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  name: string;
  subjectId?: Types.ObjectId;
  criteria: IRubricCriterion[];
  totalPoints: number;
  reusable: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const rubricLevelSchema = new Schema<IRubricLevel>(
  {
    label: { type: String, required: true },
    description: { type: String, required: true },
    points: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const rubricCriterionSchema = new Schema<IRubricCriterion>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    levels: { type: [rubricLevelSchema], required: true },
  },
  { _id: false },
);

const rubricSchema = new Schema<IRubric>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    criteria: { type: [rubricCriterionSchema], required: true },
    totalPoints: { type: Number, required: true, min: 1 },
    reusable: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

rubricSchema.index({ schoolId: 1, isDeleted: 1 });
rubricSchema.index({ schoolId: 1, teacherId: 1 });
rubricSchema.index({ subjectId: 1 });

export const Rubric = mongoose.model<IRubric>('Rubric', rubricSchema);

// ─── Assignment Submission (Enhanced) ──────────────────────────────────────────

export interface IPeerReview {
  reviewerId: Types.ObjectId;
  rating: number;
  comments: string;
  reviewedAt: Date;
}

export interface IRubricScore {
  criterionId: string;
  level: string;
  points: number;
}

export interface ITeacherFeedback {
  comments: string;
  rubricScores: IRubricScore[];
  audioFeedbackUrl?: string;
}

export interface IRevisionEntry {
  fileUrl: string;
  submittedAt: Date;
  version: number;
}

export interface IAssignmentSubmission extends Document {
  homeworkId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  files: string[];
  submittedAt: Date;
  isLate: boolean;
  mark?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: Types.ObjectId;
  isDraft: boolean;
  draftSavedAt?: Date;
  plagiarismScore?: number;
  peerReviewEnabled: boolean;
  peerReviews: IPeerReview[];
  teacherFeedback?: ITeacherFeedback;
  revisionHistory: IRevisionEntry[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const peerReviewSchema = new Schema<IPeerReview>(
  {
    reviewerId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, required: true },
    reviewedAt: { type: Date, required: true },
  },
  { _id: false },
);

const rubricScoreSchema = new Schema<IRubricScore>(
  {
    criterionId: { type: String, required: true },
    level: { type: String, required: true },
    points: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const teacherFeedbackSchema = new Schema<ITeacherFeedback>(
  {
    comments: { type: String, required: true },
    rubricScores: { type: [rubricScoreSchema], default: [] },
    audioFeedbackUrl: { type: String },
  },
  { _id: false },
);

const revisionEntrySchema = new Schema<IRevisionEntry>(
  {
    fileUrl: { type: String, required: true },
    submittedAt: { type: Date, required: true },
    version: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    homeworkId: { type: Schema.Types.ObjectId, ref: 'Homework', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    files: { type: [String], default: [] },
    submittedAt: { type: Date, required: true },
    isLate: { type: Boolean, default: false },
    mark: { type: Number },
    feedback: { type: String, trim: true },
    gradedAt: { type: Date },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDraft: { type: Boolean, default: false },
    draftSavedAt: { type: Date },
    plagiarismScore: { type: Number, min: 0, max: 100 },
    peerReviewEnabled: { type: Boolean, default: false },
    peerReviews: { type: [peerReviewSchema], default: [] },
    teacherFeedback: { type: teacherFeedbackSchema },
    revisionHistory: { type: [revisionEntrySchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

assignmentSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });
assignmentSubmissionSchema.index({ studentId: 1 });
assignmentSubmissionSchema.index({ schoolId: 1, homeworkId: 1 });

export const AssignmentSubmission = mongoose.model<IAssignmentSubmission>(
  'AssignmentSubmission',
  assignmentSubmissionSchema,
);

// ─── Student Progress ──────────────────────────────────────────────────────────

export interface IStudentProgress extends Document {
  studentId: Types.ObjectId;
  subjectId: Types.ObjectId;
  schoolId: Types.ObjectId;
  term: number;
  year: number;
  masteryPercentage: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
  averageMark: number;
  trend: TrendDirection;
  strengths: string[];
  weaknesses: string[];
  lastUpdated: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const studentProgressSchema = new Schema<IStudentProgress>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    term: { type: Number, required: true, min: 1, max: 4 },
    year: { type: Number, required: true },
    masteryPercentage: { type: Number, default: 0, min: 0, max: 100 },
    assignmentsCompleted: { type: Number, default: 0, min: 0 },
    assignmentsTotal: { type: Number, default: 0, min: 0 },
    averageMark: { type: Number, default: 0, min: 0 },
    trend: { type: String, enum: ['improving', 'stable', 'declining'], default: 'stable' },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    lastUpdated: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

studentProgressSchema.index({ studentId: 1, subjectId: 1, term: 1, year: 1 }, { unique: true });
studentProgressSchema.index({ schoolId: 1, subjectId: 1 });

export const StudentProgress = mongoose.model<IStudentProgress>(
  'StudentProgress',
  studentProgressSchema,
);
