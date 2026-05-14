import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Student } from '../model.js';
import { User } from '../../Auth/model.js';
import { StudentService } from '../service.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';

const FILE_SCHOOL_ID = new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});
beforeEach(async () => {
  await Student.deleteMany({ schoolId: FILE_SCHOOL_ID });
  await User.deleteMany({ schoolId: FILE_SCHOOL_ID });
  // Some delivery-method tests leave a `grace.hopper...@students.campusly.local`
  // user in a sibling schoolId. The global unique-email index means we can't
  // re-create that synthetic email without first clearing it.
  await User.deleteMany({ email: /@students\.campusly\.local$/ });
});

async function seedStudentWithUser(opts: { email: string }) {
  const userId = new mongoose.Types.ObjectId();
  await User.create({
    _id: userId,
    email: opts.email,
    firstName: 'Test',
    lastName: 'Student',
    role: 'student',
    schoolId: FILE_SCHOOL_ID,
    password: 'OriginalPass1',
    mustChangePassword: false,
  });
  const student = await Student.create({
    schoolId: FILE_SCHOOL_ID,
    userId,
    classId: new mongoose.Types.ObjectId(),
    gradeId: new mongoose.Types.ObjectId(),
    admissionNumber: `ADM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    enrollmentStatus: 'active',
  });
  return { student, userId };
}

describe('StudentService.regenerateCredentials', () => {
  it('generates a new temp password, sets mustChangePassword=true, and invalidates old password', async () => {
    const { student, userId } = await seedStudentWithUser({ email: 'real@test.com' });

    const result = await StudentService.regenerateCredentials(
      student._id.toString(),
      FILE_SCHOOL_ID.toString(),
    );

    expect(result.credentials.tempPassword).toMatch(/^Campus-/);
    expect(result.credentials.loginEmail).toBe('real@test.com');

    const user = await User.findById(userId).select('+password');
    expect(user!.mustChangePassword).toBe(true);

    const oldStillWorks = await bcrypt.compare('OriginalPass1', user!.password);
    expect(oldStillWorks).toBe(false);

    const newWorks = await bcrypt.compare(result.credentials.tempPassword, user!.password);
    expect(newWorks).toBe(true);
  });

  it('throws NotFoundError when student is from a different school', async () => {
    const { student } = await seedStudentWithUser({ email: 'a@test.com' });
    const otherSchoolId = new mongoose.Types.ObjectId();
    await expect(
      StudentService.regenerateCredentials(student._id.toString(), otherSchoolId.toString()),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws BadRequestError when student has no linked User', async () => {
    const student = await Student.create({
      schoolId: FILE_SCHOOL_ID,
      classId: new mongoose.Types.ObjectId(),
      gradeId: new mongoose.Types.ObjectId(),
      admissionNumber: `ADM-${Date.now()}-orphan`,
      enrollmentStatus: 'active',
    });
    await expect(
      StudentService.regenerateCredentials(student._id.toString(), FILE_SCHOOL_ID.toString()),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('marks emailSent=false when loginEmail is synthetic', async () => {
    const { student } = await seedStudentWithUser({ email: 'grace.hopper.adm@students.campusly.local' });
    const result = await StudentService.regenerateCredentials(
      student._id.toString(),
      FILE_SCHOOL_ID.toString(),
    );
    expect(result.credentials.emailSent).toBe(false);
  });
});
