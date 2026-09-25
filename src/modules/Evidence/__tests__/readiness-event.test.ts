// src/modules/Evidence/__tests__/readiness-event.test.ts
//
// Phase R subscribes to `readiness:recompute`: E announces it whenever a
// learner's FINAL evidence is written, changed or removed.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { AnswerEvidence } from '../model.js';
import { READINESS_RECOMPUTE, onReadinessRecompute, type ReadinessRecompute } from '../events.js';
import { softDeleteRows, writeEvidenceRows } from '../write-rows.js';
import { resetGenericTypeCache } from '../taxonomy-generic.js';
import type { EvidenceItem, EvidenceRecord } from '../types.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
const schoolId = oid();
const heard: ReadinessRecompute[] = [];
let stop: () => void = () => undefined;

const record = (over: Partial<EvidenceRecord> = {}): EvidenceRecord => ({
  schoolId, studentId: oid(), userId: null, classId: null, subjectId: oid(), gradeId: null,
  source: { type: 'homework', channel: null, recordId: oid(), parentId: oid(), attemptNumber: 1 },
  markedAt: new Date(), status: 'final', finalAt: new Date(), totalOverridden: false, ...over,
});
const item = (itemKey: string, over: Partial<EvidenceItem> = {}): EvidenceItem => ({
  itemKey, position: 0, questionKey: `lq:x:${itemKey}`, questionId: null, nodeId: null, topicFrom: 'none', cognitiveLevel: null,
  marksAwarded: 1, marksAvailable: 2, answerText: 'x', answerKind: 'typed', markedBy: 'ai', markerNote: '', ...over,
});

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
beforeEach(() => {
  resetGenericTypeCache();
  heard.length = 0;
  stop = onReadinessRecompute((e) => { heard.push(e); });
});
afterEach(() => stop());
afterAll(async () => {
  await AnswerEvidence.deleteMany({ schoolId });
  await mongoose.disconnect();
});

describe(READINESS_RECOMPUTE, () => {
  it('is announced once when final rows are written, and not again when nothing changed', async () => {
    const rec = record();
    await writeEvidenceRows(rec, [item('a'), item('b')]);
    expect(heard).toEqual([{ schoolId: String(schoolId), studentId: String(rec.studentId), subjectId: String(rec.subjectId) }]);
    await writeEvidenceRows(rec, [item('a'), item('b')]);
    expect(heard).toHaveLength(1);
    await writeEvidenceRows(rec, [item('a', { marksAwarded: 2 })]);
    expect(heard).toHaveLength(2);
  });

  it('is not announced for provisional rows or a dry run', async () => {
    await writeEvidenceRows(record({ status: 'provisional', finalAt: null }), [item('a')]);
    await writeEvidenceRows(record(), [item('a')], { dryRun: true });
    expect(heard).toHaveLength(0);
  });

  it('is announced when final rows are soft-deleted', async () => {
    const rec = record();
    await writeEvidenceRows(rec, [item('a')]);
    heard.length = 0;
    await softDeleteRows({ schoolId, 'source.recordId': rec.source.recordId }, 'source_deleted');
    expect(heard).toEqual([{ schoolId: String(schoolId), studentId: String(rec.studentId), subjectId: String(rec.subjectId) }]);
  });

  it('a subscriber that fails never fails the write', async () => {
    const failing = onReadinessRecompute(() => { throw new Error('R is down'); });
    const quiet = vi.fn();
    const later = onReadinessRecompute(quiet);
    await expect(writeEvidenceRows(record(), [item('a')])).resolves.toMatchObject({ written: 1 });
    expect(quiet).toHaveBeenCalledTimes(1);
    failing();
    later();
  });
});
