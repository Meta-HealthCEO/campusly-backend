// src/modules/Evidence/__tests__/pipeline.test.ts
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';

const t = vi.hoisted(() => ({ direct: vi.fn(), submitBatch: vi.fn(), collectBatch: vi.fn() }));
vi.mock('../../../config/env.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../../config/env.js')>();
  return { config: { ...real.config, evidence: { mode: 'fixture', enabled: true } } };
});
vi.mock('../ai-transport.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../ai-transport.js')>();
  return { ...real, sendDirect: t.direct, submitBatch: t.submitBatch, collectBatch: t.collectBatch };
});

import { AnswerEvidence } from '../model.js';
import { DiagnosisCache, DiagnosisRequest, MisconceptionType } from '../model-taxonomy.js';
import { AIUsageLog } from '../../AITools/model.js';
import { School } from '../../School/model.js';
import { fixtureReply } from '../ai-fixture.js';
import type { EvidencePrompt } from '../ai-transport.js';
import { syncMarkingEvidence } from '../writers/test.js';
import { writeEvidenceRows } from '../write-rows.js';
import { submitDiagnoses } from '../pipeline-submit.js';
import { collectDiagnoses } from '../pipeline-collect.js';
import { customIdFor } from '../ledger.js';
import { resetGenericTypeCache } from '../taxonomy-generic.js';
import { DIAGNOSIS_POOL_FREE } from '../diagnosis-pool.js';
import { cleanUpEvidenceFixtures, seedMarkedPaper, seedMarking, type MarkedPaperFixture } from '../../../test-utils/evidence-fixtures.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
let fx: MarkedPaperFixture;
const SAME_WRONG = [{ n: '1.1', answer: 'y = 3x', awarded: 1, max: 2 }];
/** Checkpoint fix 4: the writer reads a marking inside its school. */
const sync = (id: Oid, schoolId: Oid = fx.schoolId) => syncMarkingEvidence(id, schoolId);

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  fx = await seedMarkedPaper();
});
beforeEach(() => {
  resetGenericTypeCache();
  t.direct.mockReset().mockImplementation(async (p: EvidencePrompt) => fixtureReply(p));
  t.submitBatch.mockReset();
  t.collectBatch.mockReset();
});
afterAll(async () => {
  await Promise.all([
    DiagnosisRequest.deleteMany({}), DiagnosisCache.deleteMany({ schoolId: fx.schoolId }), AIUsageLog.deleteMany({ schoolId: fx.schoolId }),
    MisconceptionType.deleteMany({ topicNodeId: fx.topicId }), School.deleteMany({ name: /^E pipeline/ }),
  ]);
  await cleanUpEvidenceFixtures(fx.schoolId);
  await mongoose.disconnect();
});

const rowsOn = (n: string) => AnswerEvidence.find({ schoolId: fx.schoolId, 'source.itemKey': n, isDeleted: false }).lean();

describe('submitDiagnoses (direct and fixture)', () => {
  it('two learners with the same wrong answer buy one diagnosis; the topic is seeded first', async () => {
    for (const s of fx.students.slice(0, 2)) await sync(await seedMarking(fx, s, SAME_WRONG));
    const report = await submitDiagnoses({ schoolId: String(fx.schoolId), mode: 'fixture' });
    expect(report).toMatchObject({ candidates: 2, requests: 1, keys: 1, seeded: 1 });
    const rows = await rowsOn('1.1');
    expect(rows.map((r) => r.diagnosis.state)).toEqual(['ready', 'ready']);
    expect(String(rows[0].diagnosis.typeId)).toBe(String(rows[1].diagnosis.typeId));
    expect(await DiagnosisCache.countDocuments({ schoolId: fx.schoolId })).toBe(1);
    expect(await DiagnosisRequest.countDocuments({ kind: 'seed', topicNodeId: fx.topicId })).toBe(1);
  });

  it('a later identical answer is a cache hit, with no new request', async () => {
    await sync(await seedMarking(fx, fx.students[2], SAME_WRONG));
    const before = await DiagnosisRequest.countDocuments({ kind: 'diagnosis' });
    const report = await submitDiagnoses({ schoolId: String(fx.schoolId), mode: 'fixture' });
    expect(report).toMatchObject({ cacheHits: 1, requests: 0 });
    expect(await DiagnosisRequest.countDocuments({ kind: 'diagnosis' })).toBe(before);
  });

  it('packs at most 10 answers of one topic per request, and the prompt carries no ids', async () => {
    const items = Array.from({ length: 23 }, (_, i) => ({
      itemKey: `x${i}`, position: i, questionKey: `q:${String(fx.bankQuestionId)}`, questionId: fx.bankQuestionId, nodeId: fx.topicId,
      topicFrom: 'question' as const, cognitiveLevel: 'routine' as const, marksAwarded: 0, marksAvailable: 2, answerText: `wrong ${i}`,
      answerKind: 'typed' as const, markedBy: 'ai' as const, markerNote: '',
    }));
    await writeEvidenceRows({ schoolId: fx.schoolId, studentId: fx.students[0], userId: null, classId: fx.classId, subjectId: null, gradeId: null,
      source: { type: 'test', channel: 'online', recordId: oid(), parentId: fx.paperId, attemptNumber: 1 }, markedAt: new Date(), status: 'provisional',
      finalAt: null, totalOverridden: false }, items);
    const report = await submitDiagnoses({ schoolId: String(fx.schoolId), mode: 'fixture' });
    expect(report).toMatchObject({ keys: 23, requests: 3 });
    const sizes = (await DiagnosisRequest.find({ kind: 'diagnosis', schoolId: fx.schoolId }).sort({ createdAt: -1 }).limit(3).lean()).map((r) => r.items.length).sort();
    expect(sizes).toEqual([10, 10, 3]);
    for (const [prompt] of t.direct.mock.calls as Array<[EvidencePrompt]>) {
      if (prompt.kind === 'diagnosis') expect(prompt.user).not.toMatch(/[0-9a-f]{24}/);
    }
  });

  it('writes tokens to AIUsageLog against the marking teacher', async () => {
    t.direct.mockImplementation(async (p: EvidencePrompt) => ({ ...fixtureReply(p), usage: { input: 1900, output: 150 } }));
    await sync(await seedMarking(fx, oid(), [{ n: '1.1', answer: 'x = 3y', awarded: 0, max: 2 }]));
    await submitDiagnoses({ schoolId: String(fx.schoolId), mode: 'direct' });
    expect(await AIUsageLog.findOne({ schoolId: fx.schoolId, type: 'evidence_diagnosis' }).lean()).toMatchObject({ tokensUsed: { input: 1900, output: 150 } });
    expect(String((await AIUsageLog.findOne({ schoolId: fx.schoolId, type: 'evidence_diagnosis' }).lean())!.teacherId)).toBe(String(fx.teacherId));
  });

  it('over the pool, the rest are skipped, not failed', async () => {
    const pooled = await seedMarkedPaper();
    await School.collection.insertOne({ _id: pooled.schoolId, name: 'E pipeline pool', joinCode: `EPP${String(pooled.schoolId).slice(-8)}`, plan: 'standalone', isDeleted: false });
    await DiagnosisRequest.collection.insertOne({ kind: 'diagnosis', schoolId: pooled.schoolId, mode: 'batch', state: 'done', model: 'm', createdAt: new Date(),
      items: Array.from({ length: DIAGNOSIS_POOL_FREE - 1 }, (_, i) => ({ ref: `a${i}`, cacheKey: `k${i}` })) });
    await sync(await seedMarking(pooled, pooled.students[0], [{ n: '1.1', answer: 'one', awarded: 0, max: 2 }, { n: '1.2', answer: 'two', awarded: 0, max: 3 }]), pooled.schoolId);
    const report = await submitDiagnoses({ schoolId: String(pooled.schoolId), mode: 'fixture' });
    expect(report).toMatchObject({ keys: 1, skippedBudget: 1 });
    const states = (await AnswerEvidence.find({ schoolId: pooled.schoolId }).lean()).map((r) => r.diagnosis.state).sort();
    expect(states).toEqual(['ready', 'skipped_budget']);
    await cleanUpEvidenceFixtures(pooled.schoolId);
  });
});

describe('batches', () => {
  it('queues the rows; a row written later joins the request already in flight', async () => {
    t.submitBatch.mockResolvedValue('msgbatch_1');
    await sync(await seedMarking(fx, oid(), [{ n: '1.1', answer: 'batch answer', awarded: 0, max: 2 }]));
    await submitDiagnoses({ schoolId: String(fx.schoolId), mode: 'batch' });
    const request = await DiagnosisRequest.findOne({ batchId: 'msgbatch_1' }).lean();
    expect(request).toMatchObject({ state: 'submitted', mode: 'batch' });
    await sync(await seedMarking(fx, oid(), [{ n: '1.1', answer: 'Batch answer.', awarded: 0, max: 2 }]));
    const report = await submitDiagnoses({ schoolId: String(fx.schoolId), mode: 'batch' });
    expect(report.joined).toBe(1);
    expect(t.submitBatch).toHaveBeenCalledTimes(1);
    expect((await AnswerEvidence.find({ 'diagnosis.requestId': request!._id }).lean()).map((r) => r.diagnosis.state)).toEqual(['queued', 'queued']);
  });

  it('collects out of order and survives bad items', async () => {
    const make = async (label: string) => {
      const cacheKey = `E-PIPE-${label}-${String(oid())}`;
      await AnswerEvidence.create({ schoolId: fx.schoolId, studentId: oid(), topicNodeId: fx.topicId, questionKey: 'q:x', topicFrom: 'question', marksAwarded: 0,
        marksAvailable: 1, markedBy: 'ai', markedAt: new Date(), status: 'final', answer: { kind: 'typed', text: label, truncated: false, hash: label },
        source: { type: 'test', recordId: oid(), parentId: oid(), itemKey: '1' }, diagnosis: { state: 'queued', cacheKey } });
      const r = await DiagnosisRequest.create({ kind: 'diagnosis', schoolId: fx.schoolId, topicNodeId: fx.topicId, mode: 'batch', batchId: 'msgbatch_2',
        state: 'submitted', model: 'm', items: [{ ref: 'a1', cacheKey }] });
      return { cacheKey, id: r._id as Oid };
    };
    const [good, errored, expired, garbled] = [await make('good'), await make('errored'), await make('expired'), await make('garbled')];
    const code = (await MisconceptionType.findOne({ topicNodeId: fx.topicId, status: 'seeded' }).lean())!.code;
    t.collectBatch.mockResolvedValue({ ended: true, replies: [
      { customId: customIdFor(garbled.id), ok: true, text: 'not json', usage: { input: 10, output: 5 }, error: null, retryable: false },
      { customId: customIdFor(expired.id), ok: false, text: '', usage: { input: 0, output: 0 }, error: 'expired', retryable: true },
      { customId: customIdFor(errored.id), ok: false, text: '', usage: { input: 0, output: 0 }, error: 'api_error', retryable: true },
      { customId: customIdFor(good.id), ok: true, text: JSON.stringify({ items: [{ ref: 'a1', code, explanation: 'Check the sign.', confidence: 0.9 }] }), usage: { input: 10, output: 5 }, error: null, retryable: false },
    ] });
    await expect(collectDiagnoses()).resolves.toMatchObject({ applied: 1 });
    const state = async (k: string) => (await AnswerEvidence.findOne({ 'diagnosis.cacheKey': k }).lean())!.diagnosis;
    expect(await state(good.cacheKey)).toMatchObject({ state: 'ready', explanation: 'Check the sign.' });
    for (const k of [errored.cacheKey, expired.cacheKey, garbled.cacheKey]) expect(await state(k)).toMatchObject({ state: 'pending', attempts: 1 });
    expect(await DiagnosisRequest.findById(garbled.id).lean()).toMatchObject({ state: 'done', error: 'invalid_reply' });
    expect(await DiagnosisRequest.findById(errored.id).lean()).toMatchObject({ state: 'failed' });
  });

  it('the third failure is final, and a batch still running after 30 hours counts as expired', async () => {
    const cacheKey = `E-PIPE-late-${String(oid())}`;
    await AnswerEvidence.create({ schoolId: fx.schoolId, studentId: oid(), topicNodeId: fx.topicId, questionKey: 'q:x', topicFrom: 'question', marksAwarded: 0,
      marksAvailable: 1, markedBy: 'ai', markedAt: new Date(), status: 'final', answer: { kind: 'typed', text: 'late', truncated: false, hash: 'late' },
      source: { type: 'test', recordId: oid(), parentId: oid(), itemKey: '1' }, diagnosis: { state: 'queued', cacheKey, attempts: 2 } });
    await DiagnosisRequest.collection.insertOne({ kind: 'diagnosis', schoolId: fx.schoolId, topicNodeId: fx.topicId, mode: 'batch', batchId: 'msgbatch_3',
      state: 'submitted', model: 'm', usage: { input: 0, output: 0 }, items: [{ ref: 'a1', cacheKey }], createdAt: new Date(Date.now() - 31 * 3600_000) });
    t.collectBatch.mockResolvedValue({ ended: false, replies: [] });
    await collectDiagnoses();
    expect((await AnswerEvidence.findOne({ 'diagnosis.cacheKey': cacheKey }).lean())!.diagnosis).toMatchObject({ state: 'failed', attempts: 3 });
  });
});
