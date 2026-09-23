import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { Attendance } from '../model.js';
import { Class, Subject, Timetable } from '../../Academic/model.js';
import { RegisterStatusService } from '../service-register-status.js';

const schoolId = new mongoose.Types.ObjectId();
const otherSchoolId = new mongoose.Types.ObjectId();
const teacherId = new mongoose.Types.ObjectId();
const otherTeacherId = new mongoose.Types.ObjectId();
const gradeId = new mongoose.Types.ObjectId();
const WEDNESDAY = '2026-09-23';

let classA: mongoose.Types.ObjectId;
let classB: mongoose.Types.ObjectId;
let maths: mongoose.Types.ObjectId;

async function period(fields: Record<string, unknown>) {
  await Timetable.create({
    schoolId, teacherId, subjectId: maths, day: 'wednesday',
    startTime: '08:00', endTime: '08:45', isDeleted: false, ...fields,
  });
}

async function mark(classId: mongoose.Types.ObjectId, p: number, extra: Record<string, unknown> = {}) {
  await Attendance.create({
    schoolId, classId, period: p, status: 'present',
    studentId: new mongoose.Types.ObjectId(), recordedBy: teacherId,
    date: new Date(`${WEDNESDAY}T00:00:00.000Z`), ...extra,
  });
}

describe('RegisterStatusService.getForTeacher', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
    const common = { schoolId, gradeId, teacherId, capacity: 30 };
    classA = (await Class.create({ ...common, name: '10A', classroomCode: `A${Date.now() % 1e5}` }))._id as mongoose.Types.ObjectId;
    classB = (await Class.create({ ...common, name: '10B', classroomCode: `B${Date.now() % 1e5}` }))._id as mongoose.Types.ObjectId;
    maths = (await Subject.create({ schoolId, name: 'Mathematics', code: 'MAT' }))._id as mongoose.Types.ObjectId;

    await period({ classId: classB, period: 3, startTime: '10:00', endTime: '10:45', room: 'B12' });
    await period({ classId: classA, period: 1 });
    await period({ classId: classA, period: 2, isDeleted: true });
    await period({ classId: classA, period: 4, teacherId: otherTeacherId });
    await period({ classId: classA, period: 5, day: 'thursday' });

    await mark(classA, 1);
    await mark(classB, 3, { isDeleted: true });
    await mark(classB, 3, { schoolId: otherSchoolId });
  });

  afterAll(async () => {
    await Promise.all([
      Timetable.deleteMany({ schoolId }),
      Attendance.deleteMany({ schoolId: { $in: [schoolId, otherSchoolId] } }),
      Class.deleteMany({ schoolId }),
      Subject.deleteMany({ schoolId }),
    ]);
    await mongoose.connection.close();
  });

  it("lists the teacher's periods for that weekday in order, flagging taken registers", async () => {
    const result = await RegisterStatusService.getForTeacher(String(schoolId), String(teacherId), WEDNESDAY);

    expect(result).toEqual([
      expect.objectContaining({
        classId: String(classA), className: '10A', subjectName: 'Mathematics',
        period: 1, startTime: '08:00', endTime: '08:45', recorded: true, recordedCount: 1,
      }),
      expect.objectContaining({
        classId: String(classB), className: '10B', period: 3, room: 'B12',
        recorded: false, recordedCount: 0,
      }),
    ]);
  });

  it('returns nothing on a weekend', async () => {
    const result = await RegisterStatusService.getForTeacher(String(schoolId), String(teacherId), '2026-09-26');

    expect(result).toEqual([]);
  });

  it('rejects an impossible calendar date instead of rolling it over', async () => {
    await expect(
      RegisterStatusService.getForTeacher(String(schoolId), String(teacherId), '2026-02-30'),
    ).rejects.toThrow(/date/i);
  });

  it('leaves out periods whose class has been deleted', async () => {
    const archived = await Class.create({
      schoolId, gradeId, teacherId, capacity: 30, name: '10Z',
      classroomCode: `Z${Date.now() % 1e5}`, isDeleted: true,
    });
    await period({ classId: archived._id, period: 6 });

    const result = await RegisterStatusService.getForTeacher(String(schoolId), String(teacherId), WEDNESDAY);

    expect(result.map((p) => p.period)).toEqual([1, 3]);
  });

  it('rejects a date that is not YYYY-MM-DD', async () => {
    await expect(
      RegisterStatusService.getForTeacher(String(schoolId), String(teacherId), '23/09/2026'),
    ).rejects.toThrow(/date/i);
  });
});
