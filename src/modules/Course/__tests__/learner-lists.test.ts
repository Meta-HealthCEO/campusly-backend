import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { CourseStudentService } from '../service-student.js';
import { Course, Enrolment } from '../model.js';
import { Student } from '../../Student/model.js';
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

async function fixture() {
  const schoolId = oid();
  const userId = oid();
  const studentId = oid();
  await Student.collection.insertOne({ _id: studentId, schoolId, userId, admissionNumber: `A-${studentId}`, isDeleted: false });
  const make = (title: string, extra: Record<string, unknown>) => Course.create({
    schoolId, title, slug: `${title.toLowerCase().replace(/\W+/g, '-')}-${oid()}`, createdBy: oid(), status: 'published', ...extra,
  });
  const catalogue = await make('Study skills', {});
  const unit = await make('Numbers to 99', { kind: 'class_unit', estimatedDurationHours: 0.6 });
  const gone = await make('Old unit', { kind: 'class_unit', isDeleted: true });
  await Enrolment.insertMany([unit, gone].map((c) => ({ schoolId, courseId: c._id, studentId, enrolledBy: oid(), status: 'active', isDeleted: false })));
  return { schoolId: String(schoolId), userId: String(userId), catalogue, unit };
}

describe('learner course lists', () => {
  it('keeps class units out of the school catalogue', async () => {
    const f = await fixture();
    const { courses } = await CourseStudentService.listCatalog(f.schoolId, {});
    expect(courses.map((c) => c.title)).toEqual(['Study skills']);
  });

  it("lists a learner's units with their kind, and drops a deleted one", async () => {
    const f = await fixture();
    const { enrolments } = await CourseStudentService.listMyEnrolments(f.userId, f.schoolId);
    expect(enrolments).toHaveLength(1);
    expect(enrolments[0].courseId).toMatchObject({ title: 'Numbers to 99', kind: 'class_unit', estimatedDurationHours: 0.6 });
  });
});
