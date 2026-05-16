import { afterEach, beforeAll, afterAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { User } from '../model.js';
import { School, generateJoinCode } from '../../School/model.js';
import { Parent } from '../../Parent/model.js';
import { Student } from '../../Student/model.js';
import { signTestToken } from '../../../test-utils/auth.js';

const TEST_URI = process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test';

// Shared dummy ObjectIds for required Student FK fields
const DUMMY_GRADE_ID = new mongoose.Types.ObjectId();
const DUMMY_CLASS_ID = new mongoose.Types.ObjectId();

/** Minimal valid School document */
function schoolFixture(name: string) {
  return {
    name,
    address: { street: '1 Test St', city: 'Cape Town', province: 'WC', postalCode: '8001', country: 'ZA' },
    contactInfo: { email: 'school@test.com', phone: '0210000000' },
    settings: { academicYear: 2025, terms: 4, gradingSystem: 'percentage' as const },
    joinCode: generateJoinCode(),
  };
}

describe('GET /api/auth/me/mobile-context', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_URI);
    }
  });

  afterEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      School.deleteMany({}),
      Parent.deleteMany({}),
      Student.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('returns user, school, and parent with children for a parent account', async () => {
    const school = await School.create(schoolFixture('Test High'));

    const user = await User.create({
      email: 'parent@test.com',
      password: 'irrelevant',
      firstName: 'Parent',
      lastName: 'One',
      role: 'parent',
      schoolId: school._id,
    });

    const childUser = await User.create({
      email: 'child@test.com',
      password: 'irrelevant',
      firstName: 'Child',
      lastName: 'One',
      role: 'student',
      schoolId: school._id,
    });

    const studentDoc = await Student.create({
      userId: childUser._id,
      schoolId: school._id,
      gradeId: DUMMY_GRADE_ID,
      classId: DUMMY_CLASS_ID,
      admissionNumber: `ADM-${Date.now()}`,
    });

    await Parent.create({
      userId: user._id,
      schoolId: school._id,
      childrenIds: [studentDoc._id],
      relationship: 'father',
    });

    const token = signTestToken({
      id: String(user._id),
      schoolId: String(school._id),
      role: 'parent',
    });

    const res = await request(app)
      .get('/api/auth/me/mobile-context')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('parent@test.com');
    expect(res.body.user.role).toBe('parent');
    expect(res.body.school.name).toBe('Test High');
    expect(res.body.school.settings).toBeDefined();
    expect(res.body.school.settings.gradingSystem).toBe('percentage');
    expect(res.body.school.settings.currency).toBe('ZAR');
    expect(res.body.parent).not.toBeNull();
    expect(res.body.parent.children).toHaveLength(1);
    expect(res.body.parent.children[0].firstName).toBe('Child');
    expect(res.body.student).toBeNull();
    expect(res.body.teacher).toBeNull();
  });

  it('returns student profile for a student account', async () => {
    const school = await School.create(schoolFixture('Test High'));

    const user = await User.create({
      email: 'student@test.com',
      password: 'irrelevant',
      firstName: 'Stu',
      lastName: 'Dent',
      role: 'student',
      schoolId: school._id,
    });

    await Student.create({
      userId: user._id,
      schoolId: school._id,
      gradeId: DUMMY_GRADE_ID,
      classId: DUMMY_CLASS_ID,
      admissionNumber: `ADM-${Date.now()}`,
    });

    const token = signTestToken({
      id: String(user._id),
      schoolId: String(school._id),
      role: 'student',
    });

    const res = await request(app)
      .get('/api/auth/me/mobile-context')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.student).not.toBeNull();
    expect(res.body.student.classId).toBe(String(DUMMY_CLASS_ID));
    expect(res.body.student.gradeId).toBe(String(DUMMY_GRADE_ID));
    expect(res.body.parent).toBeNull();
    expect(res.body.teacher).toBeNull();
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me/mobile-context');
    expect(res.status).toBe(401);
  });

  it('does not leak children from another school', async () => {
    const schoolA = await School.create(schoolFixture('A'));
    const schoolB = await School.create({ ...schoolFixture('B'), joinCode: generateJoinCode() });

    const parentUser = await User.create({
      email: 'p@a.com', password: 'x', firstName: 'P', lastName: 'A',
      role: 'parent', schoolId: schoolA._id,
    });

    const otherChildUser = await User.create({
      email: 'c@b.com', password: 'x', firstName: 'C', lastName: 'B',
      role: 'student', schoolId: schoolB._id,
    });

    const otherChild = await Student.create({
      userId: otherChildUser._id,
      schoolId: schoolB._id,
      gradeId: DUMMY_GRADE_ID,
      classId: DUMMY_CLASS_ID,
      admissionNumber: `ADM-X-${Date.now()}`,
    });

    await Parent.create({
      userId: parentUser._id,
      schoolId: schoolA._id,
      childrenIds: [otherChild._id],
      relationship: 'guardian',
    });

    const token = signTestToken({
      id: String(parentUser._id),
      schoolId: String(schoolA._id),
      role: 'parent',
    });

    const res = await request(app)
      .get('/api/auth/me/mobile-context')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.parent.children).toHaveLength(0);
  });

  it('returns teacher identity for a teacher account', async () => {
    const school = await School.create(schoolFixture('Teacher School'));

    const user = await User.create({
      email: 'teacher@test.com',
      password: 'irrelevant',
      firstName: 'Tee',
      lastName: 'Cher',
      role: 'teacher',
      schoolId: school._id,
    });

    const token = signTestToken({
      id: String(user._id),
      schoolId: String(school._id),
      role: 'teacher',
    });

    const res = await request(app)
      .get('/api/auth/me/mobile-context')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('teacher');
    expect(res.body.parent).toBeNull();
    expect(res.body.student).toBeNull();
    expect(res.body.teacher).not.toBeNull();
    expect(res.body.teacher.id).toBeDefined();
    expect(Array.isArray(res.body.teacher.grades)).toBe(true);
    expect(Array.isArray(res.body.teacher.subjectsByGrade)).toBe(true);
    expect('departmentId' in res.body.teacher).toBe(true);
  });

  it('returns 403 when the token has no schoolId', async () => {
    // standalone teachers can have a token without a schoolId
    const token = signTestToken({ id: String(new mongoose.Types.ObjectId()), role: 'teacher' });

    const res = await request(app)
      .get('/api/auth/me/mobile-context')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
