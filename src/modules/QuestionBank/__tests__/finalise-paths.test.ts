import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { finalisePaper } from '../service-papers-pdf-finalise.js';
import { AssessmentPaper } from '../model.js';
import { Assessment } from '../../Academic/model.js';
import { PaperModeration } from '../../TeacherWorkbench/model.assessment.js';
import { ModerationService } from '../../TeacherWorkbench/services/moderation.service.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

async function readyPaper(createdBy: mongoose.Types.ObjectId) {
  const schoolId = oid();
  const paper = await AssessmentPaper.create({
    schoolId, title: `Term 3 test ${oid().toString().slice(-4)}`, subjectId: oid(), gradeId: oid(), topicIds: [oid()],
    term: 3, year: 2026, paperType: 'class_test', duration: 30, totalMarks: 5, createdBy,
    sections: [{ title: 'A', instructions: 'Answer all.', order: 0, questions: [{ questionText: 'What is 2 + 3?', marks: 5, position: 0, modelAnswer: '5' }] }],
  });
  return { schoolId: String(schoolId), paperId: String(paper._id) };
}

describe('finalising a paper', () => {
  it('lets an independent teacher finalise directly (there is no one to moderate)', async () => {
    const teacherId = oid();
    const { schoolId, paperId } = await readyPaper(teacherId);

    const paper = await finalisePaper(paperId, schoolId, String(teacherId), 'teacher', false, true);

    expect(paper.status).toBe('finalised');
    expect(await Assessment.exists({ paperId, isDeleted: false })).toBeTruthy();
  });

  it('tells a school teacher to submit for moderation instead', async () => {
    const teacherId = oid();
    const { schoolId, paperId } = await readyPaper(teacherId);

    await expect(finalisePaper(paperId, schoolId, String(teacherId), 'teacher', false, false))
      .rejects.toThrow('Submit this paper for moderation. Your HOD or a school admin finalises it.');
  });

  it('links the gradebook assessment when moderation approves, like an admin finalise', async () => {
    const teacherId = oid();
    const { schoolId, paperId } = await readyPaper(teacherId);
    await PaperModeration.create({ paperId, schoolId, submittedBy: teacherId, submittedAt: new Date(), status: 'pending' });

    await ModerationService.reviewPaper(paperId, String(oid()), 'approved', '', schoolId);

    expect((await AssessmentPaper.findById(paperId).lean())?.status).toBe('finalised');
    expect(await Assessment.exists({ paperId, isDeleted: false })).toBeTruthy();
  });
});
