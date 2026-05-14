import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import { PaperMarking } from '../model-marking.js';
import { issueMarking } from '../service-marking-queries.js';
import { NotificationService } from '../../Notification/service.js';

vi.mock('../../Notification/service.js', () => ({
  NotificationService: { create: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../../Academic/service-gradebook-publish.js', () => ({
  publishMarkToGradebook: vi.fn().mockResolvedValue(undefined),
  findOrCreateAssessmentForPaper: vi.fn().mockResolvedValue({ _id: new mongoose.Types.ObjectId() }),
}));

// Mock Student.findOne so dispatchIssueNotification gets a userId and proceeds
// to call NotificationService.create (without needing a real Student collection).
vi.mock('../../Student/model.js', () => {
  const { Types } = require('mongoose');
  const userId = new Types.ObjectId();
  return {
    Student: {
      findOne: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue({ userId }),
      }),
    },
  };
});

// Mock AssessmentPaper.findOne so dispatchIssueNotification can resolve the
// paper title without a real QuestionBank collection.
vi.mock('../QuestionBank/model.js', () => ({
  AssessmentPaper: {
    findOne: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({ title: 'Mock Paper' }),
    }),
  },
}));

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test',
    );
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('issueMarking', () => {
  it('first issue sets fields and notifies; re-issue does not re-notify', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();
    const assessmentId = new mongoose.Types.ObjectId();

    const m = await PaperMarking.create({
      schoolId,
      teacherId,
      paperId: new mongoose.Types.ObjectId(),
      paperType: 'generated',
      studentName: 'A',
      studentId,
      imageCount: 0,
      totalMarks: 5,
      maxMarks: 10,
      percentage: 50,
      questions: [
        {
          questionNumber: '1',
          studentAnswer: 'x',
          correctAnswer: 'x',
          marksAwarded: 5,
          maxMarks: 10,
          feedback: '',
        },
      ],
      status: 'completed',
    });

    const notifySpy = vi.mocked(NotificationService.create);
    notifySpy.mockClear();

    await issueMarking(
      String(m._id),
      String(schoolId),
      String(teacherId),
      String(assessmentId),
    );
    // Allow the fire-and-forget microtask to settle
    await new Promise((r) => setTimeout(r, 10));

    const after1 = await PaperMarking.findById(m._id).lean();
    expect(after1?.issuedToStudent).toBe(true);
    expect(after1?.issuedAt).toBeInstanceOf(Date);
    expect(after1?.issuedBy?.toString()).toBe(String(teacherId));
    expect(notifySpy).toHaveBeenCalledTimes(1);

    const firstIssuedAt = after1?.issuedAt as Date;
    notifySpy.mockClear();

    await issueMarking(
      String(m._id),
      String(schoolId),
      String(teacherId),
      String(assessmentId),
    );
    // Allow the fire-and-forget microtask to settle
    await new Promise((r) => setTimeout(r, 10));

    const after2 = await PaperMarking.findById(m._id).lean();
    expect(after2?.issuedAt?.getTime()).toBe(firstIssuedAt.getTime());
    expect(notifySpy).not.toHaveBeenCalled();
  });
});
