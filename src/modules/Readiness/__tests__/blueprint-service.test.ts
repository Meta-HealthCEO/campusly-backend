// src/modules/Readiness/__tests__/blueprint-service.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { ExamBlueprint } from '../model-blueprint.js';
import { copyBlueprint, importDraft, patchVerification, publishBlueprint, validateRaw } from '../blueprint-service.js';
import { isBlueprintVerified } from '../blueprint-validate.js';
import { cleanUpReadiness, fixtureBlueprintFile, makeCurriculum, type ReadinessWorld } from '../../../test-utils/readiness-fixture.js';

let w: ReadinessWorld;
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await ExamBlueprint.syncIndexes();
  w = await makeCurriculum();
});
afterAll(async () => {
  await cleanUpReadiness(w);
  await mongoose.disconnect();
});

describe('blueprint import, publish, copy and verification', () => {
  it('validates without writing, and reports parse errors plainly', async () => {
    const r = await validateRaw({ family: 'x' });
    expect(r.parseErrors.length).toBeGreaterThan(0);
    const ok = await validateRaw(fixtureBlueprintFile(w));
    expect(ok.errors).toEqual([]);
    expect(await ExamBlueprint.countDocuments({ subjectKey: w.subjectKey })).toBe(0);
  });

  it('imports as a draft, and importing the same file again changes nothing', async () => {
    const first = await importDraft(fixtureBlueprintFile(w));
    expect(first).toMatchObject({ changed: true });
    expect(first.blueprint).toMatchObject({ status: 'draft', version: 0 });
    const again = await importDraft(fixtureBlueprintFile(w));
    expect(again.changed).toBe(false);
    expect(String(again.blueprint?._id)).toBe(String(first.blueprint?._id));
  });

  it('refuses to import a file with errors', async () => {
    const bad = fixtureBlueprintFile(w);
    bad.papers[0].totalMarks = 99;
    const r = await importDraft(bad);
    expect(r.blueprint).toBeNull();
    expect(r.report.errors).toContain('P1: topic marks add up to 100, not 99');
  });

  it('publishes as version 1, then a new draft publishes as version 2 and retires version 1', async () => {
    const draft = await ExamBlueprint.findOne({ subjectKey: w.subjectKey, status: 'draft' });
    const v1 = await publishBlueprint(String(draft!._id), String(new mongoose.Types.ObjectId()), true);
    expect(v1).toMatchObject({ status: 'published', version: 1 });
    const file = fixtureBlueprintFile(w);
    file.papers[0].title = 'Paper One';
    const { blueprint } = await importDraft(file);
    const v2 = await publishBlueprint(String(blueprint!._id), String(new mongoose.Types.ObjectId()), true);
    expect(v2).toMatchObject({ status: 'published', version: 2 });
    expect(await ExamBlueprint.findById(v1._id).lean()).toMatchObject({ status: 'retired' });
  });

  it('refuses to publish with unacknowledged warnings, and refuses a second family for the same subject, grade and year', async () => {
    const warn = fixtureBlueprintFile(w, { family: `${w.prefix}-OTHER-FAMILY` });
    warn.papers[1].topics[1].nodes.push(`${w.subjectKey}-GR12-T4-REV`);
    const { blueprint } = await importDraft(warn);
    await expect(publishBlueprint(String(blueprint!._id), 'u', false)).rejects.toThrow(/warnings/);
    await expect(publishBlueprint(String(blueprint!._id), 'u', true)).rejects.toThrow(/already published/);
  });

  it('copies to another year with every value unverified and no dates', async () => {
    const published = await ExamBlueprint.findOne({ subjectKey: w.subjectKey, status: 'published' });
    const copy = await copyBlueprint(String(published!._id), 2027);
    expect(copy).toMatchObject({ status: 'draft', examYear: 2027, version: 0 });
    expect(copy.papers.every((p) => p.examDate === null && !p.verified && p.topics.every((t) => !t.verified))).toBe(true);
    await expect(copyBlueprint(String(published!._id), 2027)).rejects.toThrow(/draft for 2027 already exists/);
  });

  it('patches verification flags, sources and dates, and becomes verified only when all are set', async () => {
    const draft = await ExamBlueprint.findOne({ subjectKey: w.subjectKey, examYear: 2027, status: 'draft' });
    const all = {
      papers: [{ key: 'P1', verified: true, examDate: '2027-10-27', sitting: 'morning' as const }, { key: 'P2', verified: true, examDate: '2027-10-30' }],
      topics: ['P1.FUNC', 'P1.CALC', 'P1.PROB', 'P2.TRIG', 'P2.STAT'].map((key) => ({ key, verified: true, sourceRef: 'EG27 p.8' })),
      levels: ['knowledge', 'routine', 'complex'].map((key) => ({ key, verified: true })),
    };
    const almost = await patchVerification(String(draft!._id), all);
    expect(isBlueprintVerified(almost)).toBe(false);
    const done = await patchVerification(String(draft!._id), { levels: [{ key: 'problem_solving', verified: true }] });
    expect(isBlueprintVerified(done)).toBe(true);
    expect(done.papers[0].topics[0].sourceRef).toBe('EG27 p.8');
    await expect(patchVerification(String(draft!._id), { papers: [{ key: 'P1', examDate: '2028-01-01' }] })).rejects.toThrow(/not in 2027/);
  });

  it('refuses to edit a published blueprint once it is verified', async () => {
    const draft = await ExamBlueprint.findOne({ subjectKey: w.subjectKey, examYear: 2027, status: 'draft' });
    const published = await publishBlueprint(String(draft!._id), 'u', true);
    await expect(patchVerification(String(published._id), { topics: [{ key: 'P1.FUNC', verified: false }] })).rejects.toThrow(/verified and published/);
  });
});
