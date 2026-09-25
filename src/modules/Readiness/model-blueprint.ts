// src/modules/Readiness/model-blueprint.ts
//
// ExamBlueprint (spec §2.1): one document per subject family × exam year × version; global, no learner data.
import mongoose, { Schema, Document, Types } from 'mongoose';
import { CAPS_LEVELS } from '../QuestionBank/model.js';
import type { BlueprintData, BlueprintLevel, BlueprintPaper, BlueprintSource, BlueprintTopic, MappedNode } from './types.js';

export const BLUEPRINT_STATUSES = ['draft', 'published', 'retired'] as const;
export type BlueprintStatus = (typeof BLUEPRINT_STATUSES)[number];

export interface IExamBlueprint extends Document, BlueprintData {
  status: BlueprintStatus;
  version: number;
  acknowledgedWarnings: string[];
  publishedBy: Types.ObjectId | null;
  publishedAt: Date | null;
  supersedes: Types.ObjectId | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const nodeSchema = new Schema<MappedNode>({
  code: { type: String, required: true }, nodeId: { type: String, required: true },
  level: { type: String, enum: ['topic', 'subtopic'], required: true }, grade: { type: Number, required: true },
  termNumber: { type: Number, default: null },
}, { _id: false });
const topicSchema = new Schema<BlueprintTopic>({
  key: { type: String, required: true }, label: { type: String, required: true }, group: { type: String, required: true },
  marks: { type: Number, required: true, min: 1 }, tolerance: { type: Number, default: null },
  sourceRef: { type: String, default: '' }, verified: { type: Boolean, default: false }, note: { type: String, default: '' },
  nodes: { type: [nodeSchema], default: [] },
}, { _id: false });
const paperSchema = new Schema<BlueprintPaper>({
  key: { type: String, required: true }, title: { type: String, required: true },
  totalMarks: { type: Number, required: true, min: 1 }, durationMinutes: { type: Number, required: true, min: 1 },
  examDate: { type: String, default: null }, sitting: { type: String, enum: ['morning', 'afternoon', null], default: null },
  sourceRef: { type: String, default: '' }, verified: { type: Boolean, default: false },
  topics: { type: [topicSchema], default: [] },
}, { _id: false });
const levelSchema = new Schema<BlueprintLevel>({
  key: { type: String, required: true }, label: { type: String, required: true }, percent: { type: Number, required: true, min: 0, max: 100 },
  fromStored: { type: [String], enum: CAPS_LEVELS, default: [] }, sourceRef: { type: String, default: '' }, verified: { type: Boolean, default: false },
}, { _id: false });
const sourceSchema = new Schema<BlueprintSource>({
  ref: { type: String, required: true }, title: { type: String, required: true },
  edition: { type: String, default: '' }, publisher: { type: String, default: '' },
}, { _id: false });

const examBlueprintSchema = new Schema<IExamBlueprint>({
  family: { type: String, required: true, trim: true },
  examBody: { type: String, enum: ['DBE'], required: true },
  qualification: { type: String, enum: ['NSC'], required: true },
  session: { type: String, enum: ['november'], required: true },
  subjectKey: { type: String, required: true }, slug: { type: String, required: true }, subjectTitle: { type: String, required: true },
  grade: { type: Number, required: true }, examYear: { type: Number, required: true },
  sources: { type: [sourceSchema], default: [] },
  cognitiveScheme: {
    key: { type: String, required: true },
    levels: { type: [levelSchema], default: [] },
  },
  papers: { type: [paperSchema], default: [] },
  status: { type: String, enum: BLUEPRINT_STATUSES, required: true },
  version: { type: Number, default: 0 },
  acknowledgedWarnings: { type: [String], default: [] },
  publishedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  publishedAt: { type: Date, default: null },
  supersedes: { type: Schema.Types.ObjectId, ref: 'ExamBlueprint', default: null },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

examBlueprintSchema.index({ family: 1, examYear: 1 }, { unique: true, partialFilterExpression: { status: 'draft', isDeleted: false } });
examBlueprintSchema.index({ subjectKey: 1, grade: 1, examYear: 1 }, { unique: true, partialFilterExpression: { status: 'published', isDeleted: false } });
examBlueprintSchema.index({ slug: 1, grade: 1, examYear: 1, status: 1 });

export const ExamBlueprint = mongoose.model<IExamBlueprint>('ExamBlueprint', examBlueprintSchema);
