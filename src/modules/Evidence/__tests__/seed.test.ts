// src/modules/Evidence/__tests__/seed.test.ts
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../../config/env.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../../config/env.js')>();
  return { config: { ...real.config, evidence: { mode: 'fixture', enabled: true } } };
});

import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { DiagnosisRequest, MisconceptionType } from '../model-taxonomy.js';
import { ensureTopicTypes, seedTopicTypes } from '../seed.js';
import { estimateRand } from '../../../scripts/evidence-cost.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
let topic: Oid;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  const subject = oid();
  topic = oid();
  await CurriculumNode.collection.insertMany([
    { _id: subject, frameworkId: oid(), type: 'subject', parentId: null, title: 'Mathematics', code: `E-SEED-${String(subject)}`, metadata: {}, order: 0, schoolId: null, isDeleted: false },
    { _id: topic, frameworkId: oid(), type: 'topic', parentId: subject, subjectId: subject, title: 'Functions', code: `E-SEED-${String(topic)}`,
      metadata: { capsReference: 'CAPS p.23', assessmentStandards: ['Determine inverses'] }, order: 0, schoolId: null, isDeleted: false },
  ]);
});
afterAll(async () => {
  await Promise.all([
    CurriculumNode.deleteMany({ code: /^E-SEED-/ }), MisconceptionType.deleteMany({ code: /^E-SEED-/ }), DiagnosisRequest.deleteMany({ topicNodeId: topic }),
  ]);
  await mongoose.disconnect();
});

describe('seeding a topic', () => {
  it('adds the topic’s types as seeded, coded <topic code>.<slug>, and records the call', async () => {
    const added = await seedTopicTypes(topic, { schoolId: null, teacherId: null });
    expect(added).toBe(8);
    const types = await MisconceptionType.find({ topicNodeId: topic }).lean();
    expect(types.every((t) => t.status === 'seeded' && t.origin === 'ai_seed' && t.code.startsWith(`E-SEED-${String(topic)}.`))).toBe(true);
    expect(await DiagnosisRequest.findOne({ kind: 'seed', topicNodeId: topic }).lean()).toMatchObject({ state: 'done', mode: 'fixture' });
  });

  it('seeds only once: a topic with types needs no call', async () => {
    const before = await DiagnosisRequest.countDocuments({ kind: 'seed', topicNodeId: topic });
    expect(await ensureTopicTypes(topic, { schoolId: null, teacherId: null })).toBe(true);
    expect(await DiagnosisRequest.countDocuments({ kind: 'seed', topicNodeId: topic })).toBe(before);
  });
});

describe('estimateRand', () => {
  it('halves the price in a batch', () => {
    expect(estimateRand(1_000_000, 0, false)).toBeCloseTo(2 * estimateRand(1_000_000, 0, true));
  });
});
