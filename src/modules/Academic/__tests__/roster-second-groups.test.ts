// src/modules/Academic/__tests__/roster-second-groups.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { GradeService } from '../services/grade.service.js';
import { StudentService } from '../../Student/service.js';
import { AttendanceService } from '../../Attendance/service.js';
import { registerRoster } from '../../Attendance/register-roster.js';
import { AttendanceStatus } from '../../../common/enums.js';
import { cleanUpClassrooms, standaloneClassroom, type Classroom, type Learner } from '../../../test-utils/standalone-classroom.js';

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

/** Lebo is in Maths; Thabo's own group is Science and he joined Maths too. */
async function maths(): Promise<{ room: Classroom; lebo: Learner; thabo: Learner }> {
  const room = await standaloneClassroom();
  return { room, lebo: await room.learner('Lebo', room.maths.id), thabo: await room.learner('Thabo', room.science.id, [room.maths.id]) };
}

describe('a learner who joined a second group is on that group\'s roster', () => {
  it('in My classes (teaching load) — and still in their own group', async () => {
    const { room, thabo } = await maths();
    const load = await GradeService.getTeacherTeachingLoad(String(room.teacherId), String(room.schoolId), { isStandaloneTeacher: true });
    const ids = (classId: mongoose.Types.ObjectId) => (load.subjectClasses.find((c) => String((c.class as { _id: unknown })._id) === String(classId))?.students ?? []).map((s) => String(s._id));
    expect(ids(room.maths.id)).toContain(String(thabo.studentId));
    expect(ids(room.science.id)).toContain(String(thabo.studentId));
  });

  it('in the class count', async () => {
    const { room } = await maths();
    expect(await GradeService.countClassStudents(String(room.maths.id), String(room.schoolId))).toBe(2);
  });

  it("in the teacher's learner list, and a search still narrows it", async () => {
    const { room, thabo } = await maths();
    const all = await StudentService.list(String(room.schoolId), {}, { classIds: [String(room.maths.id)] });
    expect(all.total).toBe(2);
    const searched = await StudentService.list(String(room.schoolId), { search: String(thabo.studentId).slice(-6) }, { classIds: [String(room.maths.id)] });
    expect(searched.students.map((s) => String(s._id))).toEqual([String(thabo.studentId)]);
  });

  it('in the register: saving marks them, and the register export lists them', async () => {
    const { room, lebo, thabo } = await maths();
    const result = await AttendanceService.bulkRecord({
      classId: String(room.maths.id), schoolId: String(room.schoolId), date: new Date('2026-09-25T00:00:00.000Z'), period: 1,
      records: [lebo, thabo].map((l) => ({ studentId: String(l.studentId), status: AttendanceStatus.PRESENT })),
    }, String(room.teacherId));
    expect(result.saved).toHaveLength(2);
    expect((await registerRoster(String(room.schoolId), String(room.maths.id))).map((s) => String(s._id))).toContain(String(thabo.studentId));
  });

});
