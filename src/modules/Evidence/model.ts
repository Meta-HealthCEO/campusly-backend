// src/modules/Evidence/model.ts
//
// AnswerEvidence (spec §3): one row per answered question per attempt.
// Idempotent key: (school, source type, record, item). Soft delete only.
import mongoose, { Schema, Document, Types } from 'mongoose';
import { CAPS_LEVELS } from '../QuestionBank/model-shared.js';
import {
  ANSWER_KINDS, CHANNELS, DELETED_REASONS, DIAGNOSIS_STATES, MARKED_BY, SOURCE_TYPES, TOPIC_FROM,
  type AnswerKind, type CapsLevel, type Channel, type DeletedReason, type DiagnosisState, type MarkedBy,
  type SourceType, type TopicFrom,
} from './types.js';

export interface IEvidenceDiagnosis {
  state: DiagnosisState;
  typeId: Types.ObjectId | null;
  explanation: string;
  confidence: number | null;
  cacheKey: string;
  skippedReason: string | null;
  requestId: Types.ObjectId | null;
  attempts: number;
  diagnosedAt: Date | null;
  dismissedBy: Types.ObjectId | null;
  dismissedAt: Date | null;
}

export interface IAnswerEvidence extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  userId: Types.ObjectId | null;
  classId: Types.ObjectId | null;
  subjectId: Types.ObjectId | null;
  gradeId: Types.ObjectId | null;
  topicNodeId: Types.ObjectId | null;
  subtopicNodeId: Types.ObjectId | null;
  topicFrom: TopicFrom;
  cognitiveLevel: CapsLevel | null;
  marksAwarded: number;
  marksAvailable: number;
  source: {
    type: SourceType; channel: Channel | null; recordId: Types.ObjectId; parentId: Types.ObjectId;
    itemKey: string; position: number; attemptNumber: number;
  };
  questionKey: string;
  questionId: Types.ObjectId | null;
  answer: { kind: AnswerKind; text: string; truncated: boolean; hash: string };
  markedBy: MarkedBy;
  markerNote: string;
  markedAt: Date;
  status: 'provisional' | 'final';
  finalAt: Date | null;
  totalOverridden: boolean;
  diagnosis: IEvidenceDiagnosis;
  isDeleted: boolean;
  deletedReason: DeletedReason | null;
  createdAt: Date;
  updatedAt: Date;
}

const oidRef = (ref: string) => ({ type: Schema.Types.ObjectId, ref, default: null });

const diagnosisSchema = new Schema<IEvidenceDiagnosis>(
  {
    state: { type: String, enum: DIAGNOSIS_STATES, required: true },
    typeId: oidRef('MisconceptionType'),
    explanation: { type: String, default: '', maxlength: 240 },
    confidence: { type: Number, default: null, min: 0, max: 1 },
    cacheKey: { type: String, required: true },
    skippedReason: { type: String, default: null },
    requestId: oidRef('DiagnosisRequest'),
    attempts: { type: Number, default: 0, min: 0 },
    diagnosedAt: { type: Date, default: null },
    dismissedBy: oidRef('User'),
    dismissedAt: { type: Date, default: null },
  },
  { _id: false },
);

const answerEvidenceSchema = new Schema<IAnswerEvidence>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    userId: oidRef('User'),
    classId: oidRef('Class'),
    subjectId: oidRef('Subject'),
    gradeId: oidRef('Grade'),
    topicNodeId: oidRef('CurriculumNode'),
    subtopicNodeId: oidRef('CurriculumNode'),
    topicFrom: { type: String, enum: TOPIC_FROM, required: true },
    cognitiveLevel: { type: String, enum: CAPS_LEVELS, default: null },
    marksAwarded: { type: Number, required: true, min: 0 },
    marksAvailable: { type: Number, required: true, min: 0 },
    source: {
      type: { type: String, enum: SOURCE_TYPES, required: true },
      channel: { type: String, enum: CHANNELS, default: null },
      recordId: { type: Schema.Types.ObjectId, required: true },
      parentId: { type: Schema.Types.ObjectId, required: true },
      itemKey: { type: String, required: true },
      position: { type: Number, default: 0 },
      attemptNumber: { type: Number, default: 1, min: 1 },
    },
    questionKey: { type: String, required: true },
    questionId: oidRef('Question'),
    answer: {
      kind: { type: String, enum: ANSWER_KINDS, required: true },
      text: { type: String, default: '', maxlength: 2000 },
      truncated: { type: Boolean, default: false },
      hash: { type: String, required: true },
    },
    markedBy: { type: String, enum: MARKED_BY, required: true },
    markerNote: { type: String, default: '', maxlength: 500 },
    markedAt: { type: Date, required: true },
    status: { type: String, enum: ['provisional', 'final'], required: true },
    finalAt: { type: Date, default: null },
    totalOverridden: { type: Boolean, default: false },
    diagnosis: { type: diagnosisSchema, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedReason: { type: String, enum: DELETED_REASONS, default: null },
  },
  { timestamps: true },
);

answerEvidenceSchema.index({ schoolId: 1, 'source.type': 1, 'source.recordId': 1, 'source.itemKey': 1 }, { unique: true });
answerEvidenceSchema.index({ schoolId: 1, studentId: 1, subjectId: 1, topicNodeId: 1, markedAt: -1 });
answerEvidenceSchema.index({ schoolId: 1, classId: 1, subjectId: 1, topicNodeId: 1 });
answerEvidenceSchema.index({ schoolId: 1, 'source.parentId': 1, classId: 1, isDeleted: 1 });
answerEvidenceSchema.index({ 'diagnosis.state': 1, markedAt: 1 }, { partialFilterExpression: { 'diagnosis.state': 'pending' } });
answerEvidenceSchema.index({ schoolId: 1, 'diagnosis.cacheKey': 1 });
answerEvidenceSchema.index({ schoolId: 1, 'diagnosis.typeId': 1 });

export const AnswerEvidence = mongoose.model<IAnswerEvidence>('AnswerEvidence', answerEvidenceSchema);
