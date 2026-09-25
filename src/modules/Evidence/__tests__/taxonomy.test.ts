// src/modules/Evidence/__tests__/taxonomy.test.ts
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';

const t = vi.hoisted(() => ({ direct: vi.fn() }));
vi.mock('../ai-transport.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../ai-transport.js')>();
  return { ...real, sendDirect: t.direct, transportMode: () => 'direct' };
});

import app from '../../../app.js';
import { signTestToken } from '../../../test-utils/auth.js';
import { AnswerEvidence } from '../model.js';
import { DiagnosisCache, DiagnosisRequest, MisconceptionType } from '../model-taxonomy.js';
import { genericTypeId, resetGenericTypeCache } from '../taxonomy-generic.js';
import { tidyTaxonomy } from '../tidy.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
const topic = oid();
const schoolId = oid();
const admin = () => signTestToken({ id: oid(), role: 'super_admin', schoolId: oid(), isStandaloneTeacher: false, isSchoolPrincipal: false });
const teacher = () => signTestToken({ id: oid(), role: 'teacher', schoolId, isStandaloneTeacher: false, isSchoolPrincipal: false });
const type = (slug: string, status: string) => MisconceptionType.create({
  code: `E-TAX-${String(topic)}.${slug}`, kind: 'misconception', topicNodeId: topic, label: slug, learnerLabel: slug, description: slug, status,
  origin: status === 'proposed' ? 'ai_proposed' : 'ai_seed',
});
const rowWith = async (typeId: Oid) => {
  await AnswerEvidence.create({ schoolId, studentId: oid(), topicNodeId: topic, questionKey: 'q:x', topicFrom: 'question', marksAwarded: 0, marksAvailable: 1,
    markedBy: 'ai', markedAt: new Date(), status: 'final', answer: { kind: 'typed', text: 'x', truncated: false, hash: 'h' },
    source: { type: 'test', recordId: oid(), parentId: oid(), itemKey: '1' }, diagnosis: { state: 'ready', cacheKey: `c-${String(oid())}`, typeId } });
  await DiagnosisCache.create({ schoolId, cacheKey: `c-${String(oid())}`, typeId, explanation: 'e', confidence: 0.8 });
};

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
beforeEach(() => { resetGenericTypeCache(); t.direct.mockReset(); });
afterAll(async () => {
  await Promise.all([
    MisconceptionType.deleteMany({ code: /^E-TAX-/ }), AnswerEvidence.deleteMany({ schoolId }), DiagnosisCache.deleteMany({ schoolId }),
    DiagnosisRequest.deleteMany({ kind: 'tidy', topicNodeId: topic }),
  ]);
  await mongoose.disconnect();
});

describe('tidyTaxonomy', () => {
  it('merges a proposed duplicate at ≥ 0.9 and re-points rows and cache; anything less becomes a suggestion', async () => {
    const seeded = await type('sign-error', 'seeded');
    const dup = await type('lost-the-minus', 'proposed');
    const near = await type('negative-exponent', 'proposed');
    await rowWith(dup._id as Oid);
    t.direct.mockResolvedValue({ customId: 'x', ok: true, usage: { input: 10, output: 5 }, error: null, retryable: false, text: JSON.stringify({ pairs: [
      { from: dup.code, to: seeded.code, confidence: 0.95 }, { from: near.code, to: seeded.code, confidence: 0.6 },
    ] }) });
    expect(await tidyTaxonomy()).toMatchObject({ merged: 1, suggested: 1 });
    expect(await MisconceptionType.findById(dup._id).lean()).toMatchObject({ status: 'merged' });
    expect(await AnswerEvidence.countDocuments({ 'diagnosis.typeId': dup._id })).toBe(0);
    expect(await AnswerEvidence.countDocuments({ 'diagnosis.typeId': seeded._id })).toBe(1);
    expect(await DiagnosisCache.countDocuments({ typeId: seeded._id })).toBe(1);
    expect(String((await MisconceptionType.findById(near._id).lean())!.suggestedMergeInto)).toBe(String(seeded._id));
  });
});

describe('/api/evidence/taxonomy (super admin)', () => {
  it('a teacher is refused', async () => {
    await request(app).get('/api/evidence/taxonomy').set('Authorization', `Bearer ${teacher()}`).expect(403);
  });

  it('lists proposed types with the suggested merge, then approves, renames, merges and retires', async () => {
    const list = await request(app).get('/api/evidence/taxonomy?status=proposed').set('Authorization', `Bearer ${admin()}`).expect(200);
    const near = (list.body.data as Array<{ id: string; label: string; suggestedMerge: { label: string } | null }>).find((i) => i.label === 'negative-exponent');
    expect(near?.suggestedMerge?.label).toBe('sign-error');

    const extra = await type('powers-added', 'proposed');
    await request(app).post(`/api/evidence/taxonomy/${String(extra._id)}/approve`).set('Authorization', `Bearer ${admin()}`).expect(204);
    await request(app).patch(`/api/evidence/taxonomy/${String(extra._id)}`).set('Authorization', `Bearer ${admin()}`)
      .send({ label: 'Added the powers', learnerLabel: 'Added powers instead of multiplying' }).expect(204);
    expect(await MisconceptionType.findById(extra._id).lean()).toMatchObject({ status: 'approved', label: 'Added the powers' });

    await rowWith(extra._id as Oid);
    await request(app).post(`/api/evidence/taxonomy/${String(extra._id)}/retire`).set('Authorization', `Bearer ${admin()}`).send({}).expect(204);
    expect(await AnswerEvidence.countDocuments({ 'diagnosis.typeId': await genericTypeId('incomplete-answer'), schoolId })).toBe(1);

    await request(app).post(`/api/evidence/taxonomy/${near!.id}/merge`).set('Authorization', `Bearer ${admin()}`).send({ intoId: near!.id }).expect(400);
  });
});
