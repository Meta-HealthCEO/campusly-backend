import { Worker, Job } from 'bullmq';
import { redisConnection, lateFeeCalculatorQueue } from './queues.js';
import { Invoice } from '../modules/Fee/model.js';
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
      console.log(`[LateFeeCalculatorJob] Processing job ${job.id}`);

      const percentage = job.data.lateFeePercentage ?? DEFAULT_LATE_FEE_PERCENTAGE;
      const now = new Date();

      const filter: Record<string, unknown> = {
        isDeleted: false,
        status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
        dueDate: { $lt: now },
      };

      if (job.data.schoolId) {
        filter.schoolId = job.data.schoolId;
      }

      const overdueInvoices = await Invoice.find(filter).limit(500);

      let processedCount = 0;
      let totalLateFees = 0;

      for (const invoice of overdueInvoices) {
        const outstanding = invoice.totalAmount - invoice.paidAmount;
        const lateFee = Math.round(outstanding * (percentage / 100));

        if (lateFee <= 0) continue;

        invoice.lateFeeAmount += lateFee;
        invoice.totalAmount += lateFee;
        invoice.status = InvoiceStatus.OVERDUE;
        await invoice.save();

        // Record in account ledger
        await AccountLedger.create({
          parentId: invoice.studentId, // Resolved at query time
          studentId: invoice.studentId,
          schoolId: invoice.schoolId,
          type: 'interest',
          amount: lateFee,
          runningBalance: invoice.totalAmount - invoice.paidAmount,
          reference: invoice.invoiceNumber,
          description: `Late fee: ${percentage}% on R${(outstanding / 100).toFixed(2)} outstanding`,
          relatedInvoiceId: invoice._id,
        });

        processedCount++;
        totalLateFees += lateFee;
      }

      console.log(`[LateFeeCalculatorJob] Applied late fees to ${processedCount} invoices, total: R${(totalLateFees / 100).toFixed(2)}`);
      return { processedCount, totalLateFees };
    },
    { connection: redisConnection },
  );

  worker.on('completed', (job) => {
    console.log(`[LateFeeCalculatorJob] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[LateFeeCalculatorJob] Job ${job?.id} failed:`, err.message);
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

  console.log('[LateFeeCalculatorJob] Scheduled monthly late fee calculation on the 1st at 02:00');
}
