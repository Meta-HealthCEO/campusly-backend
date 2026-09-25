// src/modules/Evidence/service-reasons.ts
//
// "Why marks were lost" per answer (spec §7.1, §8.1). The learner sees only
// their own final rows, with learner labels, and never a low-confidence,
// check-mark, teacher-only or dismissed reason.
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AnswerEvidence, type IAnswerEvidence } from './model.js';
import { MisconceptionType, type TypeKind } from './model-taxonomy.js';
import { recordAccess, type Audience, type RecordAccess } from './access.js';
import type { DiagnosisState, Oid } from './types.js';

export const LEARNER_MIN_CONFIDENCE = 0.6;
export type ReasonState = 'none' | 'working' | 'ready' | 'dismissed' | 'limit' | 'failed';

export interface LostMarksReasonItem {
  rowId: string; itemKey: string; position: number; marksAwarded: number; marksAvailable: number; state: ReasonState;
  reason: null | {
    typeId: string; label: string; learnerLabel: string; kind: TypeKind; topicTitle: string | null;
    explanation: string; lowConfidence: boolean; checkMark: boolean;
  };
}

const STATE: Record<DiagnosisState, ReasonState> = {
  none: 'none', pending: 'working', queued: 'working', ready: 'ready', skipped: 'none',
  skipped_budget: 'limit', failed: 'failed', dismissed: 'dismissed',
};

interface TypeLite { _id: Oid; code: string; kind: TypeKind; label: string; learnerLabel: string; learnerVisible: boolean }
type Row = Pick<IAnswerEvidence, 'marksAwarded' | 'marksAvailable' | 'topicNodeId'> & {
  _id: Oid; source: { itemKey: string; position: number }; diagnosis: { state: DiagnosisState; typeId: Oid | null; explanation: string; confidence: number | null };
};

function toItem(row: Row, type: TypeLite | undefined, topicTitle: string | null, audience: Audience): LostMarksReasonItem {
  const base = { rowId: String(row._id), itemKey: row.source.itemKey, position: row.source.position ?? 0, marksAwarded: row.marksAwarded, marksAvailable: row.marksAvailable };
  let state = STATE[row.diagnosis.state];
  if ((state === 'ready' || state === 'dismissed') && !type) state = 'none';
  const checkMark = type?.code === 'GEN.possible-marking-error';
  const lowConfidence = (row.diagnosis.confidence ?? 1) < LEARNER_MIN_CONFIDENCE;
  if (audience === 'learner') {
    const hidden = state === 'dismissed' || state === 'limit' || state === 'failed'
      || (state === 'ready' && (lowConfidence || checkMark || !type!.learnerVisible));
    if (hidden || state !== 'ready') return { ...base, state: hidden ? 'none' : state, reason: null };
    return { ...base, state, reason: {
      typeId: String(type!._id), label: type!.learnerLabel, learnerLabel: type!.learnerLabel, kind: type!.kind, topicTitle,
      explanation: row.diagnosis.explanation, lowConfidence: false, checkMark: false,
    } };
  }
  const reason = type && (state === 'ready' || state === 'dismissed') ? {
    typeId: String(type._id), label: type.label, learnerLabel: type.learnerLabel, kind: type.kind, topicTitle,
    explanation: row.diagnosis.explanation, lowConfidence, checkMark,
  } : null;
  return { ...base, state, reason };
}

export async function lostMarksReasons(access: RecordAccess): Promise<{ items: LostMarksReasonItem[] }> {
  const rows = (await AnswerEvidence.find({
    schoolId: access.schoolId, 'source.type': access.source, 'source.recordId': access.recordId, isDeleted: false,
    ...(access.audience === 'learner' ? { status: 'final' } : {}),
  }).sort({ 'source.position': 1 }).select('marksAwarded marksAvailable topicNodeId source diagnosis').lean()) as unknown as Row[];
  const typeIds = rows.map((r) => r.diagnosis.typeId).filter(Boolean);
  const topicIds = rows.map((r) => r.topicNodeId).filter(Boolean);
  const [types, topics] = await Promise.all([
    MisconceptionType.find({ _id: { $in: typeIds } }).select('code kind label learnerLabel learnerVisible').lean(),
    CurriculumNode.find({ _id: { $in: topicIds } }).select('title').lean(),
  ]);
  const typeById = new Map((types as unknown as TypeLite[]).map((t) => [String(t._id), t]));
  const topicTitle = new Map(topics.map((t) => [String(t._id), t.title]));
  return { items: rows.map((r) => toItem(
    r, r.diagnosis.typeId ? typeById.get(String(r.diagnosis.typeId)) : undefined,
    r.topicNodeId ? topicTitle.get(String(r.topicNodeId)) ?? null : null, access.audience,
  )) };
}

/** Teacher only (the route says so). Idempotent: dismissing a dismissed reason is fine. */
export async function setDismissed(user: AuthenticatedUser, rowId: string, dismissed: boolean): Promise<void> {
  if (!user.schoolId) throw new NotFoundError('Not found');
  const schoolId = new mongoose.Types.ObjectId(user.schoolId);
  const row = await AnswerEvidence.findOne({ _id: new mongoose.Types.ObjectId(rowId), schoolId, isDeleted: false }).select('source').lean();
  if (!row || (row.source.type !== 'test' && row.source.type !== 'homework')) throw new NotFoundError('Not found');
  await recordAccess(user, row.source.type, String(row.source.recordId));
  const res = await AnswerEvidence.updateOne(
    { _id: row._id, schoolId, 'diagnosis.state': { $in: ['ready', 'dismissed'] } },
    { $set: dismissed
      ? { 'diagnosis.state': 'dismissed', 'diagnosis.dismissedBy': new mongoose.Types.ObjectId(user.id), 'diagnosis.dismissedAt': new Date() }
      : { 'diagnosis.state': 'ready', 'diagnosis.dismissedBy': null, 'diagnosis.dismissedAt': null } },
  );
  if (res.matchedCount === 0) throw new BadRequestError('There is no reason on this answer to hide or show');
}
