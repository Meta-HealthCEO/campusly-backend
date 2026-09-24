import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { CourseProgressService } from '../service-progress.js';
import { CourseStudentService } from '../service-student.js';
import { Course, CourseLesson, CourseModule, Enrolment, LessonProgress } from '../model.js';
import { ContentResource } from '../../ContentLibrary/model.js';
import { Student } from '../../Student/model.js';
// Side-effect imports: completing a unit touches certificates, which populate users and schools.
import '../../Auth/model.js';
import '../../School/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

/** A learner enrolled in a unit whose first item is a worked example (step-reveal steps only). */
async function workedExample() {
  const schoolId = oid();
  const userId = oid();
  const studentId = oid();
  await Student.collection.insertOne({ _id: studentId, schoolId, userId, admissionNumber: `A-${studentId}`, isDeleted: false });
  const resource = await ContentResource.collection.insertOne({
    schoolId, title: 'Counting on from 47', type: 'worked_example', format: 'static', status: 'approved', isDeleted: false,
    blocks: [{ blockId: 'b1', type: 'step_reveal', order: 0, content: JSON.stringify({ steps: [{ title: 'Start', content: '47' }] }) }],
  });
  const course = await Course.create({ schoolId, title: 'Numbers to 99', slug: `u-${oid()}`, createdBy: oid(), status: 'published', kind: 'class_unit' });
  const mod = await CourseModule.create({ schoolId, courseId: course._id, title: 'Counting', orderIndex: 0 });
  const lesson = await CourseLesson.create({ schoolId, courseId: course._id, moduleId: mod._id, orderIndex: 0, title: 'Counting on from 47', type: 'content', contentResourceId: resource.insertedId, itemKind: 'worked_example' });
  const enrolment = await Enrolment.create({ schoolId, courseId: course._id, studentId, enrolledBy: oid() });
  return { schoolId: String(schoolId), userId: String(userId), enrolmentId: String(enrolment._id), lessonId: String(lesson._id), enrolment, lesson };
}

describe('worked example progress', () => {
  it('counts a worked example as done once the learner reads to the end', async () => {
    const f = await workedExample();
    const res = await CourseProgressService.writeLessonProgress(f.enrolmentId, f.lessonId, f.userId, f.schoolId, { interactionsDone: 0, scrolledToEnd: true });
    expect(res.lessonStatus).toBe('completed');
  });

  it('frees a learner stuck on a worked example from before this fix', async () => {
    const f = await workedExample();
    await LessonProgress.create({
      enrolmentId: f.enrolment._id, studentId: f.enrolment.studentId, courseId: f.enrolment.courseId, lessonId: f.lesson._id,
      schoolId: f.enrolment.schoolId, status: 'in_progress', interactionsDone: 0, interactionsTotal: 1, scrolledToEnd: true,
    });
    const res = await CourseProgressService.writeLessonProgress(f.enrolmentId, f.lessonId, f.userId, f.schoolId, { interactionsDone: 0, scrolledToEnd: true });
    expect(res.lessonStatus).toBe('completed');
  });

  it('lets a learner who finished the unit go back over its items', async () => {
    const f = await workedExample();
    await CourseProgressService.writeLessonProgress(f.enrolmentId, f.lessonId, f.userId, f.schoolId, { scrolledToEnd: true });
    expect((await Enrolment.findById(f.enrolmentId).lean())?.status).toBe('completed');

    const again = await CourseStudentService.getLessonForStudent(f.enrolmentId, f.lessonId, f.userId, f.schoolId);
    expect(again.source.kind).toBe('content');
    const write = await CourseProgressService.writeLessonProgress(f.enrolmentId, f.lessonId, f.userId, f.schoolId, { scrolledToEnd: true });
    expect(write.lessonStatus).toBe('completed');
  });
});

describe('optional items', () => {
  it('a learner finishes the unit without the optional revision item', async () => {
    const f = await workedExample();
    await CourseLesson.create({
      schoolId: f.lesson.schoolId, courseId: f.lesson.courseId, moduleId: f.lesson.moduleId, orderIndex: 1,
      title: 'Revision: counting', type: 'content', itemKind: 'notes', optional: true,
    });
    await CourseProgressService.writeLessonProgress(f.enrolmentId, f.lessonId, f.userId, f.schoolId, { scrolledToEnd: true });
    const enrolment = await Enrolment.findById(f.enrolmentId).lean();
    expect(enrolment).toMatchObject({ progressPercent: 100, status: 'completed' });
  });
});
