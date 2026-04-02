import mongoose from 'mongoose';
import crypto from 'crypto';
import { BookLoan, LibraryFineConfig } from './model.js';
import { Invoice } from '../Fee/model.js';
import { NotFoundError } from '../../common/errors.js';
import { InvoiceStatus } from '../../common/enums.js';

export interface OverdueFineEntry {
  loanId: string;
  studentId: string;
  studentName: string;
  bookTitle: string;
  dueDate: string;
  daysOverdue: number;
  fineAmountCents: number;
  fineInvoiceId?: string;
}

export interface GenerateInvoicesResult {
  generatedCount: number;
  totalAmountCents: number;
}

export class LibraryFineService {
  static async calculateFines(schoolId: string): Promise<OverdueFineEntry[]> {
    const config = await LibraryFineConfig.findOne({ schoolId, isDeleted: false }).lean();
    const finePerDayCents = config?.finePerDayCents ?? 200;
    const maxFineCents = config?.maxFineCents;

    const now = new Date();
    const overdueLoans = await BookLoan.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      status: { $in: ['issued', 'overdue'] },
      dueDate: { $lt: now },
      isDeleted: false,
    })
      .populate('bookId', 'title author')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .lean();

    return overdueLoans.map((loan) => {
      const dueDate = new Date(loan.dueDate);
      const daysOverdue = Math.max(1, Math.floor((now.getTime() - dueDate.getTime()) / 86_400_000));
      let fineAmountCents = daysOverdue * finePerDayCents;
      if (maxFineCents !== undefined && fineAmountCents > maxFineCents) {
        fineAmountCents = maxFineCents;
      }

      const book = loan.bookId as unknown as { _id: string; title: string; author: string } | null;
      const student = loan.studentId as unknown as {
        _id: string;
        userId?: { firstName?: string; lastName?: string };
      } | null;

      const firstName = student?.userId?.firstName ?? 'Unknown';
      const lastName = student?.userId?.lastName ?? '';

      return {
        loanId: String(loan._id),
        studentId: String(student?._id ?? loan.studentId),
        studentName: `${firstName} ${lastName}`.trim(),
        bookTitle: book?.title ?? 'Unknown Book',
        dueDate: dueDate.toISOString(),
        daysOverdue,
        fineAmountCents,
        fineInvoiceId: loan.fineInvoiceId ? String(loan.fineInvoiceId) : undefined,
      };
    });
  }

  static async generateFineInvoices(
    schoolId: string,
    finePerDayCentsOverride?: number,
  ): Promise<GenerateInvoicesResult> {
    const config = await LibraryFineConfig.findOne({ schoolId, isDeleted: false }).lean();
    const finePerDayCents = finePerDayCentsOverride ?? config?.finePerDayCents ?? 200;
    const maxFineCents = config?.maxFineCents;
    const now = new Date();

    // Find overdue loans without a linked fine invoice
    const overdueLoans = await BookLoan.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      status: { $in: ['issued', 'overdue'] },
      dueDate: { $lt: now },
      fineInvoiceId: { $exists: false },
      isDeleted: false,
    })
      .populate('bookId', 'title')
      .lean();

    if (overdueLoans.length === 0) {
      return { generatedCount: 0, totalAmountCents: 0 };
    }

    // We need a dummy feeScheduleId — find or note the first schedule
    // Since library fines aren't tied to a schedule, we create a sentinel placeholder
    let generatedCount = 0;
    let totalAmountCents = 0;

    for (const loan of overdueLoans) {
      const dueDate = new Date(loan.dueDate);
      const daysOverdue = Math.max(1, Math.floor((now.getTime() - dueDate.getTime()) / 86_400_000));
      let fineAmountCents = daysOverdue * finePerDayCents;
      if (maxFineCents !== undefined && fineAmountCents > maxFineCents) {
        fineAmountCents = maxFineCents;
      }

      const book = loan.bookId as unknown as { _id: string; title: string } | null;
      const bookTitle = book?.title ?? 'Unknown Book';

      const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
      const invoiceNumber = `LIB-FINE-${Date.now()}-${suffix}`;

      const invoice = await Invoice.create({
        invoiceNumber,
        studentId: loan.studentId,
        schoolId: loan.schoolId,
        feeScheduleId: loan.schoolId, // Sentinel — library fines have no schedule
        items: [
          {
            description: `Library fine: ${bookTitle} — ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`,
            amount: fineAmountCents,
          },
        ],
        totalAmount: fineAmountCents,
        dueDate: now,
        status: InvoiceStatus.PENDING,
      });

      // Link the invoice to the loan
      await BookLoan.updateOne(
        { _id: loan._id },
        { $set: { fineInvoiceId: invoice._id, fineAmount: fineAmountCents, status: 'overdue' } },
      );

      generatedCount++;
      totalAmountCents += fineAmountCents;
    }

    return { generatedCount, totalAmountCents };
  }

  static async getFineConfig(schoolId: string) {
    const config = await LibraryFineConfig.findOne({ schoolId, isDeleted: false }).lean();
    return config ?? { schoolId, finePerDayCents: 200, maxFineCents: undefined, exemptGrades: [] };
  }

  static async updateFineConfig(
    schoolId: string,
    data: { finePerDayCents?: number; maxFineCents?: number; exemptGrades?: string[] },
  ) {
    const config = await LibraryFineConfig.findOneAndUpdate(
      { schoolId },
      { $set: { ...data, schoolId, isDeleted: false } },
      { upsert: true, new: true, runValidators: true },
    );
    if (!config) throw new NotFoundError('Failed to update fine config');
    return config;
  }
}
