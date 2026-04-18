import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Sub-document interfaces ──────────────────────────────────────────────────

export interface ITranscriptSegment {
  speaker: string;
  text: string;
  timestamp: number;
}

export interface ITeacherQuestion {
  question: string;
  answer: string;
  timestamp: number;
}

export interface IStudentQuestion {
  student: string;
  question: string;
  response: string;
  source: 'chat' | 'verbal';
}

export interface IPollResult {
  question: string;
  options: string[];
  responseCounts: number[];
  totalResponses: number;
}

export interface IKeyTerm {
  term: string;
  definition: string;
}

export interface ILessonNotes {
  summary: string;
  keyConcepts: string[];
  teacherQuestions: ITeacherQuestion[];
  studentQuestions: IStudentQuestion[];
  pollResults: IPollResult[];
  actionItems: string[];
  keyTerms: IKeyTerm[];
}

// ─── Main interface ───────────────────────────────────────────────────────────

export type LessonNoteStatus = 'processing' | 'completed' | 'failed';

export interface ILessonNote extends Document {
  sessionId: Types.ObjectId;
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  classId: Types.ObjectId;
  subjectId: Types.ObjectId;
  recordingUrl: string;
  transcript: ITranscriptSegment[];
  notes: ILessonNotes;
  status: LessonNoteStatus;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-document schemas ─────────────────────────────────────────────────────

const transcriptSegmentSchema = new Schema<ITranscriptSegment>(
  {
    speaker: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Number, required: true },
  },
  { _id: false },
);

const teacherQuestionSchema = new Schema<ITeacherQuestion>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    timestamp: { type: Number, required: true },
  },
  { _id: false },
);

const studentQuestionSchema = new Schema<IStudentQuestion>(
  {
    student: { type: String, required: true },
    question: { type: String, required: true },
    response: { type: String, required: true },
    source: { type: String, enum: ['chat', 'verbal'], required: true },
  },
  { _id: false },
);

const pollResultSchema = new Schema<IPollResult>(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    responseCounts: [{ type: Number, required: true }],
    totalResponses: { type: Number, required: true },
  },
  { _id: false },
);

const keyTermSchema = new Schema<IKeyTerm>(
  {
    term: { type: String, required: true },
    definition: { type: String, required: true },
  },
  { _id: false },
);

const lessonNotesSchema = new Schema<ILessonNotes>(
  {
    summary: { type: String, default: '' },
    keyConcepts: [{ type: String }],
    teacherQuestions: { type: [teacherQuestionSchema], default: [] },
    studentQuestions: { type: [studentQuestionSchema], default: [] },
    pollResults: { type: [pollResultSchema], default: [] },
    actionItems: [{ type: String }],
    keyTerms: { type: [keyTermSchema], default: [] },
  },
  { _id: false },
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const lessonNoteSchema = new Schema<ILessonNote>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'VirtualSession', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    recordingUrl: { type: String, required: true },
    transcript: { type: [transcriptSegmentSchema], default: [] },
    notes: { type: lessonNotesSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    errorMessage: { type: String },
  },
  { timestamps: true },
);

lessonNoteSchema.index({ sessionId: 1 });
lessonNoteSchema.index({ classId: 1, schoolId: 1 });

export const LessonNote = mongoose.model<ILessonNote>('LessonNote', lessonNoteSchema);
