import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import { PaperMarking } from '../model-marking.js';
import { issueMarking } from '../service-marking-queries.js';
import { Notification } from '../../Notification/model.js';
import { Student } from '../../Student/model.js';

vi.mock('../../Academic/service-gradebook-publish.js', () => ({
  publishMarkToGradebook: vi.fn().mockResolvedValue(undefined),
  findOrCreateAssessmentForPaper: vi.fn().mockResolvedValue({ _id: new mongoose.Types.ObjectId() }),
}));

const schoolId = new mongoose.Types.ObjectId();
const teacherId = new mongoose.Types.ObjectId();
const assessmentId = new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  await Promise.all([
    PaperMarking.deleteMany({ schoolId }),
    Notification.deleteMany({ schoolId }),
    Student.deleteMany({ schoolId }),
  ]);
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

/** A marked script for a learner with a portal account; returns the ids a test needs. */
async function markedScript(): Promise<{ markingId: string; userId: mongoose.Types.ObjectId }> {
  const studentId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();
  await Student.collection.insertOne({ _id: studentId, schoolId, userId, admissionNumber: `N-${studentId}`, isDeleted: false });
  const m = await PaperMarking.create({
    schoolId, teacherId, paperId: new mongoose.Types.ObjectId(), paperType: 'generated',
    studentName: 'Lebo', studentId, imageCount: 0, totalMarks: 7, maxMarks: 10, percentage: 70, status: 'completed',
    questions: [{ questionNumber: '1', studentAnswer: 'x', correctAnswer: 'x', marksAwarded: 7, maxMarks: 10, feedback: '' }],
  });
  return { markingId: String(m._id), userId };
}

const resultNotices = (userId: mongoose.Types.ObjectId): Promise<number> =>
  Notification.countDocuments({ recipientId: userId, 'data.entityType': 'marking_result_issued' });

const issue = (markingId: string) => issueMarking(markingId, String(schoolId), String(teacherId), String(assessmentId));

describe('issueMarking tells the learner once per result', () => {
  it('two issues at the same moment notify once', async () => {
    const { markingId, userId } = await markedScript();

    await Promise.all([issue(markingId), issue(markingId)]);

    await vi.waitFor(async () => expect(await resultNotices(userId)).toBe(1));
    const told = await Notification.findOne({ recipientId: userId, 'data.entityType': 'marking_result_issued' }).lean();
    expect((told?.data as { link?: string }).link).toMatch(/^\/student\/tests\/[a-f0-9]{24}$/);
    await new Promise((r) => setTimeout(r, 50));
    expect(await resultNotices(userId)).toBe(1);
  });

  it('issuing again after the result was taken back does not notify a second time', async () => {
    const { markingId, userId } = await markedScript();
    await issue(markingId);
    await vi.waitFor(async () => expect(await resultNotices(userId)).toBe(1));

    // The demo reseed (and any future "take back") resets the issued flag.
    await PaperMarking.updateOne({ _id: markingId }, { $set: { issuedToStudent: false }, $unset: { issuedAt: '' } });
    await issue(markingId);
    await new Promise((r) => setTimeout(r, 50));

    expect(await resultNotices(userId)).toBe(1);
  });
});
