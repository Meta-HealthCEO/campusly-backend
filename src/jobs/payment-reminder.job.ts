import { logger } from '../common/logger.js';
import mongoose from 'mongoose';
import { Worker, Job } from 'bullmq';
import { redisConnection, paymentReminderQueue } from './queues.js';
import { Invoice } from '../modules/Fee/model.js';
import { Student } from '../modules/Student/model.js';
import { Notification } from '../modules/Notification/model.js';
import { InvoiceStatus } from '../common/enums.js';

interface PaymentReminderJobData {
  schoolId?: string;
}

export function createPaymentReminderWorker(): Worker {
  const worker = new Worker(
    'payment-reminder',
    async (job: Job<PaymentReminderJobData>) => {
      logger.info(`[PaymentReminderJob] Processing job ${job.id}`);

      const now = new Date();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const filter: Record<string, unknown> = {
        dueDate: { $lt: now },
        status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] },
        isDeleted: false,
        $or: [
          { lastReminderSentAt: { $exists: false } },
          { lastReminderSentAt: null },
          { lastReminderSentAt: { $lt: oneDayAgo } },
        ],
      };

      if (job.data.schoolId) {
        filter.schoolId = job.data.schoolId;
      }

      const overdueInvoices = await Invoice.find(filter).limit(500).lean();

      logger.info(`[PaymentReminderJob] Found ${overdueInvoices.length} overdue invoices`);

      if (overdueInvoices.length === 0) {
        return { processedCount: 0 };
      }

      // Batch-fetch all students to avoid N+1 queries
      const studentIds = [...new Set(overdueInvoices.map(i => i.studentId.toString()))];
      const students = await Student.find({ _id: { $in: studentIds } })
        .populate('userId', 'firstName lastName email')
        .lean();
      const studentMap = new Map(students.map(s => [s._id.toString(), s]));

      const notifications: Array<{
        recipientId: unknown;
        schoolId: unknown;
        type: string;
        title: string;
        message: string;
        data: Record<string, unknown>;
      }> = [];
      const invoiceIdsToUpdate: mongoose.Types.ObjectId[] = [];

      for (const invoice of overdueInvoices) {
        const student = studentMap.get(invoice.studentId.toString());
        if (!student) continue;

        notifications.push({
          recipientId: student.userId,
          schoolId: invoice.schoolId,
          type: 'in_app',
          title: 'Payment Reminder',
          message: `Invoice ${invoice.invoiceNumber} for R${(invoice.totalAmount / 100).toFixed(2)} is overdue. Due date was ${invoice.dueDate.toLocaleDateString()}.`,
          data: {
            invoiceId: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.totalAmount,
            dueDate: invoice.dueDate,
          },
        });

        invoiceIdsToUpdate.push(invoice._id as mongoose.Types.ObjectId);
      }

      // Batch-insert notifications and batch-update invoices
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        await Invoice.updateMany(
          { _id: { $in: invoiceIdsToUpdate } },
          { $set: { lastReminderSentAt: now } },
        );
      }

      logger.info(`[PaymentReminderJob] Created ${notifications.length} notifications`);
      return { processedCount: overdueInvoices.length };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    logger.info(`[PaymentReminderJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[PaymentReminderJob] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}

export async function schedulePaymentReminders(): Promise<void> {
  await paymentReminderQueue.upsertJobScheduler(
    'daily-payment-reminder',
    { pattern: '0 8 * * *' }, // Every day at 08:00
    {
      name: 'payment-reminder',
      data: {},
    },
  );

  logger.info('[PaymentReminderJob] Scheduled daily payment reminders at 08:00');
}
