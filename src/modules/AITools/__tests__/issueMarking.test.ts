import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import { PaperMarking } from '../model-marking.js';
import { issueMarking } from '../service-marking-queries.js';
import { NotificationService } from '../../Notification/service.js';
import { findOrCreateAssessmentForPaper } from '../../Academic/service-gradebook-publish.js';
import { Assessment } from '../../Academic/model.js';
import { AssessmentPaper } from '../../QuestionBank/model.js';

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

describe('issueMarking gradebook link', () => {
  const makeMarking = async (over: Record<string, unknown>) => PaperMarking.create({
    schoolId: new mongoose.Types.ObjectId(), teacherId: new mongoose.Types.ObjectId(), paperId: new mongoose.Types.ObjectId(),
    paperType: 'assessment', studentName: 'Lebo', studentId: new mongoose.Types.ObjectId(), classId: new mongoose.Types.ObjectId(),
    imageCount: 0, totalMarks: 7, maxMarks: 10, percentage: 70, status: 'completed',
    questions: [{ questionNumber: '1', studentAnswer: 'x', correctAnswer: 'x', marksAwarded: 7, maxMarks: 10, feedback: '' }],
    ...over,
  });

  it('says which class, subject, term and assessment the mark landed in', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const subjectId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();
    const paper = await AssessmentPaper.create({
      schoolId, title: 'Term 3 test', subjectId, gradeId: new mongoose.Types.ObjectId(), topicIds: [new mongoose.Types.ObjectId()],
      term: 3, year: 2026, paperType: 'class_test', duration: 30, totalMarks: 10, createdBy: new mongoose.Types.ObjectId(),
    });
    const assessmentId = new mongoose.Types.ObjectId();
    vi.mocked(findOrCreateAssessmentForPaper).mockResolvedValueOnce({
      _id: assessmentId, totalMarks: 10, classId: String(classId), subjectId: String(subjectId), term: 3, academicYear: 2026,
    });
    const m = await makeMarking({ schoolId, paperId: paper._id, classId });

    const result = await issueMarking(String(m._id), String(schoolId), String(new mongoose.Types.ObjectId()), undefined);

    expect(result.gradebook).toEqual({
      assessmentId: String(assessmentId), classId: String(classId), subjectId: String(subjectId), term: 3, academicYear: 2026,
    });
  });

  it('links to an assessment the teacher chose', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const assessment = await Assessment.create({
      name: 'Chosen test', subjectId: new mongoose.Types.ObjectId(), classId: new mongoose.Types.ObjectId(), schoolId,
      type: 'test', totalMarks: 10, weight: 1, term: 2, academicYear: 2026, date: new Date(),
    });
    const m = await makeMarking({ schoolId, paperType: 'generated' });

    const result = await issueMarking(String(m._id), String(schoolId), String(new mongoose.Types.ObjectId()), String(assessment._id));

    expect(result.gradebook).toMatchObject({ assessmentId: String(assessment._id), classId: String(assessment.classId), term: 2 });
  });
});
