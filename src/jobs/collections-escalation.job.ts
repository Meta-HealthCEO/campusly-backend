import { Worker, Job } from 'bullmq';
import { redisConnection, collectionsEscalationQueue } from './queues.js';
import { Invoice } from '../modules/Fee/model.js';
import { CollectionAction } from '../modules/Fee/model.js';
import { Notification } from '../modules/Notification/model.js';
import { Student } from '../modules/Student/model.js';
import { InvoiceStatus } from '../common/enums.js';
import type { CollectionStage } from '../modules/Fee/model.js';

interface CollectionsEscalationJobData {
  schoolId?: string;
}

const ESCALATION_RULES: Array<{
  fromStage: CollectionStage | undefined;
  toStage: CollectionStage;
  daysOverdue: number;
}> = [
  { fromStage: undefined, toStage: 'friendly_reminder', daysOverdue: 7 },
  { fromStage: 'friendly_reminder', toStage: 'warning_letter', daysOverdue: 30 },
  { fromStage: 'warning_letter', toStage: 'final_demand', daysOverdue: 60 },
  { fromStage: 'final_demand', toStage: 'legal_handover', daysOverdue: 90 },
];

export function createCollectionsEscalationWorker(): Worker {
  const worker = new Worker(
    'collections-escalation',
    async (job: Job<CollectionsEscalationJobData>) => {
      console.log(`[CollectionsEscalationJob] Processing job ${job.id}`);

      const now = new Date();
      let escalatedCount = 0;

      for (const rule of ESCALATION_RULES) {
        const cutoffDate = new Date(now.getTime() - rule.daysOverdue * 24 * 60 * 60 * 1000);

        const filter: Record<string, unknown> = {
          isDeleted: false,
          status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
          dueDate: { $lt: cutoffDate },
          collectionStage: rule.fromStage ?? { $exists: false },
        };

        if (rule.fromStage === undefined) {
          filter.$or = [
            { collectionStage: { $exists: false } },
            { collectionStage: null },
          ];
          delete filter.collectionStage;
        }

        if (job.data.schoolId) {
          filter.schoolId = job.data.schoolId;
        }

        const invoices = await Invoice.find(filter).limit(200);

        for (const invoice of invoices) {
          invoice.collectionStage = rule.toStage;
          invoice.status = InvoiceStatus.OVERDUE;
          await invoice.save();

          await CollectionAction.create({
            studentId: invoice.studentId,
            schoolId: invoice.schoolId,
            invoiceId: invoice._id,
            stage: rule.toStage,
            scheduledDate: now,
            sentDate: now,
            sentVia: 'system_auto',
            notes: `Auto-escalated to ${rule.toStage} (${rule.daysOverdue}+ days overdue)`,
          });

          const student = await Student.findById(invoice.studentId)
            .populate('userId', 'firstName lastName email');

          if (student) {
            await Notification.create({
              recipientId: student.userId,
              schoolId: invoice.schoolId,
              type: 'in_app',
              title: 'Collections Notice',
              message: `Invoice ${invoice.invoiceNumber} has been escalated to ${rule.toStage.replace(/_/g, ' ')}. Outstanding: R${((invoice.totalAmount - invoice.paidAmount) / 100).toFixed(2)}.`,
              data: {
                invoiceId: invoice._id,
                invoiceNumber: invoice.invoiceNumber,
                stage: rule.toStage,
              },
            });
          }

          escalatedCount++;
        }
      }

      console.log(`[CollectionsEscalationJob] Escalated ${escalatedCount} invoices`);
      return { escalatedCount };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    console.log(`[CollectionsEscalationJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[CollectionsEscalationJob] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

export async function scheduleCollectionsEscalation(): Promise<void> {
  await collectionsEscalationQueue.upsertJobScheduler(
    'daily-collections-escalation',
    { pattern: '0 9 * * *' }, // Every day at 09:00
    {
      name: 'collections-escalation',
      data: {},
    },
  );

  console.log('[CollectionsEscalationJob] Scheduled daily collections escalation at 09:00');
}
