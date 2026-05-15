import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Student } from '../model.js';

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
      admissionNumber: `A-${Date.now()}`,
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
      admissionNumber: `A-${Date.now() + 1}`,
      subjectClassIds: [subjectId],
    });
    expect(student.subjectClassIds.map(String)).toEqual([String(subjectId)]);
  });
});
