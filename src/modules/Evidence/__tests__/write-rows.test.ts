// src/modules/Evidence/__tests__/write-rows.test.ts
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { AnswerEvidence } from '../model.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { Subject } from '../../Academic/model.js';
import { createTopicResolver, resolveTopics, schoolSubjectForNode } from '../topic-resolver.js';
import { safeEvidence, writeEvidenceRows } from '../write-rows.js';
import { resetGenericTypeCache } from '../taxonomy-generic.js';
import type { EvidenceItem, EvidenceRecord } from '../types.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
const schoolId = oid();
const otherSchool = oid();
const nodes: Record<string, Oid> = {};

async function node(key: string, type: string, parentId: Oid | null, owner: Oid | null = null, subjectId: Oid | null = null): Promise<Oid> {
  const id = oid();
  await CurriculumNode.collection.insertOne({
    _id: id, frameworkId: oid(), type, parentId, title: key, code: `E-RW-${String(id)}`, description: '', metadata: {},
    order: 0, schoolId: owner, subjectId, isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
  });
  nodes[key] = id;
  return id;
}

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  const subject = await node('Mathematics', 'subject', null);
  const topic = await node('Functions', 'topic', subject, null, subject);
  const sub = await node('Inverses', 'subtopic', topic, null, subject);
  await node('Find the inverse', 'outcome', sub, null, subject);
  await node('Custom', 'topic', null, otherSchool);
  await Subject.collection.insertOne({ _id: oid(), schoolId, name: 'Mathematics', curriculumNodeId: subject, isDeleted: false });
});
beforeEach(() => resetGenericTypeCache());
afterAll(async () => {
  await Promise.all([
    AnswerEvidence.deleteMany({ schoolId }), CurriculumNode.deleteMany({ code: /^E-RW-/ }), Subject.deleteMany({ schoolId }),
  ]);
  await mongoose.disconnect();
});

const recordId = oid();
const record = (overrides: Partial<EvidenceRecord> = {}): EvidenceRecord => ({
  schoolId, studentId: oid(), userId: null, classId: oid(), subjectId: oid(), gradeId: null,
  source: { type: 'test', channel: 'online', recordId, parentId: oid(), attemptNumber: 1 },
  markedAt: new Date('2026-09-20T08:00:00Z'), status: 'provisional', finalAt: null, totalOverridden: false, ...overrides,
});
const item = (itemKey: string, overrides: Partial<EvidenceItem> = {}): EvidenceItem => ({
  itemKey, position: 0, questionKey: `p:x:v1:${itemKey}`, questionId: null, nodeId: nodes.Inverses, topicFrom: 'paper_question',
  cognitiveLevel: 'routine', marksAwarded: 1, marksAvailable: 3, answerText: 'y = 2x', answerKind: 'typed', markedBy: 'ai',
  markerNote: 'Swapped x and y but did not solve for y.', ...overrides,
});

describe('createTopicResolver', () => {
  it('subtopic → its parent topic; outcome walks up; subject → none; another school’s node → none', async () => {
    const resolve = createTopicResolver(schoolId);
    expect(await resolve(nodes.Inverses)).toEqual({ topicNodeId: nodes.Functions, subtopicNodeId: nodes.Inverses });
    expect(await resolve(nodes['Find the inverse'])).toEqual({ topicNodeId: nodes.Functions, subtopicNodeId: nodes.Inverses });
    expect(await resolve(nodes.Functions)).toEqual({ topicNodeId: nodes.Functions, subtopicNodeId: null });
    expect(await resolve(nodes.Mathematics)).toEqual({ topicNodeId: null, subtopicNodeId: null });
    expect(await resolve(nodes.Custom)).toEqual({ topicNodeId: null, subtopicNodeId: null });
  });

  it('a soft-deleted node gives no topic', async () => {
    const gone = await node('Deleted topic', 'topic', nodes.Mathematics, null, nodes.Mathematics);
    await CurriculumNode.collection.updateOne({ _id: gone }, { $set: { isDeleted: true } });
    expect(await createTopicResolver(schoolId)(gone)).toEqual({ topicNodeId: null, subtopicNodeId: null });
  });

  it('resolves each distinct node once, all at the same time', async () => {
    const a = oid();
    const b = oid();
    const started: string[] = [];
    let release: () => void = () => undefined;
    const gate = new Promise<void>((done) => { release = done; });
    const resolve = vi.fn(async (id: Oid | null) => {
      started.push(String(id));
      await gate;
      return { topicNodeId: id, subtopicNodeId: null };
    });
    const pending = resolveTopics(resolve, [a, b, a, null]);
    expect(started).toEqual([String(a), String(b)]); // both started before either finished
    release();
    const topics = await pending;
    expect(resolve).toHaveBeenCalledTimes(2);
    expect(topics.get(String(b))).toEqual({ topicNodeId: b, subtopicNodeId: null });
  });

  it("finds the school's Subject for a node", async () => {
    const subjectId = await schoolSubjectForNode(schoolId, nodes.Inverses);
    expect(subjectId).not.toBeNull();
  });
});

describe('writeEvidenceRows', () => {
  it('writes one row per item with topic, level and a pending diagnosis', async () => {
    const result = await writeEvidenceRows(record(), [item('1.1'), item('1.2', { marksAwarded: 3 })]);
    expect(result).toMatchObject({ written: 2, updated: 0, unchanged: 0, withTopic: 2, withLevel: 2 });
    const r = await AnswerEvidence.findOne({ schoolId, 'source.recordId': recordId, 'source.itemKey': '1.1' }).lean();
    expect(String(r!.topicNodeId)).toBe(String(nodes.Functions));
    expect(String(r!.subtopicNodeId)).toBe(String(nodes.Inverses));
    expect(r!.diagnosis.state).toBe('pending');
    expect(r!.answer).toMatchObject({ kind: 'typed', text: 'y = 2x', truncated: false });
  });

  it('writing the same set again changes nothing', async () => {
    const before = await AnswerEvidence.findOne({ schoolId, 'source.itemKey': '1.1' }).lean();
    const result = await writeEvidenceRows(record({ studentId: before!.studentId, classId: before!.classId, subjectId: before!.subjectId, source: { ...record().source, parentId: before!.source.parentId } }), [item('1.1'), item('1.2', { marksAwarded: 3 })]);
    expect(result).toMatchObject({ written: 0, updated: 0, unchanged: 2 });
    const after = await AnswerEvidence.findOne({ schoolId, 'source.itemKey': '1.1' }).lean();
    expect(after!.updatedAt.getTime()).toBe(before!.updatedAt.getTime());
  });

  it('a changed mark resets that diagnosis; an unchanged row keeps a dismissal', async () => {
    const one = await AnswerEvidence.findOne({ schoolId, 'source.itemKey': '1.1' }).lean();
    const rec = record({ studentId: one!.studentId, classId: one!.classId, subjectId: one!.subjectId, source: { ...record().source, parentId: one!.source.parentId } });
    await writeEvidenceRows(rec, [item('1.1'), item('1.2', { marksAwarded: 3 }), item('1.3')]);
    await AnswerEvidence.updateOne({ _id: one!._id }, { $set: { 'diagnosis.state': 'dismissed' } });
    await writeEvidenceRows(rec, [item('1.1'), item('1.2', { marksAwarded: 3 }), item('1.3', { marksAwarded: 2 })]);
    expect((await AnswerEvidence.findById(one!._id).lean())!.diagnosis.state).toBe('dismissed');
    const three = await AnswerEvidence.findOne({ schoolId, 'source.itemKey': '1.3' }).lean();
    expect(three!.marksAwarded).toBe(2);
    expect(three!.diagnosis.state).toBe('pending');
  });

  it('an item missing from the new set is soft-deleted, and comes back when it returns', async () => {
    const one = await AnswerEvidence.findOne({ schoolId, 'source.itemKey': '1.1' }).lean();
    const rec = record({ studentId: one!.studentId, classId: one!.classId, subjectId: one!.subjectId, source: { ...record().source, parentId: one!.source.parentId } });
    const removed = await writeEvidenceRows(rec, [item('1.1'), item('1.2', { marksAwarded: 3 })]);
    expect(removed.removed).toBe(1);
    expect(await AnswerEvidence.findOne({ schoolId, 'source.itemKey': '1.3' }).lean()).toMatchObject({ isDeleted: true, deletedReason: 'item_removed' });
    await writeEvidenceRows(rec, [item('1.1'), item('1.2', { marksAwarded: 3 }), item('1.3', { marksAwarded: 2 })]);
    expect(await AnswerEvidence.findOne({ schoolId, 'source.itemKey': '1.3' }).lean()).toMatchObject({ isDeleted: false, deletedReason: null });
  });

  it('skips items with no marks available, and counts rows without a topic', async () => {
    const result = await writeEvidenceRows(record({ source: { ...record().source, recordId: oid() } }), [
      item('a', { marksAvailable: 0 }), item('b', { nodeId: null, topicFrom: 'none' }),
    ]);
    expect(result.skipped).toEqual({ zero_marks: 1 });
    expect(result.withTopic).toBe(0);
  });

  it('a changed question key resets the diagnosis even when answer and marks are the same', async () => {
    const rec = record({ source: { ...record().source, recordId: oid() } });
    await writeEvidenceRows(rec, [item('k1')]);
    await AnswerEvidence.updateOne({ 'source.recordId': rec.source.recordId }, { $set: { 'diagnosis.state': 'dismissed' } });
    await writeEvidenceRows(rec, [item('k1', { questionKey: 'p:x:v2:k1' })]);
    const row = await AnswerEvidence.findOne({ schoolId, 'source.recordId': rec.source.recordId }).lean();
    expect(row!.questionKey).toBe('p:x:v2:k1');
    expect(row!.diagnosis.state).toBe('pending');
  });

  it('counts a repeated item number as skipped and keeps the first', async () => {
    const rec = record({ source: { ...record().source, recordId: oid() } });
    const result = await writeEvidenceRows(rec, [item('1.1'), item('1.1', { marksAwarded: 0 })]);
    expect(result.skipped).toEqual({ duplicate_item: 1 });
    expect(result.written).toBe(1);
    expect((await AnswerEvidence.findOne({ 'source.recordId': rec.source.recordId }).lean())!.marksAwarded).toBe(1);
  });

  it('a dry run writes nothing', async () => {
    const id = oid();
    const result = await writeEvidenceRows(record({ source: { ...record().source, recordId: id } }), [item('1.1')], { dryRun: true });
    expect(result.written).toBe(1);
    expect(await AnswerEvidence.countDocuments({ 'source.recordId': id })).toBe(0);
  });
});

describe('safeEvidence', () => {
  it('logs and swallows a failure so the request carries on', async () => {
    const run = vi.fn(async () => { throw new Error('boom'); });
    await expect(safeEvidence('test', run)).resolves.toBeUndefined();
    expect(run).toHaveBeenCalled();
  });
});
