import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { School } from '../../School/model.js';
import { signTestToken } from '../../../test-utils/auth.js';

let schoolId: mongoose.Types.ObjectId;

describe('GET /api/attendance/merits', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
    const stamp = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const school = await School.create({
      name: `merits_${stamp}`,
      type: 'combined',
      address: { street: 'x', city: 'x', province: 'x', postalCode: '0000', country: 'ZA' },
      contactInfo: { email: `m+${stamp}@test.local`, phone: '0' },
      settings: { academicYear: 2026, terms: 4, gradingSystem: 'percentage' },
      principal: 'T',
      joinCode: `S${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      isActive: true,
      modulesEnabled: ['attendance'],
    });
    schoolId = school._id as mongoose.Types.ObjectId;
  });

  afterAll(async () => {
    await School.deleteMany({ _id: schoolId });
    await mongoose.connection.close();
  });

  it("never lists the school's merits and demerits to a learner or a parent", async () => {
    for (const role of ['student', 'parent']) {
      const token = signTestToken({ role, schoolId, id: new mongoose.Types.ObjectId() });
      const res = await request(app).get('/api/attendance/merits').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    }
  });

  it('still lists them for staff', async () => {
    const token = signTestToken({ role: 'teacher', schoolId, id: new mongoose.Types.ObjectId() });
    const res = await request(app).get('/api/attendance/merits').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
