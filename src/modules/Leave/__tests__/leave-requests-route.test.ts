import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { School } from '../../School/model.js';
import { LeaveRequest } from '../model.js';
import { signTestToken } from '../../../test-utils/auth.js';

const oid = () => new mongoose.Types.ObjectId();
const schoolId = oid();
const [thandi, sipho, admin] = [oid(), oid(), oid()];
const siphoRequestId = oid();

const bearer = (id: mongoose.Types.ObjectId, role: string) =>
  `Bearer ${signTestToken({ role, schoolId, id, isSchoolPrincipal: false, isStandaloneTeacher: false })}`;

describe('/api/leave/requests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
    await School.collection.insertOne({
      _id: schoolId, name: `leave_${schoolId}`, isActive: true, isDeleted: false, modulesEnabled: ['staff_leave'],
    });
    const base = { schoolId, leaveType: 'sick', startDate: new Date('2026-09-01'), endDate: new Date('2026-09-01'), workingDays: 1, status: 'pending', isDeleted: false };
    await LeaveRequest.collection.insertMany([
      { ...base, staffId: thandi, reason: 'Flu' },
      { ...base, _id: siphoRequestId, staffId: sipho, reason: 'Hospital visit' },
    ]);
  });

  afterAll(async () => {
    await LeaveRequest.deleteMany({ schoolId });
    await School.deleteMany({ _id: schoolId });
    await mongoose.connection.close();
  });

  it("lists only a teacher's own requests, whatever staffId they ask for", async () => {
    const res = await request(app).get(`/api/leave/requests?staffId=${sipho}`).set('Authorization', bearer(thandi, 'teacher'));
    expect(res.status).toBe(200);
    expect(res.body.data.requests.map((r: { reason: string }) => r.reason)).toEqual(['Flu']);
  });

  it("lists every request in the school for an admin", async () => {
    const res = await request(app).get('/api/leave/requests').set('Authorization', bearer(admin, 'school_admin'));
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(2);
  });

  it("won't open another teacher's request by id", async () => {
    const res = await request(app).get(`/api/leave/requests/${siphoRequestId}`).set('Authorization', bearer(thandi, 'teacher'));
    expect(res.status).toBe(404);
  });

  it('opens it for the teacher who asked for the leave and for an admin', async () => {
    for (const [id, role] of [[sipho, 'teacher'], [admin, 'school_admin']] as const) {
      const res = await request(app).get(`/api/leave/requests/${siphoRequestId}`).set('Authorization', bearer(id, role));
      expect(res.status).toBe(200);
    }
  });
});
