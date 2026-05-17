import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { AssessmentPaper } from '../model.js';
import { PaperSubmission } from '../model-submissions.js';
import '../../Academic/model.js';
import {
  getStudentPaperView,
  startSubmission,
  type StudentPaperView,
} from '../service-submissions-student.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

beforeEach(async () => {
  await Promise.all([
    AssessmentPaper.deleteMany({}),
    PaperSubmission.deleteMany({}),
  ]);
});

function objectId(): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId();
}

function makeStudentContext(overrides: Partial<{
  studentDocId: mongoose.Types.ObjectId;
  studentName: string;
  classId: mongoose.Types.ObjectId | null;
  schoolId: mongoose.Types.ObjectId;
}> = {}) {
  return {
    studentDocId: overrides.studentDocId ?? objectId(),
    studentName: overrides.studentName ?? 'Student One',
    classId: overrides.classId ?? objectId(),
    schoolId: overrides.schoolId ?? objectId(),
  };
}

async function createAssignedPaper(ctx: ReturnType<typeof makeStudentContext>, releaseAt: Date | null) {
  const assignedBy = objectId();
  return AssessmentPaper.create({
    schoolId: ctx.schoolId,
    title: 'Scheduled accounting test',
    subjectId: objectId(),
    gradeId: objectId(),
    topicIds: [objectId()],
    term: 1,
    year: 2026,
    paperType: 'class_test',
    totalMarks: 10,
    duration: 30,
    sections: [{
      title: 'Section A',
      instructions: '',
      order: 0,
      questions: [{
        questionId: null,
        questionText: 'Explain internal controls.',
        options: [],
        marks: 10,
        position: 0,
        modelAnswer: 'Controls protect assets.',
        markingGuideline: 'Award marks for explanation.',
        diagram: null,
      }],
    }],
    instructions: '',
    capsCompliance: null,
    status: 'finalised',
    aiGenerated: false,
    difficulty: 'medium',
    version: 1,
    assignments: [{
      _id: objectId(),
      classId: ctx.classId,
      mode: 'digital',
      releaseAt,
      dueAt: null,
      assignedBy,
      assignedAt: new Date(),
    }],
    createdBy: assignedBy,
    isDeleted: false,
  });
}

describe('student paper release gating', () => {
  it('blocks the paper view and start endpoint before releaseAt', async () => {
    const ctx = makeStudentContext();
    const paper = await createAssignedPaper(ctx, new Date(Date.now() + 60_000));

    await expect(getStudentPaperView(String(paper._id), ctx)).rejects.toThrow(/opens at/i);
    await expect(startSubmission(String(paper._id), ctx)).rejects.toThrow(/opens at/i);
  });

  it('allows students to open and start after releaseAt', async () => {
    const ctx = makeStudentContext();
    const paper = await createAssignedPaper(ctx, new Date(Date.now() - 60_000));

    const view: StudentPaperView = await getStudentPaperView(String(paper._id), ctx);
    expect(view.paperId).toBe(String(paper._id));

    const submission = await startSubmission(String(paper._id), ctx);
    expect(submission.status).toBe('in_progress');
  });
});
