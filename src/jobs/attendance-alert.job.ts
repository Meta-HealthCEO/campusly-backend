import { Worker, Job } from 'bullmq';
import { redisConnection, attendanceAlertQueue } from './queues.js';
import { Attendance } from '../modules/Attendance/model.js';
import { Student } from '../modules/Student/model.js';
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
      console.log(`[AttendanceAlertJob] Processing alerts for school ${schoolId}, date ${date}, period ${period}`);

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

      console.log(`[AttendanceAlertJob] Found ${absentRecords.length} absent students`);

      let notificationCount = 0;

      for (const record of absentRecords) {
        const student = record.studentId as unknown as {
          _id: string;
          userId: { firstName: string; lastName: string };
          guardianIds: string[];
        };

        if (!student?.userId) continue;

        const studentName = `${student.userId.firstName} ${student.userId.lastName}`;

        // Find parents of this student
        const parents = await Parent.find({
          childrenIds: student._id,
          isDeleted: false,
        });

        for (const parent of parents) {
          await Notification.create({
            recipientId: parent.userId,
            schoolId,
            type: 'in_app',
            title: 'Absence Alert',
            message: `${studentName} was marked absent on ${date} (period ${period}).`,
            data: {
              studentId: student._id,
              date,
              period,
              status: 'absent',
            },
          });

          notificationCount++;
        }
      }

      console.log(`[AttendanceAlertJob] Created ${notificationCount} parent notifications`);
      return { absentCount: absentRecords.length, notificationCount };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    console.log(`[AttendanceAlertJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[AttendanceAlertJob] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

export async function addAttendanceAlertJob(data: AttendanceAlertJobData): Promise<void> {
  await attendanceAlertQueue.add('attendance-alert', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });

  console.log(`[AttendanceAlertJob] Job queued for school ${data.schoolId}, date ${data.date}`);
}
