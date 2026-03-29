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
      console.log(`[PaymentReminderJob] Processing job ${job.id}`);

      const now = new Date();

      const filter: Record<string, unknown> = {
        dueDate: { $lt: now },
        status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] },
        isDeleted: false,
      };

      if (job.data.schoolId) {
        filter.schoolId = job.data.schoolId;
      }

      const overdueInvoices = await Invoice.find(filter)
        .populate('studentId')
        .limit(500);

      console.log(`[PaymentReminderJob] Found ${overdueInvoices.length} overdue invoices`);

      for (const invoice of overdueInvoices) {
        const student = await Student.findById(invoice.studentId)
          .populate('userId', 'firstName lastName email');

        if (!student) continue;

        await Notification.create({
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

        console.log(`[PaymentReminderJob] Notification created for invoice ${invoice.invoiceNumber}`);
      }

      return { processedCount: overdueInvoices.length };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    console.log(`[PaymentReminderJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[PaymentReminderJob] Job ${job?.id} failed:`, err.message);
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

  console.log('[PaymentReminderJob] Scheduled daily payment reminders at 08:00');
}
