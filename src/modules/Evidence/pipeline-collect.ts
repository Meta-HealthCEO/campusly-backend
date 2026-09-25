// src/modules/Evidence/pipeline-collect.ts
//
// Every 2 minutes (spec §6.5): read ended batches, match results by
// custom_id, validate each item, write the cache, make every row with that
// cache key ready. Bad or missing items go back to pending; the third
// failure is final. Never throws for one bad item.
import { logger } from '../../common/logger.js';
import { AnswerEvidence } from './model.js';
import { DiagnosisCache, DiagnosisRequest, MisconceptionType } from './model-taxonomy.js';
import { collectBatch, parseReply, type EvidenceReply } from './ai-transport.js';
import { DiagnosisReplySchema } from './diagnosis-prompt.js';
import { topicTaxonomy, typeForItem } from './diagnosis-types.js';
import { closeRequest, customIdFor, logAIUsage, sourceTeacherId } from './ledger.js';
import type { Oid } from './types.js';

export const MAX_DIAGNOSIS_ATTEMPTS = 3;
export const EXPIRE_AFTER_MS = 30 * 3600_000;
/** Ruling 9: a deleted school's requests are soft-deleted; raw rows may lack the field. */
const LIVE = { isDeleted: { $ne: true } };

export function groupBy<T>(items: readonly T[], keyOf: (item: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const item of items) out.set(keyOf(item), [...(out.get(keyOf(item)) ?? []), item]);
  return out;
}

export async function bumpAttempts(schoolId: Oid | null, cacheKeys: readonly string[]): Promise<void> {
  if (!schoolId || cacheKeys.length === 0) return;
  const open = { schoolId, 'diagnosis.cacheKey': { $in: [...cacheKeys] }, 'diagnosis.state': { $in: ['queued', 'pending'] }, isDeleted: false };
  await AnswerEvidence.updateMany(open, { $inc: { 'diagnosis.attempts': 1 }, $set: { 'diagnosis.state': 'pending', 'diagnosis.requestId': null } });
  await AnswerEvidence.updateMany({ ...open, 'diagnosis.attempts': { $gte: MAX_DIAGNOSIS_ATTEMPTS } }, { $set: { 'diagnosis.state': 'failed' } });
}

export async function applyReply(requestId: Oid, reply: EvidenceReply): Promise<number> {
  const request = await DiagnosisRequest.findOne({ _id: requestId, ...LIVE }).lean();
  if (!request || request.state !== 'submitted') return 0;
  const parsed = reply.ok ? parseReply(reply.text, DiagnosisReplySchema) : null;
  const tax = parsed && request.topicNodeId ? await topicTaxonomy(request.topicNodeId as Oid) : null;
  const done = new Set<string>();
  for (const item of tax && parsed ? parsed.items : []) {
    const entry = request.items.find((i) => i.ref === item.ref);
    if (!entry || done.has(entry.cacheKey)) continue;
    const typeId = await typeForItem(tax!, item);
    await DiagnosisCache.updateOne(
      { cacheKey: entry.cacheKey },
      { $setOnInsert: { schoolId: request.schoolId, cacheKey: entry.cacheKey, typeId, explanation: item.explanation, confidence: item.confidence, requestId } },
      { upsert: true },
    );
    const res = await AnswerEvidence.updateMany(
      { schoolId: request.schoolId, 'diagnosis.cacheKey': entry.cacheKey, 'diagnosis.state': { $in: ['queued', 'pending'] }, isDeleted: false },
      { $set: {
        'diagnosis.state': 'ready', 'diagnosis.typeId': typeId, 'diagnosis.explanation': item.explanation,
        'diagnosis.confidence': item.confidence, 'diagnosis.diagnosedAt': new Date(), 'diagnosis.requestId': requestId,
      } },
    );
    await MisconceptionType.updateOne({ _id: typeId }, { $inc: { useCount: res.modifiedCount }, $set: { lastUsedAt: new Date() } });
    done.add(entry.cacheKey);
  }
  await bumpAttempts(request.schoolId as Oid | null, request.items.map((i) => i.cacheKey).filter((k) => !done.has(k)));
  await closeRequest(requestId, reply, reply.ok && !parsed ? 'invalid_reply' : undefined);
  if (request.schoolId && reply.usage.input + reply.usage.output > 0) {
    const row = await AnswerEvidence.findOne({ schoolId: request.schoolId, 'diagnosis.cacheKey': { $in: request.items.map((i) => i.cacheKey) } })
      .select('source').lean();
    const teacherId = row ? await sourceTeacherId(row.source, request.schoolId as Oid) : null;
    await logAIUsage(request.schoolId as Oid, teacherId, 'evidence_diagnosis', reply.usage);
  }
  return done.size;
}

export async function collectDiagnoses(now: Date = new Date()): Promise<{ applied: number; waiting: number }> {
  const open = await DiagnosisRequest.find({ kind: 'diagnosis', state: 'submitted', mode: 'batch', batchId: { $ne: null }, ...LIVE })
    .select('batchId createdAt').lean();
  let applied = 0;
  let waiting = 0;
  for (const [batchId, requests] of groupBy(open, (r) => String(r.batchId))) {
    let result: { ended: boolean; replies: EvidenceReply[] };
    try {
      result = await collectBatch(batchId);
    } catch (err: unknown) {
      logger.warn({ err, batchId }, '[Evidence] could not read a diagnosis batch; will try again');
      waiting += requests.length;
      continue;
    }
    const replies = new Map(result.replies.map((r) => [r.customId, r]));
    for (const r of requests) {
      const expired = !result.ended && now.getTime() - r.createdAt.getTime() > EXPIRE_AFTER_MS;
      if (!result.ended && !expired) {
        waiting += 1;
        continue;
      }
      const customId = customIdFor(r._id as Oid);
      const reply = replies.get(customId) ?? {
        customId, ok: false, text: '', usage: { input: 0, output: 0 }, error: expired ? 'expired' : 'missing', retryable: true,
      };
      applied += await applyReply(r._id as Oid, reply);
    }
  }
  return { applied, waiting };
}
