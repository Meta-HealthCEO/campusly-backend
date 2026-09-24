import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { School } from '../../School/model.js';
import { Homework } from '../model.js';
import { signTestToken } from '../../../test-utils/auth.js';
import { classSchool } from '../../../test-utils/class-school.js';

let fx: Awaited<ReturnType<typeof classSchool>>;

const asParent = (id: mongoose.Types.ObjectId) =>
  `Bearer ${signTestToken({ role: 'parent', schoolId: fx.schoolId, id, isSchoolPrincipal: false, isStandaloneTeacher: false })}`;

describe('GET /api/homework/parent/dashboard', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
    fx = await classSchool();
    await School.collection.insertOne({
      _id: fx.schoolId, name: `hw_parent_${fx.schoolId}`, isActive: true, isDeleted: false, modulesEnabled: ['homework'],
    });
    await Homework.collection.insertOne({
      schoolId: fx.schoolId, classId: fx.classA, title: 'Overdue sums', status: 'assigned',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), isDeleted: false,
    });
  });

  afterAll(async () => {
    await School.deleteMany({ _id: fx.schoolId });
    await Homework.deleteMany({ schoolId: fx.schoolId });
    await mongoose.connection.close();
  });

  it("gives a parent their child's homework summary", async () => {
    const res = await request(app).get('/api/homework/parent/dashboard').set('Authorization', asParent(fx.pUser));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ studentId: String(fx.lebo.id), firstName: 'Lebo', overdue: 1 });
  });

  it('includes a child who lists the parent as a guardian', async () => {
    const res = await request(app).get('/api/homework/parent/dashboard').set('Authorization', asParent(fx.qUser));
    expect(res.status).toBe(200);
    expect(res.body.data.map((c: { studentId: string }) => c.studentId)).toEqual([String(fx.sipho.id)]);
  });

  it('lists a child linked both ways once', async () => {
    const res = await request(app).get('/api/homework/parent/dashboard').set('Authorization', asParent(fx.rUser));
    expect(res.body.data.map((c: { studentId: string }) => c.studentId)).toEqual([String(fx.zola.id)]);
  });
});
