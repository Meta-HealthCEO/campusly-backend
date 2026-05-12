import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Lesson } from '../model.js';
import { Student } from '../../Student/model.js';
import { listLessonsForStudent, getLessonForStudent } from '../service-student.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});
beforeEach(async () => {
  await Lesson.deleteMany({});
  await Student.deleteMany({});
});

async function seed() {
  const schoolId = new mongoose.Types.ObjectId();
  const classId = new mongoose.Types.ObjectId();
  const subjectId = new mongoose.Types.ObjectId();
  const teacherId = new mongoose.Types.ObjectId();
  const studentId = new mongoose.Types.ObjectId();
  await Student.create({
    _id: studentId, schoolId, classId,
    gradeId: new mongoose.Types.ObjectId(),
    admissionNumber: 'ADM-1', enrollmentStatus: 'active',
  });
  return { schoolId, classId, subjectId, teacherId, studentId };
}

describe('listLessonsForStudent', () => {
  it('returns only ready/taught lessons assigned to the student class', async () => {
    const { schoolId, classId, subjectId, teacherId, studentId } = await seed();
    await Lesson.create({
      schoolId, teacherId, subjectId,
      curriculumNodeId: new mongoose.Types.ObjectId(),
      title: 'Visible lesson', durationMinutes: 30,
      status: 'ready',
      assignedClasses: [{ classId, scheduledDate: new Date(), status: 'planned' }],
    });
    await Lesson.create({
      schoolId, teacherId, subjectId,
      curriculumNodeId: new mongoose.Types.ObjectId(),
      title: 'Draft lesson', durationMinutes: 30,
      status: 'draft',
      assignedClasses: [{ classId, scheduledDate: new Date(), status: 'planned' }],
    });
    await Lesson.create({
      schoolId, teacherId, subjectId,
      curriculumNodeId: new mongoose.Types.ObjectId(),
      title: 'Wrong class', durationMinutes: 30,
      status: 'ready',
      assignedClasses: [{ classId: new mongoose.Types.ObjectId(), scheduledDate: new Date(), status: 'planned' }],
    });

    const student = await Student.findById(studentId);
    if (!student) throw new Error('seed failed');

    const result = await listLessonsForStudent(student, {});
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Visible lesson');
  });

  it('isolates lessons across schools (multi-tenancy)', async () => {
    const { classId, teacherId } = await seed();
    const otherSchoolId = new mongoose.Types.ObjectId();
    await Lesson.create({
      schoolId: otherSchoolId, teacherId,
      curriculumNodeId: new mongoose.Types.ObjectId(),
      title: 'Other school lesson', durationMinutes: 30,
      status: 'ready',
      assignedClasses: [{ classId, scheduledDate: new Date(), status: 'planned' }],
    });

    const myStudent = await Student.findOne({ admissionNumber: 'ADM-1' });
    if (!myStudent) throw new Error('seed failed');
    const result = await listLessonsForStudent(myStudent, {});
    expect(result).toHaveLength(0);
  });

  it('filters by subjectId when provided', async () => {
    const { schoolId, classId, subjectId, teacherId, studentId } = await seed();
    await Lesson.create({
      schoolId, teacherId, subjectId,
      curriculumNodeId: new mongoose.Types.ObjectId(),
      title: 'Match', durationMinutes: 30, status: 'ready',
      assignedClasses: [{ classId, scheduledDate: new Date(), status: 'planned' }],
    });
    await Lesson.create({
      schoolId, teacherId,
      subjectId: new mongoose.Types.ObjectId(),
      curriculumNodeId: new mongoose.Types.ObjectId(),
      title: 'Different subject', durationMinutes: 30, status: 'ready',
      assignedClasses: [{ classId, scheduledDate: new Date(), status: 'planned' }],
    });

    const student = await Student.findById(studentId);
    if (!student) throw new Error('seed failed');
    const result = await listLessonsForStudent(student, { subjectId: subjectId.toString() });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Match');
  });
});

describe('getLessonForStudent', () => {
  it('returns lesson detail with materials populated', async () => {
    const { schoolId, classId, subjectId, teacherId, studentId } = await seed();
    const lesson = await Lesson.create({
      schoolId, teacherId, subjectId,
      curriculumNodeId: new mongoose.Types.ObjectId(),
      title: 'Detailed lesson',
      objectives: ['Learn X', 'Learn Y'],
      durationMinutes: 45,
      status: 'ready',
      materials: [{ kind: 'reading', title: 'Read this' }],
      assignedClasses: [{ classId, scheduledDate: new Date(), status: 'planned' }],
    });

    const student = await Student.findById(studentId);
    if (!student) throw new Error('seed failed');
    const result = await getLessonForStudent(student, lesson._id.toString());
    expect(result).not.toBeNull();
    expect(result?.objectives).toEqual(['Learn X', 'Learn Y']);
    expect(result?.materials).toHaveLength(1);
    expect(result?.materials[0]?.kind).toBe('reading');
    expect(result?.materials[0]?.title).toBe('Read this');
  });

  it('returns null when lesson is from another school (multi-tenancy)', async () => {
    const { classId, teacherId, studentId } = await seed();
    const otherSchoolId = new mongoose.Types.ObjectId();
    const lesson = await Lesson.create({
      schoolId: otherSchoolId, teacherId,
      curriculumNodeId: new mongoose.Types.ObjectId(),
      title: 'Other school', durationMinutes: 30, status: 'ready',
      assignedClasses: [{ classId, scheduledDate: new Date(), status: 'planned' }],
    });
    const student = await Student.findById(studentId);
    if (!student) throw new Error('seed failed');
    const result = await getLessonForStudent(student, lesson._id.toString());
    expect(result).toBeNull();
  });

  it('returns null when lesson is not assigned to the student class', async () => {
    const { schoolId, teacherId, studentId } = await seed();
    const lesson = await Lesson.create({
      schoolId, teacherId,
      curriculumNodeId: new mongoose.Types.ObjectId(),
      title: 'Wrong class', durationMinutes: 30, status: 'ready',
      assignedClasses: [{ classId: new mongoose.Types.ObjectId(), scheduledDate: new Date(), status: 'planned' }],
    });
    const student = await Student.findById(studentId);
    if (!student) throw new Error('seed failed');
    const result = await getLessonForStudent(student, lesson._id.toString());
    expect(result).toBeNull();
  });
});
