// src/modules/Evidence/ledger.ts
//
// Every Phase E AI call is a DiagnosisRequest (plan ruling P15): the pool and
// the cost measurement read it. School-attributable calls also go to
// AIUsageLog, which needs a school and a teacher.
import mongoose from 'mongoose';
import { config } from '../../config/env.js';
import { AIUsageLog } from '../AITools/model.js';
import { PaperMarking } from '../AITools/model-marking.js';
import { Homework } from '../Homework/model.js';
import { School } from '../School/model.js';
import { DiagnosisRequest, type RequestKind, type RequestMode } from './model-taxonomy.js';
import type { EvidenceReply } from './ai-transport.js';
import type { Oid, SourceType } from './types.js';

export const customIdFor = (id: Oid): string => `dx_${String(id)}`;

export interface OpenRequestInput {
  kind: RequestKind; mode: RequestMode; schoolId: Oid | null;
  topicNodeId?: Oid | null; paperId?: Oid | null; items?: Array<{ ref: string; cacheKey: string }>;
}

export async function openRequest(input: OpenRequestInput): Promise<{ _id: Oid }> {
  const doc = await DiagnosisRequest.create({
    kind: input.kind, mode: input.mode, schoolId: input.schoolId, topicNodeId: input.topicNodeId ?? null, paperId: input.paperId ?? null,
    items: input.items ?? [], state: 'submitted', model: config.anthropic.diagnosisModel,
  });
  return { _id: doc._id as Oid };
}

/** `failed` only when nothing was spent; a reply we could not use still counts as spend. */
export async function closeRequest(id: Oid, reply: EvidenceReply, error?: string): Promise<void> {
  await DiagnosisRequest.updateOne({ _id: id }, { $set: {
    state: reply.ok ? 'done' : 'failed', usage: reply.usage, error: error ?? reply.error, completedAt: new Date(),
  } });
}

export async function logAIUsage(
  schoolId: Oid | null, teacherId: Oid | null, type: 'evidence_diagnosis' | 'misconception_seed' | 'question_tagging',
  usage: { input: number; output: number },
): Promise<void> {
  if (!schoolId || !teacherId || usage.input + usage.output === 0) return;
  await AIUsageLog.create({ schoolId, teacherId, type, tokensUsed: usage, aiModel: config.anthropic.diagnosisModel });
}

/** Whose work a row came from, for AIUsageLog: the marking or homework teacher, else the school's owner. */
export async function sourceTeacherId(source: { type: SourceType; recordId: Oid; parentId: Oid }, schoolId: Oid): Promise<Oid | null> {
  const sid = new mongoose.Types.ObjectId(String(schoolId));
  if (source.type === 'test') {
    const m = await PaperMarking.findOne({ _id: source.recordId, schoolId: sid }).select('teacherId').lean();
    if (m?.teacherId) return m.teacherId as Oid;
  }
  if (source.type === 'homework') {
    const hw = await Homework.findOne({ _id: source.parentId, schoolId: sid }).select('teacherId').lean();
    if (hw?.teacherId) return hw.teacherId as Oid;
  }
  const school = await School.findOne({ _id: sid }).select('ownerUserId').lean();
  return (school?.ownerUserId as Oid | undefined) ?? null;
}
