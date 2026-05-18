import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Student } from '../model.js';
import { Class, Grade, Subject, Timetable } from '../../Academic/model.js';
import { User } from '../../Auth/model.js';
import { getMyStudentClasses } from '../service-classes.js';

const FILE_SCHOOL_ID = new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test',
    );
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

beforeEach(async () => {
  await Student.deleteMany({ schoolId: FILE_SCHOOL_ID });
});

describe('Student.subjectClassIds', () => {
  it('defaults to an empty array on new students', async () => {
    const student = await Student.create({
      schoolId: FILE_SCHOOL_ID,
      gradeId: new mongoose.Types.ObjectId(),
      classId: new mongoose.Types.ObjectId(),
      admissionNumber: `A-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    expect(Array.isArray(student.subjectClassIds)).toBe(true);
    expect(student.subjectClassIds).toHaveLength(0);
  });

  it('accepts an array of ObjectIds', async () => {
    const subjectId = new mongoose.Types.ObjectId();
    const student = await Student.create({
      schoolId: FILE_SCHOOL_ID,
      gradeId: new mongoose.Types.ObjectId(),
      classId: new mongoose.Types.ObjectId(),
      admissionNumber: `A-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      subjectClassIds: [subjectId],
    });
    expect(student.subjectClassIds.map(String)).toEqual([String(subjectId)]);
  });
});

describe('getMyStudentClasses', () => {
  async function seedTeacher(): Promise<mongoose.Types.ObjectId> {
    const teacher = await User.create({
      email: `t-${Date.now()}-${Math.random()}@test.local`,
      password: 'x',
      firstName: 'Ada',
      lastName: 'Lovelace',
      role: 'teacher',
      schoolId: FILE_SCHOOL_ID,
    });
    return teacher._id as mongoose.Types.ObjectId;
  }

  async function seedGrade(): Promise<mongoose.Types.ObjectId> {
    const grade = await Grade.create({
      name: 'Grade 7',
      schoolId: FILE_SCHOOL_ID,
      orderIndex: 7,
    });
    return grade._id as mongoose.Types.ObjectId;
  }

  async function seedClass(opts: {
    name: string;
    isHomeroom: boolean;
    teacherId: mongoose.Types.ObjectId;
    gradeId: mongoose.Types.ObjectId;
    isDeleted?: boolean;
  }): Promise<mongoose.Types.ObjectId> {
    const cls = await Class.create({
      name: opts.name,
      gradeId: opts.gradeId,
      schoolId: FILE_SCHOOL_ID,
      teacherId: opts.teacherId,
      capacity: 30,
      classroomCode: `C${Date.now()}${Math.floor(Math.random() * 1000)}`,
      isHomeroom: opts.isHomeroom,
      isDeleted: opts.isDeleted ?? false,
    });
    return cls._id as mongoose.Types.ObjectId;
  }

  async function seedSubject(gradeId: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId> {
    const subject = await Subject.create({
      name: 'Mathematics',
      code: `MATH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      schoolId: FILE_SCHOOL_ID,
      gradeIds: [gradeId],
    });
    return subject._id as mongoose.Types.ObjectId;
  }

  beforeEach(async () => {
    await User.deleteMany({ schoolId: FILE_SCHOOL_ID });
    await Grade.deleteMany({ schoolId: FILE_SCHOOL_ID });
    await Class.deleteMany({ schoolId: FILE_SCHOOL_ID });
    await Subject.deleteMany({ schoolId: FILE_SCHOOL_ID });
    await Timetable.deleteMany({ schoolId: FILE_SCHOOL_ID });
  });

  it('returns empty result when no Student profile exists for the user', async () => {
    const userId = new mongoose.Types.ObjectId();
    const result = await getMyStudentClasses(String(userId), String(FILE_SCHOOL_ID));
    expect(result).toEqual({ homeroom: null, subjectClasses: [] });
  });

  it('returns populated homeroom with teacher and grade', async () => {
    const userId = new mongoose.Types.ObjectId();
    const teacherId = await seedTeacher();
    const gradeId = await seedGrade();
    const classId = await seedClass({ name: '7B', isHomeroom: true, teacherId, gradeId });

    await Student.create({
      userId,
      schoolId: FILE_SCHOOL_ID,
      gradeId,
      classId,
      admissionNumber: `A-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });

    const result = await getMyStudentClasses(String(userId), String(FILE_SCHOOL_ID));
    expect(result.homeroom).not.toBeNull();
    expect(result.homeroom?.name).toBe('7B');
    expect(result.homeroom?.isHomeroom).toBe(true);
    expect(result.homeroom?.teacher.firstName).toBe('Ada');
    expect(result.homeroom?.grade.name).toBe('Grade 7');
    expect(result.subjectClasses).toEqual([]);
  });

  it('returns homeroom: null when the homeroom class is soft-deleted', async () => {
    const userId = new mongoose.Types.ObjectId();
    const teacherId = await seedTeacher();
    const gradeId = await seedGrade();
    const classId = await seedClass({
      name: '7B',
      isHomeroom: true,
      teacherId,
      gradeId,
      isDeleted: true,
    });

    await Student.create({
      userId,
      schoolId: FILE_SCHOOL_ID,
      gradeId,
      classId,
      admissionNumber: `A-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });

    const result = await getMyStudentClasses(String(userId), String(FILE_SCHOOL_ID));
    expect(result.homeroom).toBeNull();
    expect(result.subjectClasses).toEqual([]);
  });

  it('returns populated subject classes when student.subjectClassIds is populated', async () => {
    const userId = new mongoose.Types.ObjectId();
    const teacherId = await seedTeacher();
    const gradeId = await seedGrade();
    const homeroomId = await seedClass({ name: '7B', isHomeroom: true, teacherId, gradeId });
    const subjectClassId = await seedClass({ name: 'Maths', isHomeroom: false, teacherId, gradeId });
    const subjectId = await seedSubject(gradeId);

    await Timetable.create({
      schoolId: FILE_SCHOOL_ID,
      classId: subjectClassId,
      subjectId,
      teacherId,
      day: 'monday',
      period: 1,
      startTime: '08:00',
      endTime: '08:30',
    });

    await Student.create({
      userId,
      schoolId: FILE_SCHOOL_ID,
      gradeId,
      classId: homeroomId,
      admissionNumber: `A-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      subjectClassIds: [subjectClassId],
    });

    const result = await getMyStudentClasses(String(userId), String(FILE_SCHOOL_ID));
    expect(result.subjectClasses).toHaveLength(1);
    expect(result.subjectClasses[0]?.name).toBe('Maths');
    expect(result.subjectClasses[0]?.subject?.name).toBe('Mathematics');
  });

  it('scopes the Student lookup by schoolId (no cross-tenant leakage)', async () => {
    const userId = new mongoose.Types.ObjectId();
    const otherSchool = new mongoose.Types.ObjectId();
    const teacherId = await seedTeacher();
    const gradeId = await seedGrade();
    const classId = await seedClass({ name: '7B', isHomeroom: true, teacherId, gradeId });

    // Student belongs to FILE_SCHOOL_ID; the request asks for otherSchool.
    await Student.create({
      userId,
      schoolId: FILE_SCHOOL_ID,
      gradeId,
      classId,
      admissionNumber: `A-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });

    const result = await getMyStudentClasses(String(userId), String(otherSchool));
    expect(result).toEqual({ homeroom: null, subjectClasses: [] });
  });
});
