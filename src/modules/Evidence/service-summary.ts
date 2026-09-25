// src/modules/Evidence/service-summary.ts
//
// Phase R reads these (spec §7.2); the HTTP endpoints return the same shapes.
import mongoose from 'mongoose';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AnswerEvidence } from './model.js';
import { MisconceptionType } from './model-taxonomy.js';
import { summariseTopics, type Bucket, type Lookups, type SummaryRow, type TopicEvidence, type TypeInfo } from './summary-buckets.js';
import type { Oid, SourceType } from './types.js';

export interface LearnerTopicEvidence { studentId: string; subjectId: string; asOf: string; topics: TopicEvidence[]; untagged: Bucket }
export interface ClassTopicEvidence { classId: string; subjectId: string; asOf: string; topics: TopicEvidence[]; untagged: Bucket }
export interface EvidenceRowView {
  id: string; topicNodeId: string | null; subtopicNodeId: string | null; cognitiveLevel: string | null; topicFrom: string;
  marksAwarded: number; marksAvailable: number; source: { type: SourceType; itemKey: string }; markedAt: string; totalOverridden: boolean; answer: string;
}

interface Lean {
  _id: Oid; studentId: Oid; topicNodeId: Oid | null; subtopicNodeId: Oid | null; cognitiveLevel: string | null; topicFrom: SummaryRow['topicFrom'];
  marksAwarded: number; marksAvailable: number; markedAt: Date; totalOverridden: boolean;
  source: { type: SourceType; itemKey: string }; answer: { text: string }; diagnosis: { state: string; typeId: Oid | null };
}

const FIELDS = 'studentId topicNodeId subtopicNodeId cognitiveLevel topicFrom marksAwarded marksAvailable markedAt totalOverridden source answer diagnosis';

const toSummaryRow = (r: Lean): SummaryRow => ({
  studentId: String(r.studentId), topicNodeId: r.topicNodeId ? String(r.topicNodeId) : null, subtopicNodeId: r.subtopicNodeId ? String(r.subtopicNodeId) : null,
  cognitiveLevel: r.cognitiveLevel, sourceType: r.source.type, marksAwarded: r.marksAwarded, marksAvailable: r.marksAvailable,
  markedAt: r.markedAt, topicFrom: r.topicFrom, typeId: r.diagnosis.typeId ? String(r.diagnosis.typeId) : null, diagnosisState: r.diagnosis.state,
});

async function lookups(rows: readonly Lean[]): Promise<Lookups> {
  const nodeIds = [...new Set(rows.flatMap((r) => [r.topicNodeId, r.subtopicNodeId]).filter(Boolean).map(String))];
  const typeIds = [...new Set(rows.map((r) => r.diagnosis.typeId).filter(Boolean).map(String))];
  const [nodes, types] = await Promise.all([
    CurriculumNode.find({ _id: { $in: nodeIds } }).select('title code').lean(),
    MisconceptionType.find({ _id: { $in: typeIds } }).select('code label learnerLabel kind learnerVisible').lean(),
  ]);
  return {
    titles: new Map(nodes.map((n) => [String(n._id), n.title])),
    codes: new Map(nodes.map((n) => [String(n._id), n.code])),
    types: new Map(types.map((t) => [String(t._id), t as unknown as TypeInfo])),
  };
}

export async function learnerTopics(input: {
  schoolId: Oid; studentId: Oid; subjectId: Oid; from?: Date; to?: Date; now?: Date; learnerView?: boolean;
}): Promise<LearnerTopicEvidence> {
  const markedAt: Record<string, Date> = {};
  if (input.from) markedAt.$gte = input.from;
  if (input.to) markedAt.$lte = input.to;
  const rows = (await AnswerEvidence.find({
    schoolId: input.schoolId, studentId: input.studentId, subjectId: input.subjectId, status: 'final', isDeleted: false,
    ...(input.from || input.to ? { markedAt } : {}),
  }).select(FIELDS).lean()) as unknown as Lean[];
  const now = input.now ?? new Date();
  const { topics, untagged } = summariseTopics(rows.map(toSummaryRow), await lookups(rows), { now, countLearners: false, learnerView: input.learnerView ?? false });
  return { studentId: String(input.studentId), subjectId: String(input.subjectId), asOf: now.toISOString(), topics, untagged };
}

export async function classTopics(input: { schoolId: Oid; classId: Oid; subjectId: Oid; now?: Date }): Promise<ClassTopicEvidence> {
  const rows = (await AnswerEvidence.find({
    schoolId: input.schoolId, classId: input.classId, subjectId: input.subjectId, status: 'final', isDeleted: false,
  }).select(FIELDS).lean()) as unknown as Lean[];
  const now = input.now ?? new Date();
  const { topics, untagged } = summariseTopics(rows.map(toSummaryRow), await lookups(rows), { now, countLearners: true, learnerView: false });
  return { classId: String(input.classId), subjectId: String(input.subjectId), asOf: now.toISOString(), topics, untagged };
}

/** Newest first; the cursor is the last row's id (ids grow with time). */
export async function learnerRows(input: {
  schoolId: Oid; studentId: Oid; subjectId?: string; topicNodeId?: string; cursor?: string; limit: number; learnerView: boolean;
}): Promise<{ rows: EvidenceRowView[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = { schoolId: input.schoolId, studentId: input.studentId, status: 'final', isDeleted: false };
  if (input.subjectId) filter.subjectId = new mongoose.Types.ObjectId(input.subjectId);
  if (input.topicNodeId) filter.topicNodeId = new mongoose.Types.ObjectId(input.topicNodeId);
  if (input.cursor) filter._id = { $lt: new mongoose.Types.ObjectId(input.cursor) };
  const rows = (await AnswerEvidence.find(filter).sort({ _id: -1 }).limit(input.limit + 1).select(FIELDS).lean()) as unknown as Lean[];
  const page = rows.slice(0, input.limit);
  return {
    rows: page.map((r) => ({
      id: String(r._id), topicNodeId: r.topicNodeId ? String(r.topicNodeId) : null, subtopicNodeId: r.subtopicNodeId ? String(r.subtopicNodeId) : null,
      cognitiveLevel: r.cognitiveLevel, topicFrom: r.topicFrom, marksAwarded: r.marksAwarded, marksAvailable: r.marksAvailable,
      source: { type: r.source.type, itemKey: r.source.itemKey }, markedAt: r.markedAt.toISOString(), totalOverridden: r.totalOverridden, answer: r.answer.text,
    })),
    nextCursor: rows.length > input.limit ? String(page[page.length - 1]._id) : null,
  };
}
