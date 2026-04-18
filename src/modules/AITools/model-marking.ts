import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMarkingQuestion {
  questionNumber: number;
  studentAnswer: string;
  correctAnswer: string;
  marksAwarded: number;
  maxMarks: number;
  feedback: string;
}

export interface IPaperMarking extends Document {
  paperId: Types.ObjectId;
  paperType: 'generated' | 'assessment';
  studentId?: Types.ObjectId;
  studentName: string;
  teacherId: Types.ObjectId;
  schoolId: Types.ObjectId;
  images: string[];
  imageTypes: string[];
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  questions: IMarkingQuestion[];
  status: 'processing' | 'completed' | 'failed' | 'published';
  gradebookEntryId?: Types.ObjectId;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const markingQuestionSchema = new Schema<IMarkingQuestion>(
  {
    questionNumber: { type: Number, required: true },
    studentAnswer: { type: String, default: '' },
    correctAnswer: { type: String, default: '' },
    marksAwarded: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true, min: 0 },
    feedback: { type: String, default: '' },
  },
  { _id: false },
);

const paperMarkingSchema = new Schema<IPaperMarking>(
  {
    paperId: { type: Schema.Types.ObjectId, required: true },
    paperType: { type: String, enum: ['generated', 'assessment'], required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    studentName: { type: String, required: true, trim: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    images: [{ type: String }],
    imageTypes: [{ type: String }],
    totalMarks: { type: Number, default: 0 },
    maxMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    questions: [markingQuestionSchema],
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed', 'published'],
      default: 'processing',
    },
    gradebookEntryId: { type: Schema.Types.ObjectId, ref: 'Mark' },
    errorMessage: { type: String },
  },
  { timestamps: true },
);

paperMarkingSchema.index({ paperId: 1, schoolId: 1 });
paperMarkingSchema.index({ teacherId: 1, schoolId: 1 });
paperMarkingSchema.index({ studentId: 1, paperId: 1 });

export const PaperMarking = mongoose.model<IPaperMarking>('PaperMarking', paperMarkingSchema);
