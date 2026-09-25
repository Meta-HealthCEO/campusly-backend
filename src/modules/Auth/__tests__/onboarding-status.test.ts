import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';

// Rate limiting is not under test here, and its Redis client blocks forever
// when Redis is down (maxRetriesPerRequest: null), so swap in a pass-through.
vi.mock('../../../middleware/rateLimiter.js', () => ({
  createRateLimiter: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

import app from '../../../app.js';
import { TeacherSettingsService } from '../../TeacherSettings/service.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { Class, Grade, Subject, Timetable } from '../../Academic/model.js';
import { Course } from '../../Course/model.js';
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
  await CurriculumNode.deleteMany({ schoolId: { $in: createdSchoolIds } });
  await Class.deleteMany({ schoolId: { $in: createdSchoolIds } });
  await Timetable.deleteMany({ schoolId: { $in: createdSchoolIds } });
  await Grade.deleteMany({ schoolId: { $in: createdSchoolIds } });
  await Subject.deleteMany({ schoolId: { $in: createdSchoolIds } });
  await Course.deleteMany({ schoolId: { $in: createdSchoolIds } });
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

describe('getOnboardingStatus — the three onboarding steps', () => {
  async function capsGradeAndSubject(schoolId: mongoose.Types.ObjectId) {
    const frameworkId = new mongoose.Types.ObjectId();
    const grade = await CurriculumNode.create({ frameworkId, type: 'grade', title: 'Grade 4', code: 'G4', order: 4, schoolId });
    const subject = await CurriculumNode.create({
      frameworkId, type: 'subject', title: 'Mathematics', code: 'G4-MATH', order: 1, schoolId, parentId: grade._id, gradeId: grade._id,
    });
    return { gradeId: String(grade._id), subjectId: String(subject._id) };
  }

  async function newClass(schoolId: mongoose.Types.ObjectId, teacherId: mongoose.Types.ObjectId) {
    return Class.create({
      name: 'Grade 4 Mathematics', gradeId: new mongoose.Types.ObjectId(), schoolId, teacherId, capacity: 40,
      classroomCode: `C${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    });
  }

  /** A class linked to a subject, as the onboarding and My classes create it (a timetable row carries the subject). */
  async function classWithSubject(schoolId: mongoose.Types.ObjectId, teacherId: mongoose.Types.ObjectId) {
    const cls = await newClass(schoolId, teacherId);
    await Timetable.create({
      schoolId, teacherId, classId: cls._id, subjectId: new mongoose.Types.ObjectId(),
      day: 'monday', period: 1, startTime: '08:00', endTime: '08:30',
    });
    return cls;
  }

  it('a class with no subject (from the old onboarding) does not count as the first class', async () => {
    const { user, school } = await makeTeacher();
    await newClass(school._id as mongoose.Types.ObjectId, user._id as mongoose.Types.ObjectId);
    const status = await StandaloneService.getOnboardingStatus(String(user._id), String(school._id));
    expect(status.hasClass).toBe(false);
  });

  it('a new standalone teacher has not picked what they teach, made a class, or made a lesson', async () => {
    const { user, school } = await makeTeacher();
    const status = await StandaloneService.getOnboardingStatus(String(user._id), String(school._id));
    expect(status).toMatchObject({ hasScope: false, hasClass: false, hasUnit: false });
  });

  it('knows each step once it is done', async () => {
    const { user, school } = await makeTeacher();
    const schoolId = school._id as mongoose.Types.ObjectId;
    const { gradeId, subjectId } = await capsGradeAndSubject(schoolId);
    await TeacherSettingsService.updateTeachingScope(String(user._id), { grades: [gradeId], subjectsByGrade: [{ gradeId, subjectIds: [subjectId] }] });
    await classWithSubject(schoolId, user._id as mongoose.Types.ObjectId);
    await Course.create({ schoolId, title: 'Fractions', slug: `fractions-${Date.now()}`, createdBy: user._id, kind: 'class_unit' });

    const status = await StandaloneService.getOnboardingStatus(String(user._id), String(schoolId));
    expect(status).toMatchObject({ hasScope: true, hasClass: true, hasUnit: true });
  });

  it('a catalogue course is not a first lesson', async () => {
    const { user, school } = await makeTeacher();
    await Course.create({ schoolId: school._id, title: 'Catalogue', slug: `cat-${Date.now()}`, createdBy: user._id, kind: 'catalogue' });
    const status = await StandaloneService.getOnboardingStatus(String(user._id), String(school._id));
    expect(status.hasUnit).toBe(false);
  });
});

describe('one teacher sign-up', () => {
  it('POST /api/auth/register-teacher is gone', async () => {
    const res = await request(app).post('/api/auth/register-teacher').send({
      firstName: 'Old', lastName: 'Form', email: `obs+gone${Date.now()}@test.local`, password: 'Password1',
    });
    expect(res.status).toBe(404);
  });
});
