import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Student } from '../../modules/Student/model.js';
import { User } from '../../modules/Auth/model.js';
import { resolveStudentFromUserId } from '../student-resolver.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

beforeEach(async () => {
  await Student.deleteMany({});
  await User.deleteMany({});
});

describe('resolveStudentFromUserId', () => {
  it('returns the student linked to the user', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    await User.create({
      _id: userId,
      email: 's@test.com',
      firstName: 'Test',
      lastName: 'Student',
      role: 'student',
      schoolId,
      password: 'x',
    });
    const student = await Student.create({
      schoolId,
      userId,
      gradeId: new mongoose.Types.ObjectId(),
      classId: new mongoose.Types.ObjectId(),
      admissionNumber: 'ADM-001',
      enrollmentStatus: 'active',
    });

    const resolved = await resolveStudentFromUserId(userId.toString(), schoolId.toString());
    expect(resolved?._id.toString()).toBe(student._id.toString());
    expect(resolved?.schoolId.toString()).toBe(schoolId.toString());
  });

  it('returns null when no student is linked', async () => {
    const userId = new mongoose.Types.ObjectId();
    const resolved = await resolveStudentFromUserId(
      userId.toString(),
      new mongoose.Types.ObjectId().toString(),
    );
    expect(resolved).toBeNull();
  });

  it('excludes soft-deleted students', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    await Student.create({
      schoolId,
      userId,
      gradeId: new mongoose.Types.ObjectId(),
      classId: new mongoose.Types.ObjectId(),
      admissionNumber: 'ADM-002',
      enrollmentStatus: 'active',
      isDeleted: true,
    });
    const resolved = await resolveStudentFromUserId(userId.toString(), schoolId.toString());
    expect(resolved).toBeNull();
  });

  it('excludes students from another school', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const otherSchoolId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    await Student.create({
      schoolId: otherSchoolId,
      userId,
      gradeId: new mongoose.Types.ObjectId(),
      classId: new mongoose.Types.ObjectId(),
      admissionNumber: 'ADM-003',
      enrollmentStatus: 'active',
    });

    const resolved = await resolveStudentFromUserId(userId.toString(), schoolId.toString());
    expect(resolved).toBeNull();
  });
});
