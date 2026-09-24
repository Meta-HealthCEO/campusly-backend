import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import { RecommendationsService } from '../recommendations.service.js';
import { MasteryService } from '../mastery.service.js';
import { Student } from '../../Student/model.js';
import { AssessmentPaper } from '../../QuestionBank/model-papers.js';
import { PaperMarking } from '../../AITools/model-marking.js';

const DAY = 24 * 60 * 60 * 1000;
const schoolId = new mongoose.Types.ObjectId();
const classId = new mongoose.Types.ObjectId();
const subjectId = new mongoose.Types.ObjectId();
const gradeId = new mongoose.Types.ObjectId();
const teacherId = new mongoose.Types.ObjectId();
const userId = new mongoose.Types.ObjectId();
const studentId = new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
  vi.spyOn(MasteryService, 'getMastery').mockResolvedValue([]);
  await Student.collection.insertOne({
    _id: studentId, schoolId, classId, gradeId, userId, admissionNumber: 'REC-1', isDeleted: false,
  });
});

afterAll(async () => {
  await Promise.all([
    Student.deleteMany({ schoolId }),
    AssessmentPaper.deleteMany({ schoolId }),
    PaperMarking.deleteMany({ schoolId }),
  ]);
  vi.restoreAllMocks();
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

async function makePaper(title: string, releaseAt: Date, dueAt: Date): Promise<mongoose.Types.ObjectId> {
  const paper = await AssessmentPaper.create({
    schoolId, title, subjectId, gradeId,
    topicIds: [new mongoose.Types.ObjectId()],
    term: 3, year: 2026, paperType: 'class_test',
    totalMarks: 10, duration: 30, sections: [], status: 'finalised',
    createdBy: teacherId,
    assignments: [{
      _id: new mongoose.Types.ObjectId(), classId, mode: 'paper',
      releaseAt, dueAt, assignedBy: teacherId, assignedAt: releaseAt,
    }],
  });
  return paper._id as mongoose.Types.ObjectId;
}

describe('RecommendationsService tests coming up', () => {
  it('drops a test the learner has written, flags a missed one as overdue, and keeps one to come', async () => {
    const marked = await makePaper('Marked test', new Date(Date.now() - 4 * DAY), new Date(Date.now() - 2 * DAY));
    await PaperMarking.collection.insertOne({
      schoolId, teacherId, paperId: marked, studentId, classId, paperType: 'assessment',
      studentName: 'Learner', status: 'completed', issuedToStudent: true, isDeleted: false,
    });
    await makePaper('Missed test', new Date(Date.now() - 4 * DAY), new Date(Date.now() - 2 * DAY));
    await makePaper('Coming test', new Date(Date.now() + 2 * DAY), new Date(Date.now() + 3 * DAY));

    const recs = await RecommendationsService.getRecommendations(String(userId), String(schoolId));
    const tests = recs.filter((r) => r.kind === 'test_coming_up');

    expect(tests.map((r) => r.title).sort()).toEqual(['Coming test', 'Missed test']);
    expect(tests.find((r) => r.title === 'Missed test')?.subtitle).toMatch(/overdue/);
    expect(tests.find((r) => r.title === 'Coming test')?.subtitle).toMatch(/in 2 days/);
  });
});
