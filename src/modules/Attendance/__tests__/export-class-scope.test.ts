import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { School } from '../../School/model.js';
import { Class, Grade } from '../../Academic/model.js';
import { signTestToken } from '../../../test-utils/auth.js';

// The attendance export names the class it was run for. A school admin skips
// the teacher's class-ownership check, so the class must be looked up inside
// the caller's school: another school's class is "not found", never named.

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
const schools: Oid[] = [];

async function schoolWithClass(className: string): Promise<{ schoolId: Oid; classId: Oid }> {
  const stamp = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const school = await School.create({
    name: `export_scope_${stamp}`, type: 'combined',
    address: { street: 'x', city: 'x', province: 'x', postalCode: '0000', country: 'ZA' },
    contactInfo: { email: `es+${stamp}@test.local`, phone: '0' },
    settings: { academicYear: 2026, terms: 4, gradingSystem: 'percentage' },
    principal: 'T', joinCode: `E${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    isActive: true, modulesEnabled: ['attendance'],
  });
  const schoolId = school._id as Oid;
  schools.push(schoolId);
  const gradeId = oid();
  await Grade.collection.insertOne({ _id: gradeId, schoolId, name: 'Grade 9', isDeleted: false });
  const classId = oid();
  await Class.collection.insertOne({
    _id: classId, schoolId, name: className, gradeId, teacherId: oid(), capacity: 30,
    classroomCode: Math.random().toString(36).slice(2, 8).toUpperCase(), isDeleted: false,
  });
  return { schoolId, classId };
}

const exportPdf = (schoolId: Oid, classId: Oid | string) =>
  request(app)
    .get(`/api/attendance/export?dateFrom=2026-09-01&dateTo=2026-09-30&format=pdf&period=1&classId=${String(classId)}`)
    .set('Authorization', `Bearer ${signTestToken({ id: oid(), schoolId, role: 'school_admin', isStandaloneTeacher: false, isSchoolPrincipal: false })}`)
    .buffer(true)
    .parse((res, done) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => done(null, Buffer.concat(chunks)));
    });

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => {
  await Promise.all([Class, Grade].map((m) => m.collection.deleteMany({ schoolId: { $in: schools } })));
  await School.deleteMany({ _id: { $in: schools } });
  await mongoose.disconnect();
});

describe('GET /api/attendance/export for a class', () => {
  it("answers 404 for another school's class, and never names it", async () => {
    const mine = await schoolWithClass('9A Mine');
    const theirs = await schoolWithClass('9Z Secret Class');
    const res = await exportPdf(mine.schoolId, theirs.classId);
    expect(res.status).toBe(404);
    expect((res.body as Buffer).toString('latin1')).not.toContain('Secret');
  });

  it('answers 404 for a class id that is not an id', async () => {
    const mine = await schoolWithClass('9A Mine');
    expect((await exportPdf(mine.schoolId, 'not-an-id')).status).toBe(404);
  });

  it("still exports the admin's own class", async () => {
    const mine = await schoolWithClass('9A Mine');
    const res = await exportPdf(mine.schoolId, mine.classId);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
  });
});
