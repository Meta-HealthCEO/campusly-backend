import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { CourseProgressService } from '../service-progress.js';
import { CourseStudentService } from '../service-student.js';
import { Course, CourseLesson, CourseModule, Enrolment } from '../model.js';
import { ContentResource } from '../../ContentLibrary/model.js';
import { Student } from '../../Student/model.js';
import { User } from '../../Auth/model.js';
// Side-effect import: getEnrolment populates subjectId.
import '../../Academic/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

/** A learner enrolled in a unit that's since been archived. */
async function archivedUnit() {
  const schoolId = oid();
  const userId = oid();
  const studentId = oid();
  const teacherId = oid();
  await Student.collection.insertOne({ _id: studentId, schoolId, userId, admissionNumber: `A-${studentId}`, isDeleted: false });
  await User.collection.insertOne({ _id: teacherId, schoolId, firstName: 'T', lastName: 'Eacher', email: `t${oid()}@t.local`, role: 'teacher', isDeleted: false });
  const resource = await ContentResource.collection.insertOne({
    schoolId, title: 'Tens', type: 'study_notes', format: 'static', status: 'approved', isDeleted: false,
    blocks: [{ blockId: 'b1', type: 'text', order: 0, content: 'Ten, twenty.' }],
  });
  const course = await Course.create({ schoolId, title: 'Numbers to 99', slug: `u-${oid()}`, createdBy: teacherId, status: 'archived', kind: 'class_unit' });
  const mod = await CourseModule.create({ schoolId, courseId: course._id, title: 'Counting', orderIndex: 0 });
  const lesson = await CourseLesson.create({ schoolId, courseId: course._id, moduleId: mod._id, orderIndex: 0, title: 'Tens', type: 'content', contentResourceId: resource.insertedId, itemKind: 'notes' });
  const enrolment = await Enrolment.create({ schoolId, courseId: course._id, studentId, enrolledBy: oid() });
  return { schoolId: String(schoolId), userId: String(userId), enrolmentId: String(enrolment._id), lessonId: String(lesson._id) };
}

describe('archived units (A26)', () => {
  it("leave the learner's unit list", async () => {
    const f = await archivedUnit();
    const { enrolments } = await CourseStudentService.listMyEnrolments(f.userId, f.schoolId);
    expect(enrolments).toHaveLength(0);
  });

  it('refuse to open a lesson in an archived unit', async () => {
    const f = await archivedUnit();
    await expect(CourseStudentService.getLessonForStudent(f.enrolmentId, f.lessonId, f.userId, f.schoolId))
      .rejects.toThrow('This unit has been archived.');
  });

  it('refuse to write progress on an archived unit', async () => {
    const f = await archivedUnit();
    await expect(CourseProgressService.writeLessonProgress(f.enrolmentId, f.lessonId, f.userId, f.schoolId, { scrolledToEnd: true }))
      .rejects.toThrow('This unit has been archived.');
  });

  it("refuses a student's view of an archived enrolment, but not the unit's own teacher", async () => {
    const f = await archivedUnit();
    await expect(CourseStudentService.getEnrolment(f.enrolmentId, f.userId, f.schoolId)).rejects.toThrow('Course not found');
  });
});
