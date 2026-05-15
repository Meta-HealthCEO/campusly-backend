import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { StandaloneService } from '../standalone.service.js';
import { School } from '../../School/model.js';
import { User } from '../model.js';
import { Lesson } from '../../Lesson/model.js';
import { Homework } from '../../Homework/model.js';
import { GeneratedPaper } from '../../AITools/model.js';

const createdSchoolIds: mongoose.Types.ObjectId[] = [];

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test',
    );
  }
});

afterAll(async () => {
  await Lesson.deleteMany({ schoolId: { $in: createdSchoolIds } });
  await Homework.deleteMany({ schoolId: { $in: createdSchoolIds } });
  await GeneratedPaper.deleteMany({ schoolId: { $in: createdSchoolIds } });
  await User.deleteMany({ email: /^obs\+/ });
  await School.deleteMany({ name: /^t_obs_/ });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

async function makeTeacher() {
  const stamp = `${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
  const school = await School.create({
    name: `t_obs_${stamp}`,
    type: 'combined',
    address: { street: 'x', city: 'x', province: 'x', postalCode: '0000', country: 'ZA' },
    contactInfo: { email: `obs+${stamp}@test.local`, phone: '0' },
    settings: { academicYear: 2026, terms: 4, gradingSystem: 'percentage' },
    principal: 'T',
    joinCode: `J${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    isActive: true,
    plan: 'standalone',
  });
  createdSchoolIds.push(school._id as mongoose.Types.ObjectId);
  const user = await User.create({
    email: `obs+${stamp}@test.local`,
    password: 'Password1!',
    firstName: 'T',
    lastName: 'X',
    role: 'teacher',
    schoolId: school._id,
    isStandaloneTeacher: true,
  });
  return { user, school };
}

describe('getOnboardingStatus.hasFirstContent', () => {
  it('returns false when teacher has no lessons, homework, or papers', async () => {
    const { user, school } = await makeTeacher();
    const status = await StandaloneService.getOnboardingStatus(
      String(user._id),
      String(school._id),
    );
    expect(status.hasFirstContent).toBe(false);
    expect(status.hasClass).toBe(false);
    expect(status.hasStudent).toBe(false);
    // hasFramework is system-seeded (CurriculumFramework rows with schoolId: null exist),
    // so the test environment may have it true — assert only what's deterministic.
  });

  it('returns true when teacher has at least one lesson', async () => {
    const { user, school } = await makeTeacher();
    await Lesson.create({
      schoolId: school._id,
      teacherId: user._id,
      curriculumNodeId: new mongoose.Types.ObjectId(),
      title: 'Test lesson',
      durationMinutes: 45,
    });
    const status = await StandaloneService.getOnboardingStatus(
      String(user._id),
      String(school._id),
    );
    expect(status.hasFirstContent).toBe(true);
  });

  it('returns true when teacher has at least one homework', async () => {
    const { user, school } = await makeTeacher();
    await Homework.create({
      schoolId: school._id,
      teacherId: user._id,
      title: 'Test homework',
      type: 'exercise',
      subjectId: new mongoose.Types.ObjectId(),
      classId: new mongoose.Types.ObjectId(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalMarks: 10,
    });
    const status = await StandaloneService.getOnboardingStatus(
      String(user._id),
      String(school._id),
    );
    expect(status.hasFirstContent).toBe(true);
  });

  it('returns true when teacher has at least one generated paper', async () => {
    const { user, school } = await makeTeacher();
    await GeneratedPaper.create({
      schoolId: school._id,
      teacherId: user._id,
      subject: 'Math',
      grade: 8,
      term: 1,
      topic: 'Algebra',
      difficulty: 'medium',
      duration: 60,
      totalMarks: 100,
    });
    const status = await StandaloneService.getOnboardingStatus(
      String(user._id),
      String(school._id),
    );
    expect(status.hasFirstContent).toBe(true);
  });
});
