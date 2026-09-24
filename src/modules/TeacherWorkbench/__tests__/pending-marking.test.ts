import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { AggregationService } from '../services/aggregation.service.js';
import { AssessmentPaper } from '../../QuestionBank/model.js';
import { PaperMarking } from '../../AITools/model-marking.js';
import { Homework, HomeworkSubmission } from '../../Homework/model.js';
import { Class, Subject } from '../../Academic/model.js';
import { Student } from '../../Student/model.js';
// Side-effect imports to register models referenced by populate().
import '../../Auth/model.js';

const oid = () => new mongoose.Types.ObjectId();
const DAY = 24 * 60 * 60 * 1000;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

async function fixture() {
  const schoolId = oid();
  const teacherId = oid();
  const otherTeacherId = oid();
  const gradeId = oid();
  const subject = await Subject.create({ schoolId, name: `Maths ${oid().toString().slice(-4)}`, code: oid().toString().slice(-6).toUpperCase() });
  const cls = await Class.create({
    schoolId, teacherId, gradeId, name: `Grade 1 - A ${oid().toString().slice(-4)}`, capacity: 30,
    classroomCode: oid().toString().slice(-8).toUpperCase(),
  });
  const [a, b] = await Promise.all([0, 1].map(() => Student.create({
    schoolId, classId: cls._id, gradeId, admissionNumber: oid().toString().slice(-10), enrollmentStatus: 'active',
  })));
  const yesterday = new Date(Date.now() - DAY);
  const paperFields = {
    schoolId, subjectId: subject._id, gradeId, topicIds: [oid()], term: 3, year: 2026,
    paperType: 'class_test', duration: 30, totalMarks: 30,
  };
  const paper = await AssessmentPaper.create({
    ...paperFields, title: 'Term 3 maths test', createdBy: teacherId,
    assignments: [{ classId: cls._id, mode: 'paper', dueAt: yesterday, releaseAt: yesterday, assignedBy: teacherId, assignedAt: yesterday }],
  });
  await AssessmentPaper.create({
    ...paperFields, title: 'Someone else\'s test', createdBy: otherTeacherId,
    assignments: [{ classId: cls._id, mode: 'paper', dueAt: yesterday, releaseAt: yesterday, assignedBy: otherTeacherId, assignedAt: yesterday }],
  });
  await PaperMarking.create({
    schoolId, teacherId, paperId: paper._id, paperType: 'assessment', studentName: 'A', studentId: a._id,
    classId: cls._id, imageCount: 0, totalMarks: 20, maxMarks: 30, percentage: 66.7, status: 'published',
    questions: [{ questionNumber: '1', studentAnswer: 'x', correctAnswer: 'x', marksAwarded: 20, maxMarks: 30, feedback: '' }],
  });
  const homework = await Homework.create({
    schoolId, teacherId, classId: cls._id, subjectId: subject._id, title: 'Count and colour to 20', type: 'exercise',
    exerciseQuestionIds: [oid()], dueDate: new Date(Date.now() + 2 * DAY), totalMarks: 10, status: 'assigned',
    attachments: [], latePolicy: 'block', gradebookAutoPublish: false,
  });
  const submission = { homeworkId: homework._id, schoolId, homeworkVersion: 1, submittedAt: new Date(), maxMarks: 10 };
  await HomeworkSubmission.create({ ...submission, studentId: a._id, mark: 5, gradingStatus: 'graded' });
  await HomeworkSubmission.create({ ...submission, studentId: b._id });
  return { schoolId, teacherId, classId: String(cls._id), paperId: String(paper._id), homeworkId: String(homework._id) };
}

describe('AggregationService.getPendingMarking', () => {
  it('lists written test papers beside homework, with real totals and links', async () => {
    const f = await fixture();
    const items = await AggregationService.getPendingMarking(String(f.teacherId), String(f.schoolId));

    const paper = items.find((i) => i.type === 'paper');
    expect(paper).toMatchObject({
      paperId: f.paperId, classId: f.classId, pendingCount: 1, totalCount: 2, title: 'Term 3 maths test',
      href: `/teacher/papers/${f.paperId}?tab=marking&classId=${f.classId}`,
    });

    const homework = items.find((i) => i.type === 'homework');
    expect(homework).toMatchObject({
      id: f.homeworkId, classId: f.classId, pendingCount: 1, totalCount: 2, href: `/teacher/homework/${f.homeworkId}`,
    });

    expect(items.filter((i) => i.type === 'paper')).toHaveLength(1);
  });
});
