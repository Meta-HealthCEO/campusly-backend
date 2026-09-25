import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { Notification } from '../model.js';
import { User } from '../../Auth/model.js';
import { Student } from '../../Student/model.js';
import { signTestToken } from '../../../test-utils/auth.js';

// A notice stays inside the sender's school. The request body names the school,
// so only a super admin may name another one; a single notice's recipient must
// be in the sender's school; and a bulk notice only reaches learners of the
// school it names.

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
const schools: Oid[] = [];

interface School { schoolId: Oid; classId: Oid; gradeId: Oid; learnerUserId: Oid }

async function school(): Promise<School> {
  const s: School = { schoolId: oid(), classId: oid(), gradeId: oid(), learnerUserId: oid() };
  schools.push(s.schoolId);
  await User.collection.insertOne({
    _id: s.learnerUserId, schoolId: s.schoolId, firstName: 'ns', lastName: 'Learner', role: 'student',
    email: `ns-${s.learnerUserId.toString()}@test.local`, isActive: true, isDeleted: false, refreshTokens: [],
  });
  await Student.collection.insertOne({
    _id: oid(), schoolId: s.schoolId, userId: s.learnerUserId, classId: s.classId, gradeId: s.gradeId,
    admissionNumber: `NS-${s.learnerUserId.toString()}`, isDeleted: false,
  });
  return s;
}

const token = (s: School, role: 'school_admin' | 'teacher' | 'super_admin') =>
  signTestToken({ id: oid(), schoolId: s.schoolId, role, isStandaloneTeacher: false, isSchoolPrincipal: false });
const heard = (s: School) => Notification.countDocuments({ recipientId: s.learnerUserId, isDeleted: false });
const note = { type: 'in_app', title: 'Trip', message: 'Bring a hat.' };
const bulk = (auth: string, body: Record<string, unknown>) =>
  request(app).post('/api/notifications/bulk').set('Authorization', `Bearer ${auth}`).send({ ...note, ...body });
const single = (auth: string, body: Record<string, unknown>) =>
  request(app).post('/api/notifications').set('Authorization', `Bearer ${auth}`).send({ ...note, ...body });

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => {
  await Promise.all([User, Student, Notification].map((m) => m.collection.deleteMany({ schoolId: { $in: schools } })));
  await mongoose.disconnect();
});

describe('POST /api/notifications/bulk', () => {
  it('refuses a school admin who names another school', async () => {
    const [mine, theirs] = [await school(), await school()];
    const admin = token(mine, 'school_admin');
    expect((await bulk(admin, { schoolId: String(theirs.schoolId), targetType: 'class', targetId: String(theirs.classId) })).status).toBe(403);
    expect((await bulk(admin, { schoolId: String(mine.schoolId), targetType: 'school', targetId: String(theirs.schoolId) })).status).toBe(403);
    expect(await heard(theirs)).toBe(0);
  });

  it("never reaches another school's class or grade, even named under the admin's own school", async () => {
    const [mine, theirs] = [await school(), await school()];
    const admin = token(mine, 'school_admin');
    const byClass = await bulk(admin, { schoolId: String(mine.schoolId), targetType: 'class', targetId: String(theirs.classId) });
    const byGrade = await bulk(admin, { schoolId: String(mine.schoolId), targetType: 'grade', targetId: String(theirs.gradeId) });
    expect([byClass.body.data.count, byGrade.body.data.count]).toEqual([0, 0]);
    expect(await heard(theirs)).toBe(0);
  });

  it("reaches the admin's own class, grade and school", async () => {
    const mine = await school();
    const admin = token(mine, 'school_admin');
    for (const [targetType, targetId] of [['class', mine.classId], ['grade', mine.gradeId], ['school', mine.schoolId]] as const) {
      const res = await bulk(admin, { schoolId: String(mine.schoolId), targetType, targetId: String(targetId) });
      expect(res.status).toBe(201);
    }
    expect(await heard(mine)).toBe(3);
  });

  it('lets a super admin notify any school', async () => {
    const [mine, theirs] = [await school(), await school()];
    const res = await bulk(token(mine, 'super_admin'), { schoolId: String(theirs.schoolId), targetType: 'class', targetId: String(theirs.classId) });
    expect(res.status).toBe(201);
    expect(await heard(theirs)).toBe(1);
  });
});

describe('POST /api/notifications', () => {
  it('refuses a teacher who writes to someone in another school', async () => {
    const [mine, theirs] = [await school(), await school()];
    const teacher = token(mine, 'teacher');
    expect((await single(teacher, { recipientId: String(theirs.learnerUserId), schoolId: String(theirs.schoolId) })).status).toBe(403);
    expect((await single(teacher, { recipientId: String(theirs.learnerUserId), schoolId: String(mine.schoolId) })).status).toBe(403);
    expect(await heard(theirs)).toBe(0);
  });

  it("reaches a learner in the teacher's own school", async () => {
    const mine = await school();
    const res = await single(token(mine, 'teacher'), { recipientId: String(mine.learnerUserId), schoolId: String(mine.schoolId) });
    expect(res.status).toBe(201);
    expect(await heard(mine)).toBe(1);
  });
});
