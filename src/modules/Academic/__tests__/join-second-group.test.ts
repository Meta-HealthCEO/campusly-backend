// src/modules/Academic/__tests__/join-second-group.test.ts
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';

vi.mock('../../../jobs/course-generation.job.js', () => ({ enqueueCourseGeneration: vi.fn(async () => undefined) }));

import app from '../../../app.js';
import { Class } from '../model.js';
import { School } from '../../School/model.js';
import { User } from '../../Auth/model.js';
import { Student } from '../../Student/model.js';
import { Enrolment } from '../../Course/model.js';
import { ClassUnitService } from '../../Course/service-class-unit.js';
import { signTestToken } from '../../../test-utils/auth.js';
import { classroomCode, cleanUpClassrooms, standaloneClassroom, trackSchool } from '../../../test-utils/standalone-classroom.js';
import { writtenUnit } from '../../../test-utils/class-unit.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

const join = (token: string, code: string) =>
  request(app).post('/api/academic/classes/join').set('Authorization', `Bearer ${token}`).send({ code });

describe("a standalone teacher's learner joins another of the teacher's groups", () => {
  it('adds the group, keeps their own, and gives them lessons already released to it', async () => {
    const room = await standaloneClassroom();
    await room.learner('Zola', room.science.id);
    const unit = await writtenUnit(room);
    await ClassUnitService.release(unit.courseId, String(room.schoolId), unit.actor, [String(room.science.id)]);
    const thabo = await room.learner('Thabo', room.maths.id);

    const res = await join(thabo.token, room.science.code);
    expect(res.status).toBe(200);
    expect(res.body.data.joined).toBe('added');
    expect(res.body.message).toBe('You joined Grade 10 Physical Sciences.');
    const after = await Student.findById(thabo.studentId).lean();
    expect(String(after?.classId)).toBe(String(room.maths.id));
    expect((after?.subjectClassIds ?? []).map(String)).toEqual([String(room.science.id)]);
    expect(await Enrolment.countDocuments({ courseId: unit.courseId, studentId: thabo.studentId, isDeleted: false })).toBe(1);
  });

  it('accepts a lower-case code with spaces (Review Focus 2)', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id);
    const spaced = ` ${room.science.code.toLowerCase().split('').join(' ')} `;
    expect((await join(thabo.token, spaced)).body.data.joined).toBe('added');
  });

  it("says they're already in it (200) for their own group or a repeat, and adds nothing", async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id, [room.science.id]);
    for (const code of [room.maths.code, room.science.code]) {
      const res = await join(thabo.token, code);
      expect(res.status).toBe(200);
      expect(res.body.data.joined).toBe('already');
      expect(res.body.message).toBe("You're already in this group");
    }
    expect((await Student.findById(thabo.studentId).lean())?.subjectClassIds).toHaveLength(1);
  });

  it("refuses another teacher's code with the one-account-per-teacher message", async () => {
    const room = await standaloneClassroom();
    const other = await standaloneClassroom('Pieter');
    const thabo = await room.learner('Thabo', room.maths.id);
    const res = await join(thabo.token, other.maths.code);
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("This code is for another teacher's class. Each teacher's class needs its own account for now.");
  });

  it('counts learners who joined as a second group towards capacity', async () => {
    const room = await standaloneClassroom();
    const small = await room.group('Grade 10 Olympiad', 2);
    await room.learner('Lebo', small.id);
    await room.learner('Sipho', room.maths.id, [small.id]);
    const thabo = await room.learner('Thabo', room.maths.id);
    const res = await join(thabo.token, small.code);
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('This class is full');
  });
});

describe('a school learner (unchanged, ruling R6)', () => {
  it('moves to the new class, and gets "not in your school" for a code elsewhere', async () => {
    const schoolId = oid();
    trackSchool(schoolId);
    await School.collection.insertOne({ _id: schoolId, name: 'lp_school', plan: 'school', isActive: true, isDeleted: false, modulesEnabled: ['academic'] });
    const [a, b] = [oid(), oid()];
    const [codeA, codeB] = [classroomCode(), classroomCode()];
    await Class.collection.insertMany([
      { _id: a, schoolId, name: '10A', gradeId: oid(), teacherId: oid(), capacity: 30, classroomCode: codeA, isDeleted: false },
      { _id: b, schoolId, name: '10B', gradeId: oid(), teacherId: oid(), capacity: 30, classroomCode: codeB, isDeleted: false },
    ]);
    const userId = oid();
    await User.collection.insertOne({ _id: userId, schoolId, firstName: 'Kea', lastName: 'S', email: `lp-kea-${userId}@test.local`, role: 'student', isActive: true, isDeleted: false });
    await Student.collection.insertOne({ _id: oid(), schoolId, userId, classId: a, gradeId: oid(), subjectClassIds: [], admissionNumber: `K-${userId}`, isDeleted: false });
    const token = signTestToken({ id: userId, schoolId, role: 'student', isStandaloneTeacher: false, isSchoolPrincipal: false });

    const moved = await join(token, codeB);
    expect(moved.status).toBe(200);
    expect(moved.body.data).toMatchObject({ joined: 'moved', previousClassId: String(a) });
    const elsewhere = await standaloneClassroom();
    expect((await join(token, elsewhere.maths.code)).status).toBe(404);
  });
});
