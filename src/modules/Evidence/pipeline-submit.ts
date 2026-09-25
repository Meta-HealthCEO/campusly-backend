// src/modules/Evidence/pipeline-submit.ts
//
// Every 10 minutes (spec §6.1, §6.5): pending rows → cache hits → rows that
// join a request already in flight → the school's pool → requests of ≤ 10
// unique answers of one school and topic → one Message Batch (or direct).
import mongoose from 'mongoose';
import { logger } from '../../common/logger.js';
import { AnswerEvidence } from './model.js';
import { DiagnosisCache, DiagnosisRequest } from './model-taxonomy.js';
import { diagnosisPool, markSkippedBudget, poolRemaining, splitByPool } from './diagnosis-pool.js';
import { ensureTopicTypes, hasActiveTypes } from './seed.js';
import { topicTaxonomy } from './diagnosis-types.js';
import { questionContexts } from './question-context.js';
import { DIAGNOSIS_SYSTEM, MAX_ITEMS_PER_REQUEST, diagnosisMaxTokens, diagnosisUserPrompt } from './diagnosis-prompt.js';
import { sendDirect, submitBatch, transportMode, type EvidencePrompt, type TransportMode } from './ai-transport.js';
import { customIdFor, openRequest, sourceTeacherId } from './ledger.js';
import { applyReply, groupBy } from './pipeline-collect.js';
import type { Oid, SourceType } from './types.js';

export const SUBMIT_LIMIT = 2000;
/** Ruling 9: a deleted school's cache and requests are soft-deleted. */
const LIVE = { isDeleted: { $ne: true } };

interface Candidate {
  _id: Oid; schoolId: Oid; topicNodeId: Oid | null; questionKey: string; marksAwarded: number; marksAvailable: number;
  markerNote: string; answer: { text: string }; diagnosis: { cacheKey: string }; source: { type: SourceType; recordId: Oid; parentId: Oid };
}
interface Outgoing { requestId: Oid; prompt: EvidencePrompt }

export interface SubmitReport { candidates: number; cacheHits: number; joined: number; skippedBudget: number; seeded: number; requests: number; keys: number }
export interface SubmitOptions { schoolId?: string; limit?: number; now?: Date; mode?: TransportMode; dryRun?: boolean }

const pendingOf = (schoolId: Oid, keys: string | { $in: string[] }) =>
  ({ schoolId, 'diagnosis.cacheKey': keys, 'diagnosis.state': 'pending', isDeleted: false });

async function cacheHits(byKey: Map<string, Candidate>, report: SubmitReport, dryRun: boolean): Promise<string[]> {
  const cached = await DiagnosisCache.find({ cacheKey: { $in: [...byKey.keys()] }, ...LIVE }).lean();
  for (const c of cached) {
    report.cacheHits += 1;
    if (dryRun) continue;
    await AnswerEvidence.updateMany(pendingOf(c.schoolId as Oid, c.cacheKey), { $set: {
      'diagnosis.state': 'ready', 'diagnosis.typeId': c.typeId, 'diagnosis.explanation': c.explanation,
      'diagnosis.confidence': c.confidence, 'diagnosis.diagnosedAt': new Date(),
    } });
  }
  const hit = new Set(cached.map((c) => c.cacheKey));
  return [...byKey.keys()].filter((k) => !hit.has(k));
}

async function joinInFlight(keys: string[], byKey: Map<string, Candidate>, report: SubmitReport, dryRun: boolean): Promise<string[]> {
  const open = await DiagnosisRequest.find({ kind: 'diagnosis', state: 'submitted', 'items.cacheKey': { $in: keys }, ...LIVE }).select('items').lean();
  const inFlight = new Map<string, Oid>();
  for (const r of open) for (const i of r.items) if (keys.includes(i.cacheKey)) inFlight.set(i.cacheKey, r._id as Oid);
  for (const [key, requestId] of inFlight) {
    report.joined += 1;
    if (!dryRun) await AnswerEvidence.updateMany(pendingOf(byKey.get(key)!.schoolId, key), { $set: { 'diagnosis.state': 'queued', 'diagnosis.requestId': requestId } });
  }
  return keys.filter((k) => !inFlight.has(k));
}

async function buildRequests(schoolId: Oid, keys: string[], byKey: Map<string, Candidate>, mode: TransportMode, report: SubmitReport): Promise<Outgoing[]> {
  const first = byKey.get(keys[0])!;
  const topicNodeId = first.topicNodeId as Oid;
  const teacherId = await sourceTeacherId(first.source, schoolId);
  const hadTypes = await hasActiveTypes(topicNodeId);
  if (!(await ensureTopicTypes(topicNodeId, { schoolId, teacherId }))) return []; // stays pending; the next run tries again
  if (!hadTypes) report.seeded += 1;
  const tax = await topicTaxonomy(topicNodeId);
  if (!tax) return [];
  const contexts = await questionContexts(keys.map((k) => byKey.get(k)!.questionKey), schoolId);
  const out: Outgoing[] = [];
  for (let i = 0; i < keys.length; i += MAX_ITEMS_PER_REQUEST) {
    const chunk = keys.slice(i, i + MAX_ITEMS_PER_REQUEST);
    const items = chunk.map((cacheKey, j) => ({ ref: `a${j + 1}`, cacheKey }));
    const request = await openRequest({ kind: 'diagnosis', mode, schoolId, topicNodeId, items });
    await AnswerEvidence.updateMany(pendingOf(schoolId, { $in: chunk }), { $set: { 'diagnosis.state': 'queued', 'diagnosis.requestId': request._id } });
    const promptItems = items.map(({ ref, cacheKey }) => {
      const row = byKey.get(cacheKey)!;
      const ctx = contexts.get(row.questionKey);
      return {
        ref, stem: ctx?.stem ?? '', memo: ctx?.memo ?? '', guideline: ctx?.guideline ?? '',
        awarded: row.marksAwarded, available: row.marksAvailable, markerNote: row.markerNote, answer: row.answer.text,
      };
    });
    out.push({ requestId: request._id, prompt: {
      customId: customIdFor(request._id), kind: 'diagnosis', system: DIAGNOSIS_SYSTEM, user: diagnosisUserPrompt(tax.block, promptItems),
      maxTokens: diagnosisMaxTokens(items.length), hint: { refs: items.map((x) => x.ref), codes: tax.block.types.map((x) => x.code) },
    } });
  }
  return out;
}

async function send(outgoing: Outgoing[], mode: TransportMode): Promise<void> {
  if (mode !== 'batch') {
    for (const o of outgoing) await applyReply(o.requestId, await sendDirect(o.prompt, mode));
    return;
  }
  try {
    const batchId = await submitBatch(outgoing.map((o) => o.prompt));
    await DiagnosisRequest.updateMany({ _id: { $in: outgoing.map((o) => o.requestId) } }, { $set: { batchId } });
  } catch (err: unknown) {
    logger.warn({ err }, '[Evidence] submitting the diagnosis batch failed; the rows go back to pending');
    for (const o of outgoing) {
      await applyReply(o.requestId, { customId: o.prompt.customId, ok: false, text: '', usage: { input: 0, output: 0 }, error: 'submit_failed', retryable: true });
    }
  }
}

export async function submitDiagnoses(options: SubmitOptions = {}): Promise<SubmitReport> {
  const report: SubmitReport = { candidates: 0, cacheHits: 0, joined: 0, skippedBudget: 0, seeded: 0, requests: 0, keys: 0 };
  const mode = options.mode ?? transportMode();
  const dryRun = options.dryRun ?? false;
  const filter: Record<string, unknown> = { 'diagnosis.state': 'pending', isDeleted: false };
  if (options.schoolId) filter.schoolId = new mongoose.Types.ObjectId(options.schoolId);
  const rows = (await AnswerEvidence.find(filter).sort({ markedAt: 1 }).limit(options.limit ?? SUBMIT_LIMIT)
    .select('schoolId topicNodeId questionKey marksAwarded marksAvailable markerNote answer diagnosis.cacheKey source').lean()) as unknown as Candidate[];
  report.candidates = rows.length;
  const byKey = new Map<string, Candidate>();
  for (const r of rows) if (!byKey.has(r.diagnosis.cacheKey)) byKey.set(r.diagnosis.cacheKey, r);
  const misses = await joinInFlight(await cacheHits(byKey, report, dryRun), byKey, report, dryRun);

  const outgoing: Outgoing[] = [];
  for (const keys of groupBy(misses, (k) => String(byKey.get(k)!.schoolId)).values()) {
    const schoolId = byKey.get(keys[0])!.schoolId;
    const { take, skip } = splitByPool(keys, poolRemaining(await diagnosisPool(schoolId, options.now)));
    report.skippedBudget += skip.length;
    if (!dryRun) await markSkippedBudget(schoolId, skip);
    for (const topicKeys of groupBy(take, (k) => String(byKey.get(k)!.topicNodeId)).values()) {
      report.keys += topicKeys.length;
      report.requests += Math.ceil(topicKeys.length / MAX_ITEMS_PER_REQUEST);
      if (!dryRun) outgoing.push(...(await buildRequests(schoolId, topicKeys, byKey, mode, report)));
    }
  }
  if (!dryRun && outgoing.length > 0) await send(outgoing, mode);
  return report;
}
