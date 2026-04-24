import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Attendance } from '../model.js';
import { AttendanceService } from '../service.js';
import { AttendanceStatus } from '../../../common/enums.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('attendance bulkRecord', () => {
  it('persists all records on a clean bulk write', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const date = new Date('2025-01-15T00:00:00.000Z');
    const students = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

    const result = await AttendanceService.bulkRecord(
      {
        classId: classId.toString(),
        schoolId: schoolId.toString(),
        date,
        period: 1,
        records: students.map((s) => ({
          studentId: s.toString(),
          status: AttendanceStatus.PRESENT,
        })),
      },
      teacherId.toString(),
    );

    expect(result.saved.length).toBe(2);
    expect(result.failed.length).toBe(0);

    const rows = await Attendance.find({ schoolId, classId }).lean();
    expect(rows.length).toBe(2);
  });

  it('captures edit history when bulk overwrites an existing record with a different status', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const date = new Date('2025-01-16T00:00:00.000Z');
    const studentId = new mongoose.Types.ObjectId();

    // First call — absent
    await AttendanceService.bulkRecord(
      {
        classId: classId.toString(),
        schoolId: schoolId.toString(),
        date,
        period: 1,
        records: [{ studentId: studentId.toString(), status: AttendanceStatus.ABSENT }],
      },
      teacherId.toString(),
    );

    // Second call — same key, different status
    await AttendanceService.bulkRecord(
      {
        classId: classId.toString(),
        schoolId: schoolId.toString(),
        date,
        period: 1,
        records: [{ studentId: studentId.toString(), status: AttendanceStatus.PRESENT }],
      },
      teacherId.toString(),
    );

    const row = await Attendance.findOne({ schoolId, studentId }).lean();
    expect(row?.status).toBe(AttendanceStatus.PRESENT);
    expect(row?.editHistory?.length).toBe(1);
    expect(row?.editHistory?.[0].prevStatus).toBe(AttendanceStatus.ABSENT);
  });

  it('no edit history entry when status is unchanged on re-save', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const date = new Date('2025-01-17T00:00:00.000Z');
    const studentId = new mongoose.Types.ObjectId();

    await AttendanceService.bulkRecord(
      {
        classId: classId.toString(),
        schoolId: schoolId.toString(),
        date,
        period: 1,
        records: [{ studentId: studentId.toString(), status: AttendanceStatus.PRESENT }],
      },
      teacherId.toString(),
    );

    await AttendanceService.bulkRecord(
      {
        classId: classId.toString(),
        schoolId: schoolId.toString(),
        date,
        period: 1,
        records: [{ studentId: studentId.toString(), status: AttendanceStatus.PRESENT }],
      },
      teacherId.toString(),
    );

    const row = await Attendance.findOne({ schoolId, studentId }).lean();
    expect(row?.editHistory?.length ?? 0).toBe(0);
  });
});
