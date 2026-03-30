import { Worker, Job } from 'bullmq';
import { redisConnection, lostFoundArchiveQueue } from './queues.js';
import { LostItem } from '../modules/LostFound/model.js';
import { School } from '../modules/School/model.js';
import { Notification } from '../modules/Notification/model.js';

interface LostFoundArchiveJobData {
  schoolId?: string;
}

export function createLostFoundArchiveWorker(): Worker {
  const worker = new Worker(
    'lost-found-archive',
    async (job: Job<LostFoundArchiveJobData>) => {
      console.log(`[LostFoundArchiveJob] Processing job ${job.id}`);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let schools: Array<{ _id: unknown }>;

      if (job.data.schoolId) {
        schools = [{ _id: job.data.schoolId }];
      } else {
        schools = await School.find({ isDeleted: false }).select('_id').lean();
      }

      let totalArchived = 0;

      for (const school of schools) {
        const schoolId = String(school._id);

        const result = await LostItem.updateMany(
          {
            schoolId,
            status: 'found',
            isDeleted: false,
            createdAt: { $lte: thirtyDaysAgo },
          },
          {
            $set: {
              status: 'archived',
              archivedDate: new Date(),
            },
          },
        );

        if (result.modifiedCount > 0) {
          totalArchived += result.modifiedCount;

          // Notify school admins
          const { User } = await import('../modules/Auth/model.js');
          const admins = await User.find({
            schoolId,
            role: 'school_admin',
            isDeleted: false,
            isActive: true,
          }).select('_id');

          for (const admin of admins) {
            await Notification.create({
              recipientId: admin._id,
              schoolId,
              type: 'in_app',
              title: 'Lost & Found Items Archived',
              message: `${result.modifiedCount} unclaimed lost & found item(s) have been automatically archived after 30 days.`,
              data: { archivedCount: result.modifiedCount },
            });
          }
        }
      }

      console.log(`[LostFoundArchiveJob] Archived ${totalArchived} items across ${schools.length} schools`);
      return { totalArchived, schoolsProcessed: schools.length };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    console.log(`[LostFoundArchiveJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[LostFoundArchiveJob] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

export async function scheduleLostFoundArchive(): Promise<void> {
  await lostFoundArchiveQueue.upsertJobScheduler(
    'weekly-lost-found-archive',
    { pattern: '0 2 * * 0' }, // Every Sunday at 02:00
    {
      name: 'lost-found-archive',
      data: {},
    },
  );

  console.log('[LostFoundArchiveJob] Scheduled weekly lost & found archive at Sunday 02:00');
}
