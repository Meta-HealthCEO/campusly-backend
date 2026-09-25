// src/modules/Evidence/__tests__/reconcile.test.ts
// (Task 9's parseEvidenceArgs cases live in src/scripts/__tests__/evidence-args.test.ts since Task 12.)
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { AnswerEvidence } from '../model.js';
import { PaperMarking } from '../../AITools/model-marking.js';
import { reconcileEvidence } from '../reconcile.js';
import { resetGenericTypeCache } from '../taxonomy-generic.js';
import { processEvidenceJob } from '../../../jobs/evidence.job.js';
import { cleanUpEvidenceFixtures, seedMarkedPaper, seedMarking, type MarkedPaperFixture } from '../../../test-utils/evidence-fixtures.js';

let fx: MarkedPaperFixture;
const ANSWERS = [{ n: '1.1', answer: 'y = 3x', awarded: 1, max: 2 }, { n: '1.2', answer: 'No', awarded: 1, max: 3 }];

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  fx = await seedMarkedPaper();
  for (const s of fx.students) await seedMarking(fx, s, ANSWERS);
});
beforeEach(() => resetGenericTypeCache());
afterAll(async () => {
  await cleanUpEvidenceFixtures(fx.schoolId);
  await mongoose.disconnect();
});

describe('reconcileEvidence (the backfill and the daily job)', () => {
  it('a dry run reports and writes nothing', async () => {
    const report = await reconcileEvidence({ apply: false, schoolId: String(fx.schoolId), source: 'test' });
    expect(report.test).toMatchObject({ records: 3, written: 6, rows: 6 });
    expect(report.test.withTopic).toBe(6);
    expect(await AnswerEvidence.countDocuments({ schoolId: fx.schoolId })).toBe(0);
  });

  it('applies, and a second run changes nothing', async () => {
    await reconcileEvidence({ apply: true, schoolId: String(fx.schoolId), source: 'test' });
    const again = await reconcileEvidence({ apply: true, schoolId: String(fx.schoolId), source: 'test' });
    expect(again.test).toMatchObject({ written: 0, updated: 0, unchanged: 6 });
  });

  it('only walks records changed since the date', async () => {
    const report = await reconcileEvidence({ apply: false, schoolId: String(fx.schoolId), source: 'test', since: new Date(Date.now() + 60_000) });
    expect(report.test.records).toBe(0);
  });

  it('soft-deletes rows whose marking was deleted', async () => {
    const marking = await PaperMarking.findOne({ schoolId: fx.schoolId, studentId: fx.students[0] });
    await PaperMarking.updateOne({ _id: marking!._id }, { $set: { isDeleted: true } });
    await reconcileEvidence({ apply: true, schoolId: String(fx.schoolId), source: 'test' });
    expect(await AnswerEvidence.countDocuments({ 'source.recordId': marking!._id, isDeleted: true, deletedReason: 'source_deleted' })).toBe(2);
  });

  it('follows the wrong-paper rule: a photo of another paper gets no rows (checkpoint fix 1)', async () => {
    const wrong = await seedMarking(fx, new mongoose.Types.ObjectId(), ANSWERS, { status: 'needs_review', paperMismatch: true });
    await reconcileEvidence({ apply: true, schoolId: String(fx.schoolId), source: 'test' });
    expect(await AnswerEvidence.countDocuments({ 'source.recordId': wrong, isDeleted: false })).toBe(0);
  });

  it('skips a record with no school, and one bad record never stops the run', async () => {
    const orphan = new mongoose.Types.ObjectId();
    await PaperMarking.collection.insertOne({ _id: orphan, paperId: fx.paperId, paperType: 'assessment', studentName: 'x', status: 'completed',
      questions: [], isDeleted: false, createdAt: new Date(), updatedAt: new Date() });
    try {
      const report = await reconcileEvidence({ apply: false, source: 'test', since: new Date(Date.now() - 60_000) });
      expect(report.test.skipped.no_school).toBe(1);
      expect(report.test.records).toBeGreaterThanOrEqual(4);
    } finally {
      await PaperMarking.collection.deleteOne({ _id: orphan });
    }
  });

  it('the daily job reconciles the last two days', async () => {
    const report = (await processEvidenceJob('reconcile', new Date())) as Record<string, { records: number }>;
    expect(report.test.records).toBeGreaterThanOrEqual(3);
  });
});
