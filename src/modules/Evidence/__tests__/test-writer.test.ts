// src/modules/Evidence/__tests__/test-writer.test.ts
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../Academic/service-gradebook-publish.js', () => ({
  publishMarkToGradebook: vi.fn().mockResolvedValue(undefined),
  findOrCreateAssessmentForPaper: vi.fn().mockResolvedValue({ _id: new mongoose.Types.ObjectId() }),
}));

import { AnswerEvidence } from '../model.js';
import { PaperMarking } from '../../AITools/model-marking.js';
import { GeneratedPaper } from '../../AITools/model.js';
import { PaperSubmission } from '../../QuestionBank/model-submissions.js';
import { Student } from '../../Student/model.js';
import { issueMarking, updateMarking } from '../../AITools/service-marking-queries.js';
import { markingWritesEvidence, syncMarkingEvidence } from '../writers/test.js';
import { resetGenericTypeCache } from '../taxonomy-generic.js';
import { cleanUpEvidenceFixtures, seedMarkedPaper, seedMarking, type MarkedPaperFixture } from '../../../test-utils/evidence-fixtures.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
let fx: MarkedPaperFixture;
const outsiders: Oid[] = [];
const rowsOf = (recordId: Oid) =>
  AnswerEvidence.find({ schoolId: fx.schoolId, 'source.recordId': recordId }).sort({ 'source.position': 1 }).lean();
const live = (recordId: Oid) => AnswerEvidence.countDocuments({ 'source.recordId': recordId, isDeleted: false });
const sync = (id: Oid) => syncMarkingEvidence(id, fx.schoolId);
const PHOTO = { images: [{ filename: 'p1.jpg', mimeType: 'image/jpeg', sizeBytes: 10, pageNumber: 1 }] };

const ANSWERS = [
  { n: 'Q1.1', answer: 'y = 3x', awarded: 1, max: 2 },
  { n: '1.2.', answer: 'No, it fails the vertical line test', awarded: 3, max: 3 },
  { n: 'Question 2.1', answer: '', awarded: 0, max: 3 },
  { n: '4', answer: 'extra working', awarded: 0, max: 1 },
];

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  fx = await seedMarkedPaper();
});
beforeEach(() => resetGenericTypeCache());
afterAll(async () => {
  await PaperSubmission.deleteMany({ schoolId: fx.schoolId });
  await GeneratedPaper.deleteMany({ schoolId: fx.schoolId });
  await Student.deleteMany({ _id: { $in: outsiders } });
  await cleanUpEvidenceFixtures(fx.schoolId);
  await mongoose.disconnect();
});

describe('syncMarkingEvidence', () => {
  it('writes a provisional row per marked answer with the question’s topic and level', async () => {
    const markingId = await seedMarking(fx, fx.students[0], ANSWERS);
    await sync(markingId);
    const [bank, inline, blank] = await rowsOf(markingId);
    expect(bank).toMatchObject({ questionKey: `q:${String(fx.bankQuestionId)}`, topicFrom: 'question', cognitiveLevel: 'routine', status: 'provisional' });
    expect(String(bank.topicNodeId)).toBe(String(fx.topicId));
    expect(String(bank.subtopicNodeId)).toBe(String(fx.subtopicId));
    expect(bank.diagnosis.state).toBe('pending');
    expect(inline).toMatchObject({ source: expect.objectContaining({ itemKey: '1.2' }), topicFrom: 'paper_question', cognitiveLevel: 'complex' });
    expect(inline.diagnosis.state).toBe('none');
    expect(blank).toMatchObject({ topicFrom: 'none', source: expect.objectContaining({ itemKey: '2.1', channel: 'typed_by_teacher' }) });
    expect(blank.diagnosis.state).toBe('ready');
  });

  it('an unmatched number keeps its row without a topic', async () => {
    const markingId = await seedMarking(fx, fx.students[1], ANSWERS);
    const result = await sync(markingId);
    expect(result?.skipped.unmatched_number).toBe(1);
    const rows = await rowsOf(markingId);
    expect(rows.find((r) => r.source.itemKey === '4')).toMatchObject({ topicFrom: 'none', questionKey: `p:${String(fx.paperId)}:v1:4` });
  });

  it('knows an online script from a photographed one', async () => {
    await PaperSubmission.collection.insertOne({ paperId: fx.paperId, studentId: fx.students[2], schoolId: fx.schoolId, status: 'submitted', answers: [], isDeleted: false });
    const online = await seedMarking(fx, fx.students[2], ANSWERS.slice(0, 1));
    await sync(online);
    expect((await rowsOf(online))[0].source.channel).toBe('online');
    const photo = await seedMarking(fx, fx.students[2], ANSWERS.slice(0, 1), PHOTO);
    await sync(photo);
    expect((await rowsOf(photo))[0]).toMatchObject({ source: expect.objectContaining({ channel: 'photo' }), answer: expect.objectContaining({ kind: 'transcribed' }) });
  });

  it('a newer marking supersedes the older one, never the other way round', async () => {
    const older = await seedMarking(fx, fx.students[0], ANSWERS);
    await sync(older);
    const newer = await seedMarking(fx, fx.students[0], ANSWERS);
    await sync(newer);
    await sync(older); // e.g. the backfill walks the older one later
    expect(await live(older)).toBe(0);
    expect(await live(newer)).toBe(4);
  });

  it('keeps the older rows when writing the newer ones fails', async () => {
    const s = oid();
    const older = await seedMarking(fx, s, ANSWERS);
    await sync(older);
    const newer = await seedMarking(fx, s, ANSWERS);
    const failure = vi.spyOn(AnswerEvidence, 'bulkWrite').mockRejectedValueOnce(new Error('write failed'));
    await expect(sync(newer)).rejects.toThrow('write failed');
    failure.mockRestore();
    expect(await live(older)).toBe(4);
  });

  it('writes nothing for a marking still processing or failed', async () => {
    const failed = await seedMarking(fx, fx.students[1], ANSWERS, { status: 'failed' });
    expect(await sync(failed)).toBeNull();
    expect(await AnswerEvidence.countDocuments({ 'source.recordId': failed })).toBe(0);
  });

  it('a deleted marking takes its rows with it', async () => {
    const id = await seedMarking(fx, oid(), ANSWERS);
    await sync(id);
    await PaperMarking.updateOne({ _id: id }, { $set: { isDeleted: true } });
    expect(await sync(id)).toBeNull();
    const rows = await rowsOf(id);
    expect(rows).toHaveLength(4);
    expect(rows.every((r) => r.isDeleted && r.deletedReason === 'source_deleted')).toBe(true);
  });

  it('reads the marking only inside the given school', async () => {
    const id = await seedMarking(fx, oid(), ANSWERS);
    expect(await syncMarkingEvidence(id, oid())).toBeNull();
    expect(await AnswerEvidence.countDocuments({ 'source.recordId': id })).toBe(0);
  });

  it('a legacy generated paper writes rows with no topic, keyed g:<paper>:<number>', async () => {
    const paperId = oid();
    await GeneratedPaper.collection.insertOne({ _id: paperId, schoolId: fx.schoolId, subject: 'Mathematics', grade: 10, topic: 'Algebra', totalMarks: 4, isDeleted: false,
      sections: [{ title: 'A', questions: [{ questionNumber: 1, questionText: 'Solve 2x = 4', modelAnswer: 'x = 2', markingGuideline: '', marks: 4 }] }] });
    const m = await PaperMarking.create({ paperId, paperType: 'generated', studentId: fx.students[1], studentName: 'Learner', teacherId: fx.teacherId,
      schoolId: fx.schoolId, totalMarks: 1, maxMarks: 4, percentage: 25, status: 'completed', paperVersion: 1, images: [],
      questions: [{ questionNumber: '1', studentAnswer: 'x = 4', correctAnswer: 'x = 2', marksAwarded: 1, maxMarks: 4, feedback: '' }] });
    await sync(m._id as Oid);
    expect(await AnswerEvidence.findOne({ 'source.recordId': m._id }).lean()).toMatchObject({
      questionKey: `g:${String(paperId)}:1`, topicFrom: 'none', diagnosis: expect.objectContaining({ state: 'skipped', skippedReason: 'no_topic' }),
    });
  });
});

describe('a photo of the wrong paper', () => {
  it('is not evidence while it waits for the teacher', () => {
    expect(markingWritesEvidence({ status: 'needs_review', paperMismatch: true, isDeleted: false })).toBe(false);
    expect(markingWritesEvidence({ status: 'needs_review', paperMismatch: false, isDeleted: false })).toBe(true);
    expect(markingWritesEvidence({ status: 'completed', paperMismatch: true, isDeleted: false })).toBe(true);
  });

  it('writes nothing until the teacher accepts it, then writes normally', async () => {
    const id = await seedMarking(fx, oid(), ANSWERS);
    await sync(id);
    await PaperMarking.updateOne({ _id: id }, { $set: { status: 'needs_review', paperMismatch: true } });
    expect(await sync(id)).toBeNull();
    expect(await live(id)).toBe(0);
    await updateMarking(String(id), String(fx.schoolId), { status: 'completed' });
    expect(await live(id)).toBe(4);
  });

  it("never supersedes the learner's good script", async () => {
    const s = oid();
    const good = await seedMarking(fx, s, ANSWERS);
    await sync(good);
    const wrong = await seedMarking(fx, s, ANSWERS, { ...PHOTO, status: 'needs_review', paperMismatch: true });
    await sync(wrong);
    await sync(good);
    expect(await live(good)).toBe(4);
    expect(await live(wrong)).toBe(0);
  });
});

describe('the marking hooks', () => {
  it('updateMarking resets only the changed row', async () => {
    const markingId = await seedMarking(fx, oid(), ANSWERS);
    await sync(markingId);
    const first = (await rowsOf(markingId))[0];
    await AnswerEvidence.updateOne({ _id: first._id }, { $set: { 'diagnosis.state': 'dismissed' } });

    await updateMarking(String(markingId), String(fx.schoolId), { questions: [{ questionNumber: '4', marksAwarded: 1, maxMarks: 1 }] });

    const rows = await rowsOf(markingId);
    expect(rows[0].diagnosis.state).toBe('dismissed');
    expect(rows.find((r) => r.source.itemKey === '4')).toMatchObject({ marksAwarded: 1, markedBy: 'teacher', diagnosis: expect.objectContaining({ state: 'none' }) });
    const again = await sync(markingId);
    expect(again).toMatchObject({ written: 0, updated: 0, unchanged: 4 });
  });

  it('updateMarking still saves the marks when writing evidence fails', async () => {
    const markingId = await seedMarking(fx, oid(), ANSWERS);
    const failure = vi.spyOn(AnswerEvidence, 'bulkWrite').mockRejectedValueOnce(new Error('write failed'));
    const saved = await updateMarking(String(markingId), String(fx.schoolId), { questions: [{ questionNumber: '4', marksAwarded: 1, maxMarks: 1 }] });
    failure.mockRestore();
    expect(saved.totalMarks).toBe(5);
    expect((await PaperMarking.findById(markingId).lean())!.totalMarks).toBe(5);
  });

  it('issue turns the rows final, dated when issued', async () => {
    const markingId = await seedMarking(fx, oid(), ANSWERS);
    await sync(markingId);
    await issueMarking(String(markingId), String(fx.schoolId), String(fx.teacherId), String(oid()));
    const issued = await PaperMarking.findById(markingId).lean();
    const rows = await rowsOf(markingId);
    expect(rows.every((r) => r.status === 'final')).toBe(true);
    expect(rows[0].finalAt?.getTime()).toBe(issued!.issuedAt!.getTime());
  });

  it('an issued re-mark with no stored learner replaces the auto-marked script', async () => {
    const s = oid();
    const online = await seedMarking(fx, s, ANSWERS);
    await sync(online);
    const photo = await seedMarking(fx, s, ANSWERS.slice(0, 2), { ...PHOTO, studentId: undefined });
    expect(await sync(photo)).toBeNull(); // no learner picked yet

    await issueMarking(String(photo), String(fx.schoolId), String(fx.teacherId), String(oid()), String(s));

    const rows = await rowsOf(photo);
    expect(rows.filter((r) => !r.isDeleted)).toHaveLength(2);
    expect(rows.every((r) => r.status === 'final' && String(r.studentId) === String(s))).toBe(true);
    expect(await live(online)).toBe(0);
    await sync(online); // the backfill walks the older one later
    expect(await live(photo)).toBe(2);
    expect(await live(online)).toBe(0);
  });

  it('issue never writes a learner from another school', async () => {
    const outsider = oid();
    outsiders.push(outsider);
    await Student.collection.insertOne({ _id: outsider, schoolId: oid(), classId: oid(), gradeId: oid(), admissionNumber: `E-X-${String(outsider)}`, isDeleted: false });
    const id = await seedMarking(fx, oid(), ANSWERS, { studentId: undefined });
    await issueMarking(String(id), String(fx.schoolId), String(fx.teacherId), String(oid()), String(outsider));
    expect(await AnswerEvidence.countDocuments({ 'source.recordId': id })).toBe(0);
  });
});
