// src/scripts/__tests__/backfill-unit-enrolments.test.ts
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../jobs/course-generation.job.js', () => ({ enqueueCourseGeneration: vi.fn(async () => undefined) }));

import { Enrolment } from '../../modules/Course/model.js';
import { ClassUnitService } from '../../modules/Course/service-class-unit.js';
import { backfillUnitEnrolments } from '../backfill-unit-enrolments.js';
import { cleanUpClassrooms, standaloneClassroom } from '../../test-utils/standalone-classroom.js';
import { writtenUnit } from '../../test-utils/class-unit.js';

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

describe('backfillUnitEnrolments', () => {
  it('reports on a dry run, enrols on --apply, skips dropped learners, and is safe to repeat', async () => {
    const room = await standaloneClassroom();
    await room.learner('Lebo', room.maths.id);
    const unit = await writtenUnit(room);
    await ClassUnitService.release(unit.courseId, String(room.schoolId), unit.actor, [String(room.maths.id)]);
    // Joined before enrol-on-join shipped: in the group, never enrolled.
    const thabo = await room.learner('Thabo', room.science.id, [room.maths.id]);
    const zola = await room.learner('Zola', room.maths.id);
    await Enrolment.collection.insertOne({
      schoolId: room.schoolId, courseId: new mongoose.Types.ObjectId(unit.courseId), studentId: zola.studentId, enrolledBy: room.teacherId,
      classId: room.maths.id, status: 'dropped', isDeleted: true, progressPercent: 0, enrolledAt: new Date(),
    });
    const scope = { schoolIds: [room.schoolId] };

    expect(await backfillUnitEnrolments({ apply: false, ...scope })).toEqual({ units: 1, missing: 1, created: 0 });
    expect(await Enrolment.countDocuments({ courseId: unit.courseId, studentId: thabo.studentId })).toBe(0);

    expect(await backfillUnitEnrolments({ apply: true, ...scope })).toEqual({ units: 1, missing: 1, created: 1 });
    const made = await Enrolment.findOne({ courseId: unit.courseId, studentId: thabo.studentId, isDeleted: false }).lean();
    expect(String(made?.classId)).toBe(String(room.maths.id));
    expect(await Enrolment.countDocuments({ courseId: unit.courseId, studentId: zola.studentId, isDeleted: false })).toBe(0);

    expect(await backfillUnitEnrolments({ apply: true, ...scope })).toEqual({ units: 1, missing: 0, created: 0 });
  });
});
