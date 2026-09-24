import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { School } from '../../School/model.js';
import { signTestToken } from '../../../test-utils/auth.js';

const schools: mongoose.Types.ObjectId[] = [];

async function school(modules: string[]) {
  const stamp = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const s = await School.create({
    name: `behaviour_${stamp}`, type: 'combined',
    address: { street: 'x', city: 'x', province: 'x', postalCode: '0000', country: 'ZA' },
    contactInfo: { email: `b+${stamp}@test.local`, phone: '0' },
    settings: { academicYear: 2026, terms: 4, gradingSystem: 'percentage' },
    principal: 'T', joinCode: `S${Math.random().toString(36).slice(2, 7).toUpperCase()}`, isActive: true, modulesEnabled: modules,
  });
  schools.push(s._id as mongoose.Types.ObjectId);
  return s._id as mongoose.Types.ObjectId;
}

describe('/api/behaviour', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
  });
  afterAll(async () => {
    await School.deleteMany({ _id: { $in: schools } });
    await mongoose.connection.close();
  });

  const classId = new mongoose.Types.ObjectId().toString();

  it('is for staff: a learner or a parent is refused', async () => {
    const schoolId = await school(['attendance']);
    for (const role of ['student', 'parent']) {
      const token = signTestToken({ role, schoolId, id: new mongoose.Types.ObjectId() });
      const res = await request(app).get(`/api/behaviour?classId=${classId}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    }
  });

  it("follows the attendance module: a school without it doesn't have the behaviour log", async () => {
    const schoolId = await school(['academic']);
    const token = signTestToken({ role: 'teacher', schoolId, id: new mongoose.Types.ObjectId() });
    const res = await request(app).get(`/api/behaviour?classId=${classId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("a teacher asking for a class they don't teach gets a plain refusal", async () => {
    const schoolId = await school(['attendance']);
    const token = signTestToken({ role: 'teacher', schoolId, id: new mongoose.Types.ObjectId(), isSchoolPrincipal: false });
    const res = await request(app).get(`/api/behaviour?classId=${classId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('You can only see behaviour for classes you teach.');
  });
});
