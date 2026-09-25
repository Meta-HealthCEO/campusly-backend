// src/modules/Course/__tests__/enrol-on-join.test.ts
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';

vi.mock('../../../jobs/course-generation.job.js', () => ({ enqueueCourseGeneration: vi.fn(async () => undefined) }));

import app from '../../../app.js';
import { Enrolment } from '../model.js';
import { ClassUnitService } from '../service-class-unit.js';
import { enrolLearnerInReleasedUnits } from '../enrolment.js';
import { Grade } from '../../Academic/model.js';
import { Student } from '../../Student/model.js';
import { StudentService } from '../../Student/service.js';
import { BulkImportService } from '../../Student/bulk-import.service.js';
import { cleanUpClassrooms, standaloneClassroom, type Classroom } from '../../../test-utils/standalone-classroom.js';
import { writtenUnit } from '../../../test-utils/class-unit.js';

type Oid = mongoose.Types.ObjectId;

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

/** A classroom with Lebo in Maths and a unit released to Maths. */
async function released(): Promise<{ room: Classroom; courseId: string }> {
  const room = await standaloneClassroom();
  await room.learner('Lebo', room.maths.id);
  const unit = await writtenUnit(room);
  await ClassUnitService.release(unit.courseId, String(room.schoolId), unit.actor, [String(room.maths.id)]);
  return { room, courseId: unit.courseId };
}

const enrolments = (courseId: string, studentId: Oid) => Enrolment.countDocuments({ courseId, studentId, isDeleted: false });

describe('enrolLearnerInReleasedUnits', () => {
  it('enrols a newcomer once, however often it runs', async () => {
    const { room, courseId } = await released();
    const neo = await room.learner('Neo', room.maths.id);
    expect(await enrolLearnerInReleasedUnits(neo.studentId, room.maths.id, room.schoolId)).toBe(1);
    expect(await enrolLearnerInReleasedUnits(neo.studentId, room.maths.id, room.schoolId)).toBe(0);
    expect(await enrolments(courseId, neo.studentId)).toBe(1);
  });

  it('never re-enrols a learner whose enrolment was dropped (ruling R10)', async () => {
    const { room, courseId } = await released();
    const zola = await room.learner('Zola', room.maths.id);
    await Enrolment.collection.insertOne({
      schoolId: room.schoolId, courseId: new mongoose.Types.ObjectId(courseId), studentId: zola.studentId, enrolledBy: room.teacherId,
      classId: room.maths.id, status: 'dropped', isDeleted: true, progressPercent: 0, enrolledAt: new Date(),
    });
    expect(await enrolLearnerInReleasedUnits(zola.studentId, room.maths.id, room.schoolId)).toBe(0);
    expect(await enrolments(courseId, zola.studentId)).toBe(0);
  });
});

describe('every way into a group enrols', () => {
  it('a learner the teacher adds (POST /students)', async () => {
    const { room, courseId } = await released();
    const res = await request(app).post('/api/students').set('Authorization', `Bearer ${room.teacherToken}`)
      .send({ classId: String(room.maths.id), gradeId: String(new mongoose.Types.ObjectId()), firstName: 'Neo', lastName: 'K', deliveryMethod: 'slip' });
    expect(res.status).toBe(201);
    expect(await enrolments(courseId, new mongoose.Types.ObjectId(String(res.body.data.student._id)))).toBe(1);
  });

  it('a learner from a bulk import', async () => {
    const { room, courseId } = await released();
    await Grade.collection.insertOne({ _id: new mongoose.Types.ObjectId(), schoolId: room.schoolId, name: 'Grade 10', isDeleted: false });
    const result = await BulkImportService.importStudents(String(room.schoolId), [
      { firstName: 'Ayo', lastName: 'B', admissionNumber: 'BI-1', class: room.maths.name },
    ], String(room.teacherId));
    expect(result.imported).toBe(1);
    const ayo = await Student.findOne({ schoolId: room.schoolId, admissionNumber: 'BI-1' }).lean();
    expect(await enrolments(courseId, ayo!._id as Oid)).toBe(1);
  });

  it('a learner moved into the group (PUT classId)', async () => {
    const { room, courseId } = await released();
    const sipho = await room.learner('Sipho', room.science.id);
    await StudentService.update(String(sipho.studentId), String(room.schoolId), { classId: String(room.maths.id) } as never);
    expect(await enrolments(courseId, sipho.studentId)).toBe(1);
  });

  it('moving into a second group drops it from subjectClassIds (Review Focus 4)', async () => {
    const { room, courseId } = await released();
    const thabo = await room.learner('Thabo', room.science.id, [room.maths.id]);
    await StudentService.update(String(thabo.studentId), String(room.schoolId), { classId: String(room.maths.id) } as never);
    const after = await Student.findById(thabo.studentId).lean();
    expect(String(after?.classId)).toBe(String(room.maths.id));
    expect((after?.subjectClassIds ?? []).map(String)).toEqual([]);
    expect(await enrolments(courseId, thabo.studentId)).toBe(1);
  });

  it("a teacher's release reaches a group whose only learner joined it as a second group", async () => {
    const room = await standaloneClassroom();
    const extra = await room.group('Grade 10 Extension');
    const thabo = await room.learner('Thabo', room.maths.id, [extra.id]);
    const unit = await writtenUnit(room);
    await expect(ClassUnitService.release(unit.courseId, String(room.schoolId), unit.actor, [String(extra.id)]))
      .resolves.toMatchObject({ classes: [{ newEnrolments: 1 }] });
    expect(await enrolments(unit.courseId, thabo.studentId)).toBe(1);
  });
});
