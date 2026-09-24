import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { PapersService } from '../service-papers.js';
import { AssessmentPaper } from '../model.js';
import { PaperModeration } from '../../TeacherWorkbench/model.assessment.js';
// Side-effect imports to register models referenced by populate().
import '../../Academic/model.js';
import '../../Auth/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('PapersService.listPapers', () => {
  it("shows each paper's moderation status and the HOD's comments", async () => {
    const schoolId = oid();
    const teacherId = oid();
    const make = (title: string) => AssessmentPaper.create({
      schoolId, title, subjectId: oid(), gradeId: oid(), topicIds: [oid()], term: 3, year: 2026,
      paperType: 'class_test', duration: 30, totalMarks: 10, createdBy: teacherId,
    });
    const [pending, changes, none] = await Promise.all([make('Pending'), make('Changes'), make('None')]);
    await PaperModeration.create({ paperId: pending._id, schoolId, submittedBy: teacherId, submittedAt: new Date(), status: 'pending' });
    await PaperModeration.create({
      paperId: changes._id, schoolId, submittedBy: teacherId, submittedAt: new Date(),
      status: 'changes_requested', comments: 'Question 3 needs a mark allocation.',
    });

    const { papers } = await PapersService.listPapers(String(schoolId), String(teacherId), 'teacher', { page: 1, limit: 20 });
    const byTitle = new Map(papers.map((p) => [p.title, p]));

    expect(byTitle.get('Pending')?.moderation).toMatchObject({ status: 'pending' });
    expect(byTitle.get('Changes')?.moderation).toMatchObject({ status: 'changes_requested', comments: 'Question 3 needs a mark allocation.' });
    expect(byTitle.get('None')?.moderation).toBeNull();
    expect(String(none._id)).toBeTruthy();
  });
});
