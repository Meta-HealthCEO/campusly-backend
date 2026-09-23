import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { School } from '../../School/model.js';
import { Assessment, Class, Subject } from '../model.js';
import { signTestToken } from '../../../test-utils/auth.js';

const teacherId = new mongoose.Types.ObjectId();
const otherTeacherId = new mongoose.Types.ObjectId();
const gradeId = new mongoose.Types.ObjectId();
let schoolId: mongoose.Types.ObjectId;
let myClass: mongoose.Types.ObjectId;
let notMyClass: mongoose.Types.ObjectId;
let english: mongoose.Types.ObjectId;
let foreignSubject: mongoose.Types.ObjectId;

const teacherToken = () =>
  signTestToken({ role: 'teacher', schoolId, id: teacherId, isSchoolPrincipal: false, isStandaloneTeacher: false });

function body(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Oral: prepared reading', subjectId: String(english), classId: String(myClass),
    type: 'practical', totalMarks: 20, term: 3, date: '2026-09-23T00:00:00.000Z', ...overrides,
  };
}

describe('POST /api/academic/assessments/mine', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
    const stamp = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const school = await School.create({
      name: `teacher_assessment_${stamp}`, type: 'combined',
      address: { street: 'x', city: 'x', province: 'x', postalCode: '0000', country: 'ZA' },
      contactInfo: { email: `ta+${stamp}@test.local`, phone: '0' },
      settings: { academicYear: 2026, terms: 4, gradingSystem: 'percentage' },
      principal: 'T', joinCode: `T${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      isActive: true, modulesEnabled: ['academic'],
    });
    schoolId = school._id as mongoose.Types.ObjectId;
    const common = { schoolId, gradeId, capacity: 30 };
    myClass = (await Class.create({ ...common, teacherId, name: '10A', classroomCode: `M${stamp.slice(-5)}` }))._id as mongoose.Types.ObjectId;
    notMyClass = (await Class.create({ ...common, teacherId: otherTeacherId, name: '10B', classroomCode: `N${stamp.slice(-5)}` }))._id as mongoose.Types.ObjectId;
    english = (await Subject.create({ schoolId, name: 'English', code: 'ENG' }))._id as mongoose.Types.ObjectId;
    foreignSubject = (await Subject.create({ schoolId: new mongoose.Types.ObjectId(), name: 'English', code: 'ENG' }))._id as mongoose.Types.ObjectId;
  });

  afterAll(async () => {
    await Promise.all([
      Assessment.deleteMany({ schoolId }),
      Class.deleteMany({ schoolId }),
      Subject.deleteMany({ _id: { $in: [english, foreignSubject] } }),
      School.deleteMany({ _id: schoolId }),
    ]);
    await mongoose.connection.close();
  });

  it('lets a teacher add an assessment for a class they teach, scoped to their school', async () => {
    const res = await request(app)
      .post('/api/academic/assessments/mine')
      .set('Authorization', `Bearer ${teacherToken()}`)
      .send(body());

    expect(res.status).toBe(201);
    const saved = await Assessment.findById(res.body.data.id ?? res.body.data._id).lean();
    expect(saved).toMatchObject({ name: 'Oral: prepared reading', totalMarks: 20, term: 3, academicYear: 2026, weight: 0 });
    expect(String(saved?.schoolId)).toBe(String(schoolId));
  });

  it("refuses a class the teacher doesn't teach", async () => {
    const res = await request(app)
      .post('/api/academic/assessments/mine')
      .set('Authorization', `Bearer ${teacherToken()}`)
      .send(body({ classId: String(notMyClass) }));

    expect(res.status).toBe(403);
  });

  it("refuses another school's subject", async () => {
    const res = await request(app)
      .post('/api/academic/assessments/mine')
      .set('Authorization', `Bearer ${teacherToken()}`)
      .send(body({ subjectId: String(foreignSubject) }));

    expect(res.status).toBe(400);
  });

  it("refuses a subject that isn't offered in the class's grade", async () => {
    const gradeTwelveOnly = await Subject.create({
      schoolId, name: 'Mathematics', code: 'MAT12', gradeIds: [new mongoose.Types.ObjectId()],
    });

    const res = await request(app)
      .post('/api/academic/assessments/mine')
      .set('Authorization', `Bearer ${teacherToken()}`)
      .send(body({ subjectId: String(gradeTwelveOnly._id) }));

    expect(res.status).toBe(400);
    await Subject.deleteOne({ _id: gradeTwelveOnly._id });
  });

  it('never takes the school from the request body', async () => {
    const res = await request(app)
      .post('/api/academic/assessments/mine')
      .set('Authorization', `Bearer ${teacherToken()}`)
      .send(body({ schoolId: String(new mongoose.Types.ObjectId()) }));

    expect(res.status).toBe(400);
  });

  it('is for teachers only', async () => {
    const token = signTestToken({ role: 'parent', schoolId, id: new mongoose.Types.ObjectId() });

    const res = await request(app)
      .post('/api/academic/assessments/mine')
      .set('Authorization', `Bearer ${token}`)
      .send(body());

    expect(res.status).toBe(403);
  });
});
