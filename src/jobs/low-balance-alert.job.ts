import { logger } from '../common/logger.js';
import { Worker, Job } from 'bullmq';
import { redisConnection, lowBalanceAlertQueue } from './queues.js';
import { Wallet } from '../modules/Wallet/model.js';
import { Student } from '../modules/Student/model.js';
import { Parent } from '../modules/Parent/model.js';
import { Notification } from '../modules/Notification/model.js';

const LOW_BALANCE_THRESHOLD = 5000; // R50 in cents

interface LowBalanceAlertJobData {
  threshold?: number;
}

export function createLowBalanceAlertWorker(): Worker {
  const worker = new Worker(
    'low-balance-alert',
    async (job: Job<LowBalanceAlertJobData>) => {
      const threshold = job.data.threshold ?? LOW_BALANCE_THRESHOLD;
      logger.info(`[LowBalanceAlertJob] Processing low balance alerts (threshold: ${threshold} cents)`);

      const lowBalanceWallets = await Wallet.find({
        balance: { $lt: threshold },
        isActive: true,
        isDeleted: false,
      }).limit(500).lean();

      logger.info(`[LowBalanceAlertJob] Found ${lowBalanceWallets.length} wallets below threshold`);

      if (lowBalanceWallets.length === 0) {
        return { walletsFound: 0, notificationCount: 0 };
      }

      // Batch-fetch all students to avoid N+1 queries
      const studentIds = lowBalanceWallets.map(w => w.studentId);
      const students = await Student.find({
        _id: { $in: studentIds },
        isDeleted: false,
      }).populate('userId', 'firstName lastName').lean();
      const studentMap = new Map(students.map(s => [s._id.toString(), s]));

      // Batch-fetch all parents for these students
      const parents = await Parent.find({
        childrenIds: { $in: studentIds },
        isDeleted: false,
      }).lean();

      // Build a map: studentId -> parent records
      const parentsByStudent = new Map<string, typeof parents>();
      for (const parent of parents) {
        for (const childId of parent.childrenIds) {
          const key = childId.toString();
          if (!parentsByStudent.has(key)) parentsByStudent.set(key, []);
          parentsByStudent.get(key)!.push(parent);
        }
      }

      const notifications: Array<{
        recipientId: unknown;
        schoolId: unknown;
        type: string;
        title: string;
        message: string;
        data: Record<string, unknown>;
      }> = [];

      for (const wallet of lowBalanceWallets) {
        const student = studentMap.get(wallet.studentId.toString());
        if (!student) continue;

        const user = student.userId as unknown as { firstName: string; lastName: string };
        const studentName = `${user.firstName} ${user.lastName}`;
        const balanceRands = (wallet.balance / 100).toFixed(2);

        const studentParents = parentsByStudent.get(student._id.toString()) ?? [];

        for (const parent of studentParents) {
          notifications.push({
            recipientId: parent.userId,
            schoolId: wallet.schoolId,
            type: 'in_app',
            title: 'Low Wallet Balance',
            message: `${studentName}'s wallet balance is low at R${balanceRands}. Please top up to ensure uninterrupted purchases.`,
            data: {
              walletId: wallet._id,
              studentId: student._id,
              balance: wallet.balance,
              threshold,
            },
          });
        }
      }

      // Batch-insert all notifications
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      logger.info(`[LowBalanceAlertJob] Created ${notifications.length} notifications`);
      return { walletsFound: lowBalanceWallets.length, notificationCount: notifications.length };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    logger.info(`[LowBalanceAlertJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[LowBalanceAlertJob] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}

export async function scheduleLowBalanceAlerts(): Promise<void> {
  await lowBalanceAlertQueue.upsertJobScheduler(
    'daily-low-balance-alert',
    { pattern: '0 7 * * 1-5' }, // Weekdays at 07:00
    {
      name: 'low-balance-alert',
      data: {},
    },
  );

  logger.info('[LowBalanceAlertJob] Scheduled weekday low balance alerts at 07:00');
}
