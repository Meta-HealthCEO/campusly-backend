import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Student } from '../model.js';
import { User } from '../../Auth/model.js';
import { Class } from '../../Academic/model.js';
import { StudentService } from '../service.js';

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
  await Class.deleteMany({ schoolId: FILE_SCHOOL_ID });
});

async function seedClass() {
  const classId = new mongoose.Types.ObjectId();
  const gradeId = new mongoose.Types.ObjectId();
  await Class.create({
    _id: classId,
    schoolId: FILE_SCHOOL_ID,
    gradeId,
    name: 'Test Class',
    teacherId: new mongoose.Types.ObjectId(),
    capacity: 30,
    classroomCode: `T${classId.toString().slice(-7).toUpperCase()}`,
  });
  return { classId, gradeId };
}

describe('StudentService.create - delivery method branching', () => {
  it('email mode creates user with the provided email and sets mustChangePassword=true', async () => {
    const { classId, gradeId } = await seedClass();
    const result = await StudentService.create({
      schoolId: FILE_SCHOOL_ID.toString(),
      classId: classId.toString(),
      gradeId: gradeId.toString(),
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      deliveryMethod: 'email',
    });

    expect(result.credentials).toBeDefined();
    expect(result.credentials!.loginEmail).toBe('ada@example.com');
    expect(result.credentials!.tempPassword).toMatch(/^Campus-/);

    const user = await User.findOne({ email: 'ada@example.com' });
    expect(user).not.toBeNull();
    expect(user!.mustChangePassword).toBe(true);
    expect(user!.role).toBe('student');
  });

  it('slip mode creates user with a synthetic login email and sets mustChangePassword=true', async () => {
    const { classId, gradeId } = await seedClass();
    const result = await StudentService.create({
      schoolId: FILE_SCHOOL_ID.toString(),
      classId: classId.toString(),
      gradeId: gradeId.toString(),
      firstName: 'Grace',
      lastName: 'Hopper',
      deliveryMethod: 'slip',
    });

    expect(result.credentials).toBeDefined();
    expect(result.credentials!.loginEmail).toMatch(/@students\.campusly\.local$/);
    expect(result.credentials!.loginEmail.toLowerCase()).toContain('grace');
    expect(result.credentials!.emailSent).toBe(false);

    const user = await User.findOne({ email: result.credentials!.loginEmail });
    expect(user).not.toBeNull();
    expect(user!.mustChangePassword).toBe(true);
  });

  it('slip mode sanitises special characters in the name', async () => {
    const { classId, gradeId } = await seedClass();
    const result = await StudentService.create({
      schoolId: FILE_SCHOOL_ID.toString(),
      classId: classId.toString(),
      gradeId: gradeId.toString(),
      firstName: "John O'Brien",
      lastName: 'García-López',
      deliveryMethod: 'slip',
    });

    expect(result.credentials).toBeDefined();
    const localPart = result.credentials!.loginEmail.split('@')[0];
    expect(localPart).toMatch(/^[a-z0-9.-]+$/);
  });

  it('slip mode falls back to admission-only synthetic email for unparseable names', async () => {
    const { classId, gradeId } = await seedClass();
    const result = await StudentService.create({
      schoolId: FILE_SCHOOL_ID.toString(),
      classId: classId.toString(),
      gradeId: gradeId.toString(),
      firstName: '\u674e',
      lastName: '\u660e',
      deliveryMethod: 'slip',
    });

    expect(result.credentials).toBeDefined();
    const localPart = result.credentials!.loginEmail.split('@')[0];
    // After sanitisation the CJK chars become empty - fallback to admission-only
    // (e.g. "s00001" or just the admission number)
    expect(localPart).toMatch(/^s?[0-9]+$/i);
  });
});
