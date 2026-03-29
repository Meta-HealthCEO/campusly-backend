import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const attendanceStatusSchema = z.enum(['present', 'absent', 'late', 'excused']);

export const recordAttendanceSchema = z.object({
  studentId: objectIdSchema,
  classId: objectIdSchema,
  schoolId: objectIdSchema,
  date: z.string().datetime(),
  period: z.int().positive('Period must be a positive integer'),
  status: attendanceStatusSchema,
  notes: z.string().optional(),
});

export const bulkAttendanceSchema = z.object({
  classId: objectIdSchema,
  schoolId: objectIdSchema,
  date: z.string().datetime(),
  period: z.int().positive('Period must be a positive integer'),
  records: z.array(
    z.object({
      studentId: objectIdSchema,
      status: attendanceStatusSchema,
      notes: z.string().optional(),
    }),
  ).min(1, 'At least one record is required'),
});

export const attendanceReportSchema = z.object({
  studentId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
export type AttendanceReportInput = z.infer<typeof attendanceReportSchema>;
