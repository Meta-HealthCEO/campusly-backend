import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { findOrCreateAssessmentForPaper } from '../service-gradebook-publish.js';
import { AssessmentPaper } from '../../QuestionBank/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('findOrCreateAssessmentForPaper', () => {
  it('gives each class that wrote a paper its own gradebook assessment', async () => {
    const schoolId = oid();
    const subjectId = oid();
    const paper = await AssessmentPaper.create({
      schoolId, title: `Term 3 test ${oid().toString().slice(-4)}`, subjectId, gradeId: oid(), topicIds: [oid()],
      term: 3, year: 2026, paperType: 'class_test', duration: 30, totalMarks: 30, createdBy: oid(),
    });
    const classA = String(oid());
    const classB = String(oid());
    const link = (classId: string) => findOrCreateAssessmentForPaper({
      paperId: String(paper._id), schoolId: String(schoolId), classId, subjectId: String(subjectId),
    });

    const a = await link(classA);
    const b = await link(classB);
    const aAgain = await link(classA);

    expect(String(a._id)).not.toBe(String(b._id));
    expect(String(aAgain._id)).toBe(String(a._id));
    expect(a).toMatchObject({ classId: classA, subjectId: String(subjectId), term: 3, academicYear: 2026 });
    expect(b.classId).toBe(classB);
  });
});
