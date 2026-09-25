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
import { issueMarking, updateMarking } from '../../AITools/service-marking-queries.js';
import { syncMarkingEvidence } from '../writers/test.js';
import { resetGenericTypeCache } from '../taxonomy-generic.js';
import { cleanUpEvidenceFixtures, seedMarkedPaper, seedMarking, type MarkedPaperFixture } from '../../../test-utils/evidence-fixtures.js';

let fx: MarkedPaperFixture;
const rowsOf = (recordId: mongoose.Types.ObjectId) =>
  AnswerEvidence.find({ schoolId: fx.schoolId, 'source.recordId': recordId }).sort({ 'source.position': 1 }).lean();

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
  await cleanUpEvidenceFixtures(fx.schoolId);
  await mongoose.disconnect();
});

describe('syncMarkingEvidence', () => {
  it('writes a provisional row per marked answer with the question’s topic and level', async () => {
    const markingId = await seedMarking(fx, fx.students[0], ANSWERS);
    await syncMarkingEvidence(markingId);
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
    const result = await syncMarkingEvidence(markingId);
    expect(result?.skipped.unmatched_number).toBe(1);
    const rows = await rowsOf(markingId);
    expect(rows.find((r) => r.source.itemKey === '4')).toMatchObject({ topicFrom: 'none', questionKey: `p:${String(fx.paperId)}:v1:4` });
  });

  it('knows an online script from a photographed one', async () => {
    await PaperSubmission.collection.insertOne({ paperId: fx.paperId, studentId: fx.students[2], schoolId: fx.schoolId, status: 'submitted', answers: [], isDeleted: false });
    const online = await seedMarking(fx, fx.students[2], ANSWERS.slice(0, 1));
    await syncMarkingEvidence(online);
    expect((await rowsOf(online))[0].source.channel).toBe('online');
    const photo = await seedMarking(fx, fx.students[2], ANSWERS.slice(0, 1), { images: [{ filename: 'p1.jpg', mimeType: 'image/jpeg', sizeBytes: 10, pageNumber: 1 }] });
    await syncMarkingEvidence(photo);
    expect((await rowsOf(photo))[0]).toMatchObject({ source: expect.objectContaining({ channel: 'photo' }), answer: expect.objectContaining({ kind: 'transcribed' }) });
  });

  it('a newer marking supersedes the older one, never the other way round', async () => {
    const older = await seedMarking(fx, fx.students[0], ANSWERS);
    await syncMarkingEvidence(older);
    const newer = await seedMarking(fx, fx.students[0], ANSWERS);
    await syncMarkingEvidence(newer);
    await syncMarkingEvidence(older); // e.g. the backfill walks the older one later
    expect(await AnswerEvidence.countDocuments({ 'source.recordId': older, isDeleted: false })).toBe(0);
    expect(await AnswerEvidence.countDocuments({ 'source.recordId': newer, isDeleted: false })).toBe(4);
  });

  it('writes nothing for a marking still processing or failed', async () => {
    const failed = await seedMarking(fx, fx.students[1], ANSWERS, { status: 'failed' });
    expect(await syncMarkingEvidence(failed)).toBeNull();
    expect(await AnswerEvidence.countDocuments({ 'source.recordId': failed })).toBe(0);
  });

  it('a legacy generated paper writes rows with no topic, keyed g:<paper>:<number>', async () => {
    const paperId = new mongoose.Types.ObjectId();
    await GeneratedPaper.collection.insertOne({ _id: paperId, schoolId: fx.schoolId, subject: 'Mathematics', grade: 10, topic: 'Algebra', totalMarks: 4, isDeleted: false,
      sections: [{ title: 'A', questions: [{ questionNumber: 1, questionText: 'Solve 2x = 4', modelAnswer: 'x = 2', markingGuideline: '', marks: 4 }] }] });
    const m = await PaperMarking.create({ paperId, paperType: 'generated', studentId: fx.students[1], studentName: 'Learner', teacherId: fx.teacherId,
      schoolId: fx.schoolId, totalMarks: 1, maxMarks: 4, percentage: 25, status: 'completed', paperVersion: 1, images: [],
      questions: [{ questionNumber: '1', studentAnswer: 'x = 4', correctAnswer: 'x = 2', marksAwarded: 1, maxMarks: 4, feedback: '' }] });
    await syncMarkingEvidence(m._id);
    expect(await AnswerEvidence.findOne({ 'source.recordId': m._id }).lean()).toMatchObject({
      questionKey: `g:${String(paperId)}:1`, topicFrom: 'none', diagnosis: expect.objectContaining({ state: 'skipped', skippedReason: 'no_topic' }),
    });
  });
});

describe('the marking hooks', () => {
  it('updateMarking resets only the changed row', async () => {
    const student = new mongoose.Types.ObjectId();
    const markingId = await seedMarking(fx, student, ANSWERS);
    await syncMarkingEvidence(markingId);
    const first = (await rowsOf(markingId))[0];
    await AnswerEvidence.updateOne({ _id: first._id }, { $set: { 'diagnosis.state': 'dismissed' } });

    await updateMarking(String(markingId), String(fx.schoolId), { questions: [{ questionNumber: '4', marksAwarded: 1, maxMarks: 1 }] });

    const rows = await rowsOf(markingId);
    expect(rows[0].diagnosis.state).toBe('dismissed');
    expect(rows.find((r) => r.source.itemKey === '4')).toMatchObject({ marksAwarded: 1, markedBy: 'teacher', diagnosis: expect.objectContaining({ state: 'none' }) });
    const again = await syncMarkingEvidence(markingId);
    expect(again).toMatchObject({ written: 0, updated: 0, unchanged: 4 });
  });

  it('issue turns the rows final, dated when issued', async () => {
    const student = new mongoose.Types.ObjectId();
    const markingId = await seedMarking(fx, student, ANSWERS);
    await syncMarkingEvidence(markingId);
    await issueMarking(String(markingId), String(fx.schoolId), String(fx.teacherId), String(new mongoose.Types.ObjectId()));
    const issued = await PaperMarking.findById(markingId).lean();
    const rows = await rowsOf(markingId);
    expect(rows.every((r) => r.status === 'final')).toBe(true);
    expect(rows[0].finalAt?.getTime()).toBe(issued!.issuedAt!.getTime());
  });
});
