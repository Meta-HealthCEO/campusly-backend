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
      console.log(`[LowBalanceAlertJob] Processing low balance alerts (threshold: ${threshold} cents)`);

      const lowBalanceWallets = await Wallet.find({
        balance: { $lt: threshold },
        isActive: true,
        isDeleted: false,
      });

      console.log(`[LowBalanceAlertJob] Found ${lowBalanceWallets.length} wallets below threshold`);

      let notificationCount = 0;

      for (const wallet of lowBalanceWallets) {
        const student = await Student.findOne({
          _id: wallet.studentId,
          isDeleted: false,
        }).populate('userId', 'firstName lastName');

        if (!student) continue;

        const user = student.userId as unknown as { firstName: string; lastName: string };
        const studentName = `${user.firstName} ${user.lastName}`;
        const balanceRands = (wallet.balance / 100).toFixed(2);

        // Notify parents
        const parents = await Parent.find({
          childrenIds: student._id,
          isDeleted: false,
        });

        for (const parent of parents) {
          await Notification.create({
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

          notificationCount++;
        }
      }

      console.log(`[LowBalanceAlertJob] Created ${notificationCount} notifications`);
      return { walletsFound: lowBalanceWallets.length, notificationCount };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    console.log(`[LowBalanceAlertJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[LowBalanceAlertJob] Job ${job?.id} failed:`, err.message);
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

  console.log('[LowBalanceAlertJob] Scheduled weekday low balance alerts at 07:00');
}
