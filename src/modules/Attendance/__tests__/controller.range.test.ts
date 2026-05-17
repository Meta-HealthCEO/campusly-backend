import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { AttendanceService } from '../service.js';
import { Attendance } from '../model.js';
import { School } from '../../School/model.js';

const createdSchoolIds: mongoose.Types.ObjectId[] = [];

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test',
    );
  }
});

afterAll(async () => {
  await Attendance.deleteMany({ schoolId: { $in: createdSchoolIds } });
  await School.deleteMany({ name: /^range_test_/ });
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

async function makeFixture() {
  const stamp = `${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
  const school = await School.create({
    name: `range_test_${stamp}`,
    type: 'combined',
    address: { street: 'x', city: 'x', province: 'x', postalCode: '0000', country: 'ZA' },
    contactInfo: { email: `range-test+${stamp}@test.local`, phone: '0' },
    settings: { academicYear: 2026, terms: 4, gradingSystem: 'percentage' },
    principal: 'T',
    joinCode: `R${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    isActive: true,
    plan: 'standalone',
  });
  createdSchoolIds.push(school._id as mongoose.Types.ObjectId);
  return { school };
}

describe('AttendanceService.getByClass with date range + period', () => {
  it('returns records across a date range', async () => {
    const { school } = await makeFixture();
    const classId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();
    const recordedBy = new mongoose.Types.ObjectId();
    await Attendance.create([
      { schoolId: school._id, classId, studentId, recordedBy, date: new Date('2026-05-12T00:00:00.000Z'), period: 1, status: 'present' },
      { schoolId: school._id, classId, studentId, recordedBy, date: new Date('2026-05-13T00:00:00.000Z'), period: 1, status: 'absent' },
      { schoolId: school._id, classId, studentId, recordedBy, date: new Date('2026-05-14T00:00:00.000Z'), period: 1, status: 'present' },
      { schoolId: school._id, classId, studentId, recordedBy, date: new Date('2026-05-20T00:00:00.000Z'), period: 1, status: 'late' },
    ]);

    const result = await AttendanceService.getByClass(
      String(classId),
      { dateFrom: '2026-05-12', dateTo: '2026-05-15' },
      String(school._id),
    );

    expect(result).toHaveLength(3);
  });

  it('filters by period when provided', async () => {
    const { school } = await makeFixture();
    const classId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();
    const recordedBy = new mongoose.Types.ObjectId();
    await Attendance.create([
      { schoolId: school._id, classId, studentId, recordedBy, date: new Date('2026-05-12T00:00:00.000Z'), period: 1, status: 'present' },
      { schoolId: school._id, classId, studentId, recordedBy, date: new Date('2026-05-12T00:00:00.000Z'), period: 5, status: 'absent' },
    ]);

    const result = await AttendanceService.getByClass(
      String(classId),
      { dateFrom: '2026-05-12', dateTo: '2026-05-12', period: 5 },
      String(school._id),
    );

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('absent');
  });

  it('preserves the single-date shape for backward compat', async () => {
    const { school } = await makeFixture();
    const classId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();
    const recordedBy = new mongoose.Types.ObjectId();
    await Attendance.create({
      schoolId: school._id, classId, studentId, recordedBy,
      date: new Date('2026-05-12T00:00:00.000Z'), period: 1, status: 'present',
    });

    const result = await AttendanceService.getByClass(
      String(classId),
      '2026-05-12',
      String(school._id),
    );

    expect(result).toHaveLength(1);
  });
});
