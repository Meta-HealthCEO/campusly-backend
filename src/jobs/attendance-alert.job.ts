import { logger } from '../common/logger.js';
import { Worker, Job } from 'bullmq';
import { redisConnection, attendanceAlertQueue } from './queues.js';
import { Attendance } from '../modules/Attendance/model.js';
import { Parent } from '../modules/Parent/model.js';
import { Notification } from '../modules/Notification/model.js';

interface AttendanceAlertJobData {
  schoolId: string;
  date: string;
  period: number;
}

export function createAttendanceAlertWorker(): Worker {
  const worker = new Worker(
    'attendance-alert',
    async (job: Job<AttendanceAlertJobData>) => {
      const { schoolId, date, period } = job.data;
      logger.info(`[AttendanceAlertJob] Processing alerts for school ${schoolId}, date ${date}, period ${period}`);

      const absentRecords = await Attendance.find({
        schoolId,
        date: new Date(date),
        period,
        status: 'absent',
        isDeleted: false,
      }).populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'firstName lastName' },
      });

      logger.info(`[AttendanceAlertJob] Found ${absentRecords.length} absent students`);

      if (absentRecords.length === 0) {
        return { absentCount: 0, notificationCount: 0 };
      }

      // Collect all valid student IDs for batch parent lookup
      const absentStudentIds: string[] = [];
      for (const record of absentRecords) {
        const student = record.studentId as unknown as {
          _id: string;
          userId: { firstName: string; lastName: string };
        };
        if (student?._id) absentStudentIds.push(student._id.toString());
      }

      // Batch-fetch all parents to avoid N+1 queries
      const allParents = await Parent.find({
        childrenIds: { $in: absentStudentIds },
        isDeleted: false,
      }).lean();
      const parentUserIds = Array.from(new Set(allParents.map((parent) => parent.userId.toString())));

      // Build a map: studentId -> parent records
      const parentsByStudent = new Map<string, typeof allParents>();
      for (const parent of allParents) {
        for (const childId of parent.childrenIds) {
          const key = childId.toString();
          if (!parentsByStudent.has(key)) parentsByStudent.set(key, []);
          parentsByStudent.get(key)!.push(parent);
        }
      }

      const existingAlerts = parentUserIds.length > 0
        ? await Notification.find({
          recipientId: { $in: parentUserIds },
          schoolId,
          title: 'Absence Alert',
          'data.date': date,
          'data.period': period,
          'data.status': 'absent',
          isDeleted: false,
        })
          .select('recipientId data.studentId')
          .lean()
        : [];
      const existingAlertKeys = new Set(
        existingAlerts.map((alert) => `${alert.recipientId.toString()}:${String(alert.data?.studentId ?? '')}`),
      );
      const displayDate = date.slice(0, 10);

      const notifications: Array<{
        recipientId: unknown;
        schoolId: string;
        type: string;
        title: string;
        message: string;
        data: Record<string, unknown>;
      }> = [];

      for (const record of absentRecords) {
        const student = record.studentId as unknown as {
          _id: string;
          userId: { firstName: string; lastName: string };
        };

        if (!student?.userId) continue;

        const studentName = `${student.userId.firstName} ${student.userId.lastName}`;
        const studentParents = parentsByStudent.get(student._id.toString()) ?? [];

        for (const parent of studentParents) {
          const alertKey = `${parent.userId.toString()}:${student._id.toString()}`;
          if (existingAlertKeys.has(alertKey)) continue;
          existingAlertKeys.add(alertKey);

          notifications.push({
            recipientId: parent.userId,
            schoolId,
            type: 'in_app',
            title: 'Absence Alert',
            message: `${studentName} was marked absent on ${displayDate} (period ${period}).`,
            data: {
              studentId: student._id,
              date,
              period,
              status: 'absent',
            },
          });
        }
      }

      // Batch-insert all notifications
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      logger.info(`[AttendanceAlertJob] Created ${notifications.length} parent notifications`);
      return { absentCount: absentRecords.length, notificationCount: notifications.length };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    logger.info(`[AttendanceAlertJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[AttendanceAlertJob] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}

export async function addAttendanceAlertJob(data: AttendanceAlertJobData): Promise<void> {
  await attendanceAlertQueue.add('attendance-alert', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });

  logger.info(`[AttendanceAlertJob] Job queued for school ${data.schoolId}, date ${data.date}`);
}
