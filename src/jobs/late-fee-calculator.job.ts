import type { AnyBulkWriteOperation } from 'mongoose';
import { logger } from '../common/logger.js';
import { Worker, Job } from 'bullmq';
import { redisConnection, lateFeeCalculatorQueue } from './queues.js';
import { Invoice, type IInvoice } from '../modules/Fee/model.js';
import { AccountLedger } from '../modules/Fee/model.js';
import { InvoiceStatus } from '../common/enums.js';

interface LateFeeCalculatorJobData {
  schoolId?: string;
  lateFeePercentage?: number;
}

const DEFAULT_LATE_FEE_PERCENTAGE = 2; // 2% per month

export function createLateFeeCalculatorWorker(): Worker {
  const worker = new Worker(
    'late-fee-calculator',
    async (job: Job<LateFeeCalculatorJobData>) => {
      logger.info(`[LateFeeCalculatorJob] Processing job ${job.id}`);

      const percentage = job.data.lateFeePercentage ?? DEFAULT_LATE_FEE_PERCENTAGE;
      const now = new Date();

      // Idempotency: only apply late fees to invoices not already processed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filter: Record<string, unknown> = {
        isDeleted: false,
        status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
        dueDate: { $lt: now },
        $or: [
          { lastLateFeeDate: { $exists: false } },
          { lastLateFeeDate: null },
          { lastLateFeeDate: { $lt: today } },
        ],
      };

      if (job.data.schoolId) {
        filter.schoolId = job.data.schoolId;
      }

      const overdueInvoices = await Invoice.find(filter).limit(500);

      const bulkOps: AnyBulkWriteOperation<IInvoice>[] = [];
      const ledgerDocs: {
        parentId: unknown;
        studentId: unknown;
        schoolId: unknown;
        type: string;
        amount: number;
        runningBalance: number;
        reference: string;
        description: string;
        relatedInvoiceId: unknown;
      }[] = [];

      for (const invoice of overdueInvoices) {
        const outstanding = invoice.totalAmount - invoice.paidAmount - (invoice.writeOffAmount ?? 0);
        const lateFee = Math.round(outstanding * (percentage / 100));

        if (lateFee <= 0) continue;

        const newTotal = invoice.totalAmount + lateFee;

        bulkOps.push({
          updateOne: {
            filter: { _id: invoice._id },
            update: {
              $inc: { lateFeeAmount: lateFee, totalAmount: lateFee },
              $set: { status: InvoiceStatus.OVERDUE, lastLateFeeDate: today },
            },
          },
        });

        ledgerDocs.push({
          parentId: invoice.studentId,
          studentId: invoice.studentId,
          schoolId: invoice.schoolId,
          type: 'interest',
          amount: lateFee,
          runningBalance: newTotal - invoice.paidAmount - (invoice.writeOffAmount ?? 0),
          reference: invoice.invoiceNumber,
          description: `Late fee: ${percentage}% on R${(outstanding / 100).toFixed(2)} outstanding`,
          relatedInvoiceId: invoice._id,
        });
      }

      if (bulkOps.length > 0) {
        await Invoice.bulkWrite(bulkOps);
      }

      if (ledgerDocs.length > 0) {
        await AccountLedger.insertMany(ledgerDocs);
      }

      const processedCount = bulkOps.length;
      const totalLateFees = ledgerDocs.reduce((sum, l) => sum + l.amount, 0);

      logger.info(`[LateFeeCalculatorJob] Applied late fees to ${processedCount} invoices, total: R${(totalLateFees / 100).toFixed(2)}`);
      return { processedCount, totalLateFees };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    logger.info(`[LateFeeCalculatorJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[LateFeeCalculatorJob] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}

export async function scheduleLateFeeCalculation(): Promise<void> {
  await lateFeeCalculatorQueue.upsertJobScheduler(
    'monthly-late-fee-calculation',
    { pattern: '0 2 1 * *' }, // 1st of each month at 02:00
    {
      name: 'late-fee-calculator',
      data: {},
    },
  );

  logger.info('[LateFeeCalculatorJob] Scheduled monthly late fee calculation on the 1st at 02:00');
}
