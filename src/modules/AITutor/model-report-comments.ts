import mongoose, { Schema, Document, Types } from 'mongoose';

export type ReportCommentTone = 'encouraging' | 'balanced' | 'formal';

export interface IReportComment extends Document {
  schoolId: Types.ObjectId;
  teacherId: Types.ObjectId;
  studentId: Types.ObjectId;
  subjectId: Types.ObjectId;
  classId?: Types.ObjectId;
  term: number;
  academicYear: number;
  tone: ReportCommentTone;
  aiGenerated: string;
  finalText: string;
  wasEdited: boolean;
  lastEditedAt?: Date;
  lastEditedBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reportCommentSchema = new Schema<IReportComment>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    term: { type: Number, required: true, min: 1, max: 4 },
    academicYear: { type: Number, required: true },
    tone: { type: String, enum: ['encouraging', 'balanced', 'formal'], required: true },
    aiGenerated: { type: String, required: true },
    finalText: { type: String, required: true },
    wasEdited: { type: Boolean, default: false },
    lastEditedAt: { type: Date },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

// One active comment per (student, subject, term, year) — soft-deleted excluded
reportCommentSchema.index(
  { schoolId: 1, studentId: 1, subjectId: 1, term: 1, academicYear: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

export const ReportComment = mongoose.model<IReportComment>('ReportComment', reportCommentSchema);
