import { logger } from '../common/logger.js';
import mongoose, { type AnyBulkWriteOperation } from 'mongoose';
import { Worker, Job } from 'bullmq';
import { redisConnection, collectionsEscalationQueue } from './queues.js';
import { Invoice, type IInvoice } from '../modules/Fee/model.js';
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
      logger.info(`[CollectionsEscalationJob] Processing job ${job.id}`);

      const now = new Date();
      let escalatedCount = 0;

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
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

          const invoices = await Invoice.find(filter).limit(200).session(session);

          if (invoices.length === 0) continue;

          // Batch-fetch all students for this rule's invoices to avoid N+1
          const invoiceStudentIds = [...new Set(invoices.map(i => i.studentId.toString()))];
          const ruleStudents = await Student.find({ _id: { $in: invoiceStudentIds } })
            .populate('userId', 'firstName lastName email')
            .session(session)
            .lean();
          const ruleStudentMap = new Map(ruleStudents.map(s => [s._id.toString(), s]));

          // Batch update invoices
          const invoiceBulkOps: AnyBulkWriteOperation<IInvoice>[] = invoices.map(inv => ({
            updateOne: {
              filter: { _id: inv._id },
              update: {
                $set: { collectionStage: rule.toStage, status: InvoiceStatus.OVERDUE },
              },
            },
          }));
          await Invoice.bulkWrite(invoiceBulkOps, { session });

          // Batch create collection actions
          const actionDocs = invoices.map(inv => ({
            studentId: inv.studentId,
            schoolId: inv.schoolId,
            invoiceId: inv._id,
            stage: rule.toStage,
            scheduledDate: now,
            sentDate: now,
            sentVia: 'system_auto',
            notes: `Auto-escalated to ${rule.toStage} (${rule.daysOverdue}+ days overdue)`,
          }));
          await CollectionAction.insertMany(actionDocs, { session });

          // Batch create notifications
          const notificationDocs = invoices
            .map(inv => {
              const student = ruleStudentMap.get(inv.studentId.toString());
              if (!student) return null;
              return {
                recipientId: student.userId,
                schoolId: inv.schoolId,
                type: 'in_app' as const,
                title: 'Collections Notice',
                message: `Invoice ${inv.invoiceNumber} has been escalated to ${rule.toStage.replace(/_/g, ' ')}. Outstanding: R${((inv.totalAmount - inv.paidAmount - (inv.writeOffAmount ?? 0)) / 100).toFixed(2)}.`,
                data: {
                  invoiceId: inv._id,
                  invoiceNumber: inv.invoiceNumber,
                  stage: rule.toStage,
                },
              };
            })
            .filter((doc): doc is NonNullable<typeof doc> => doc !== null);

          if (notificationDocs.length > 0) {
            await Notification.insertMany(notificationDocs, { session });
          }

          escalatedCount += invoices.length;
        }

        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }

      logger.info(`[CollectionsEscalationJob] Escalated ${escalatedCount} invoices`);
      return { escalatedCount };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    logger.info(`[CollectionsEscalationJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[CollectionsEscalationJob] Job ${job?.id} failed: ${err.message}`);
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

  logger.info('[CollectionsEscalationJob] Scheduled daily collections escalation at 09:00');
}
