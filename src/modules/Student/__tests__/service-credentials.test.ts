import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Student } from '../model.js';
import { StudentService } from '../service.js';
import { StudentInviteService } from '../invite.service.js';
import { User } from '../../Auth/model.js';
import { AuthService } from '../../Auth/service.js';
import { Class } from '../../Academic/model.js';

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
  await Class.deleteMany({});
});

describe('student portal credentials', () => {
  it('returns one-time login credentials when creating a student user', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const result = await StudentService.create({
      firstName: 'Test',
      lastName: 'Learner',
      email: 'learner@example.com',
      schoolId,
      gradeId: new mongoose.Types.ObjectId(),
      classId: new mongoose.Types.ObjectId(),
      enrollmentStatus: 'active',
    });

    expect(result.credentials?.loginEmail).toBe('learner@example.com');
    expect(result.credentials?.tempPassword).toMatch(/^Campus-/);

    const user = await User.findOne({ _id: result.student.userId }).select('+password');
    expect(user).not.toBeNull();
    await expect(user!.comparePassword(result.credentials!.tempPassword)).resolves.toBe(true);
  });

  it('resets credentials when inviting an existing student user', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const created = await StudentService.create({
      firstName: 'Existing',
      lastName: 'Learner',
      schoolId,
      gradeId: new mongoose.Types.ObjectId(),
      classId: new mongoose.Types.ObjectId(),
      enrollmentStatus: 'active',
    });

    const result = await StudentInviteService.inviteStudent(
      created.student._id.toString(),
      schoolId.toString(),
      { email: 'existing@example.com' },
    );

    expect(result.loginEmail).toBe('existing@example.com');
    expect(result.tempPassword).toMatch(/^Campus-/);

    const user = await User.findOne({ _id: created.student.userId }).select('+password');
    expect(user?.email).toBe('existing@example.com');
    await expect(user!.comparePassword(result.tempPassword)).resolves.toBe(true);
  });

  it('lets a roster learner claim their generated portal account without duplicating the student', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const gradeId = new mongoose.Types.ObjectId();
    const cls = await Class.create({
      name: 'Grade 12 Accounting',
      schoolId,
      gradeId,
      teacherId: new mongoose.Types.ObjectId(),
      capacity: 35,
      classroomCode: 'ABC123',
    });

    const created = await StudentService.create({
      firstName: 'Claim',
      lastName: 'Learner',
      schoolId,
      gradeId,
      classId: cls._id,
      enrollmentStatus: 'active',
    });
    expect(created.credentials?.loginEmail).toContain('@students.campusly.local');

    const result = await AuthService.registerStudent({
      firstName: 'Claim',
      lastName: 'Learner',
      email: 'claim.learner@example.com',
      password: 'Password123!',
      classroomCode: 'ABC123',
    });

    expect(result.user.email).toBe('claim.learner@example.com');
    expect(await Student.countDocuments({ schoolId, classId: cls._id, isDeleted: false })).toBe(1);

    const user = await User.findById(created.student.userId).select('+password');
    expect(user?.email).toBe('claim.learner@example.com');
    await expect(user!.comparePassword('Password123!')).resolves.toBe(true);
  });
});
