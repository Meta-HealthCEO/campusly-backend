// src/modules/Evidence/taxonomy-admin.ts
//
// Review actions on the global taxonomy (spec §6.4, §8.3). The taxonomy holds
// no learner data and is shared by every school, so re-pointing rows and
// cache on a merge or retire deliberately crosses schools (the one place in
// Phase E a query is not scoped to a school).
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AnswerEvidence } from './model.js';
import { ACTIVE_TYPE_STATUSES, DiagnosisCache, MisconceptionType, type TypeKind, type TypeStatus } from './model-taxonomy.js';
import { genericTypeId } from './taxonomy-generic.js';
import type { Oid } from './types.js';

async function activeType(id: Oid) {
  const doc = await MisconceptionType.findById(id).lean();
  if (!doc || !ACTIVE_TYPE_STATUSES.includes(doc.status)) throw new NotFoundError('Misconception type not found');
  return doc;
}

const reviewed = (reviewerId: Oid | null) => ({ reviewedBy: reviewerId, reviewedAt: reviewerId ? new Date() : null });

async function repoint(fromId: Oid, toId: Oid): Promise<void> {
  await AnswerEvidence.updateMany({ 'diagnosis.typeId': fromId }, { $set: { 'diagnosis.typeId': toId } });
  await DiagnosisCache.updateMany({ typeId: fromId }, { $set: { typeId: toId } });
}

export async function mergeType(fromId: Oid, intoId: Oid, reviewerId: Oid | null): Promise<void> {
  if (fromId.equals(intoId)) throw new BadRequestError('Choose a different type to merge into');
  const [from, into] = await Promise.all([activeType(fromId), activeType(intoId)]);
  if (from.kind === 'generic') throw new BadRequestError('General types stay as they are');
  if (into.kind !== 'generic' && String(into.topicNodeId) !== String(from.topicNodeId)) {
    throw new BadRequestError('Merge only into a type of the same topic, or a general one');
  }
  await repoint(fromId, intoId);
  await MisconceptionType.updateOne({ _id: fromId }, { $set: { status: 'merged', mergedInto: intoId, suggestedMergeInto: null, ...reviewed(reviewerId) } });
  await MisconceptionType.updateOne({ _id: intoId }, { $inc: { useCount: from.useCount } });
}

export async function approveType(id: Oid, reviewerId: Oid): Promise<void> {
  await activeType(id);
  await MisconceptionType.updateOne({ _id: id }, { $set: { status: 'approved', ...reviewed(reviewerId) } });
}

export async function renameType(id: Oid, patch: { label?: string; learnerLabel?: string; description?: string }, reviewerId: Oid): Promise<void> {
  await activeType(id);
  await MisconceptionType.updateOne({ _id: id }, { $set: { ...patch, ...reviewed(reviewerId) } });
}

export async function retireType(id: Oid, replacementId: Oid | null, reviewerId: Oid): Promise<void> {
  const doc = await activeType(id);
  if (doc.kind === 'generic') throw new BadRequestError('General types stay as they are');
  const replacement = replacementId ?? (await genericTypeId('incomplete-answer'));
  if (replacement.equals(id)) throw new BadRequestError('Choose a different type to replace it');
  await activeType(replacement);
  await repoint(id, replacement);
  await MisconceptionType.updateOne({ _id: id }, { $set: { status: 'retired', ...reviewed(reviewerId) } });
}

export interface TypeListItem {
  id: string; code: string; kind: TypeKind; status: TypeStatus; label: string; learnerLabel: string; description: string;
  useCount: number; createdAt: string; subject: string; topic: string;
  suggestedMerge: { id: string; label: string; confidence: number } | null;
}

export async function listTypes(filter: { status?: TypeStatus; topicNodeId?: string; limit?: number }): Promise<TypeListItem[]> {
  const query: Record<string, unknown> = { kind: { $ne: 'generic' } };
  if (filter.status) query.status = filter.status;
  if (filter.topicNodeId) query.topicNodeId = new mongoose.Types.ObjectId(filter.topicNodeId);
  const types = await MisconceptionType.find(query).sort({ createdAt: -1 }).limit(filter.limit ?? 200).lean();
  const nodeIds = [...new Set(types.flatMap((t) => [t.topicNodeId, t.subjectNodeId]).filter(Boolean).map(String))];
  const suggestionIds = types.map((t) => t.suggestedMergeInto).filter(Boolean);
  const [nodes, suggestions] = await Promise.all([
    CurriculumNode.find({ _id: { $in: nodeIds } }).select('title').lean(),
    MisconceptionType.find({ _id: { $in: suggestionIds } }).select('label').lean(),
  ]);
  const title = new Map(nodes.map((n) => [String(n._id), n.title]));
  const label = new Map(suggestions.map((s) => [String(s._id), s.label]));
  return types.map((t) => ({
    id: String(t._id), code: t.code, kind: t.kind, status: t.status, label: t.label, learnerLabel: t.learnerLabel, description: t.description,
    useCount: t.useCount, createdAt: t.createdAt.toISOString(), subject: title.get(String(t.subjectNodeId)) ?? '', topic: title.get(String(t.topicNodeId)) ?? '',
    suggestedMerge: t.suggestedMergeInto && label.has(String(t.suggestedMergeInto))
      ? { id: String(t.suggestedMergeInto), label: label.get(String(t.suggestedMergeInto))!, confidence: t.suggestedMergeConfidence ?? 0 }
      : null,
  }));
}
