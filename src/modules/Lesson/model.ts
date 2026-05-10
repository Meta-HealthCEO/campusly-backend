import mongoose, { Schema } from 'mongoose';
import type { ILesson } from './types.js';
import { LESSON_PHASES } from './types.js';

const textbookRefSchema = new Schema(
  {
    source: { type: String, enum: ['internal', 'external'], required: true },
    textbookId: { type: Schema.Types.ObjectId, ref: 'Textbook' },
    chapterId: { type: Schema.Types.ObjectId },
    title: String,
    publisher: String,
    isbn: String,
    pageStart: Number,
    pageEnd: Number,
    excerpt: { type: String, maxlength: 8000 },
    notes: String,
  },
  { _id: false },
);

const materialSchema = new Schema(
  {
    kind: {
      type: String,
      enum: [
        'reading',
        'worksheet',
        'activity',
        'notes',
        'worked_example',
        'quiz',
        'practice_questions',
        'homework',
        'paper',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    teacherNotes: { type: String, maxlength: 2000 },
    generatedAt: Date,
    textbookRef: textbookRefSchema,
    comprehensionQuestionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    contentResourceId: { type: Schema.Types.ObjectId, ref: 'ContentResource' },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    homeworkId: { type: Schema.Types.ObjectId, ref: 'Homework' },
    paperId: { type: Schema.Types.ObjectId, ref: 'AssessmentPaper' },
  },
  { timestamps: true },
);

const phaseEntrySchema = new Schema(
  {
    phase: { type: String, enum: LESSON_PHASES, required: true },
    materialIds: [{ type: Schema.Types.ObjectId }],
  },
  { _id: false },
);

const lessonSchema = new Schema<ILesson>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
    curriculumNodeId: { type: Schema.Types.ObjectId, ref: 'CurriculumNode', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    date: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 5, max: 480 },
    objectives: [{ type: String, trim: true, maxlength: 500 }],
    phases: {
      type: [phaseEntrySchema],
      default: () => LESSON_PHASES.map((p) => ({ phase: p, materialIds: [] })),
    },
    materials: { type: [materialSchema], default: [] },
    status: {
      type: String,
      enum: ['draft', 'ready', 'taught'],
      default: 'draft',
      required: true,
    },
    reflectionNotes: { type: String, maxlength: 4000 },
    aiGenerated: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

lessonSchema.index({ teacherId: 1, date: 1 });
lessonSchema.index({ schoolId: 1, classId: 1, date: 1 });
lessonSchema.index({ curriculumNodeId: 1 });
lessonSchema.index({ schoolId: 1, status: 1, date: 1 });
lessonSchema.index({ teacherId: 1, status: 1 });

export const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);
