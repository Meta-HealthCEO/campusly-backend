// src/modules/Evidence/__tests__/models.test.ts
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { AnswerEvidence } from '../model.js';
import { DiagnosisCache, DiagnosisRequest, MisconceptionType } from '../model-taxonomy.js';
import { GENERIC_TYPES, ensureGenericTypes, genericTypeId, resetGenericTypeCache } from '../taxonomy-generic.js';
import { cascadeSoftDeleteSchool } from '../../../common/utils.js';

const oid = () => new mongoose.Types.ObjectId();
const schoolId = oid();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await AnswerEvidence.init();
});
beforeEach(() => resetGenericTypeCache());
afterAll(async () => {
  await Promise.all([AnswerEvidence.deleteMany({ schoolId }), DiagnosisCache.deleteMany({ schoolId }), DiagnosisRequest.deleteMany({ schoolId })]);
  await mongoose.disconnect();
});

function row(itemKey: string) {
  return {
    schoolId, studentId: oid(), questionKey: 'q:x', topicFrom: 'none', cognitiveLevel: null,
    marksAwarded: 1, marksAvailable: 2, markedBy: 'ai', markerNote: '', markedAt: new Date(), status: 'provisional',
    source: { type: 'test', channel: 'online', recordId: recordId, parentId: oid(), itemKey, position: 0, attemptNumber: 1 },
    answer: { kind: 'typed', text: 'x', truncated: false, hash: 'h' },
    diagnosis: { state: 'pending', cacheKey: 'k' },
  };
}
const recordId = oid();

describe('the evidence models', () => {
  it('holds one row per (school, source, record, item)', async () => {
    await AnswerEvidence.create(row('1.1'));
    await expect(AnswerEvidence.create(row('1.1'))).rejects.toThrow(/E11000/);
  });

  it('seeds the nine generic types once and keeps a reviewer rename', async () => {
    const first = await ensureGenericTypes();
    await MisconceptionType.updateOne({ code: 'GEN.careless-arithmetic' }, { $set: { label: 'Slip in the working' } });
    resetGenericTypeCache();
    const second = await ensureGenericTypes();
    expect(first.size).toBe(GENERIC_TYPES.length);
    expect(String(second.get('unanswered'))).toBe(String(first.get('unanswered')));
    expect((await MisconceptionType.findOne({ code: 'GEN.careless-arithmetic' }).lean())?.label).toBe('Slip in the working');
    expect((await MisconceptionType.findOne({ code: 'GEN.possible-marking-error' }).lean())?.learnerVisible).toBe(false);
    expect(String(await genericTypeId('unanswered'))).toBe(String(first.get('unanswered')));
    await MisconceptionType.updateOne({ code: 'GEN.careless-arithmetic' }, { $set: { label: 'Arithmetic slip' } }); // later files read the label
  });

  it("goes with the school's cascade soft delete, with the school's cache and AI ledger", async () => {
    const typeId = (await ensureGenericTypes()).get('unanswered')!;
    await DiagnosisCache.create({ schoolId, cacheKey: `k-${String(schoolId)}`, typeId, explanation: 'x', confidence: 1 });
    await DiagnosisRequest.create({ kind: 'diagnosis', schoolId, mode: 'fixture', state: 'done', model: 'm' });
    await cascadeSoftDeleteSchool(String(schoolId));
    expect(await AnswerEvidence.countDocuments({ schoolId, isDeleted: false })).toBe(0);
    expect(await DiagnosisCache.countDocuments({ schoolId, isDeleted: true })).toBe(1);
    expect(await DiagnosisRequest.countDocuments({ schoolId, isDeleted: true })).toBe(1);
  });
});
