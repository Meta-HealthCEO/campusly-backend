import crypto from 'crypto';
import mongoose from 'mongoose';
import { Invoice, Payment, FeeExemption, PaymentArrangement, AccountLedger } from '../model.js';
import { InvoiceStatus } from '../../../common/enums.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';
import { paginationHelper } from '../../../common/utils.js';
import type {
  RecordPaymentInput,
  CreateDebitOrderInput,
  UpdateDebitOrderInput,
  CreateFeeExemptionInput,
  CreatePaymentArrangementInput,
} from '../validation.js';
import { DebitOrder } from '../model.js';

export class PaymentService {
  // ─── Payment ───────────────────────────────────────────────────────────────

  static async recordPayment(
    invoiceId: string,
    data: RecordPaymentInput,
    recordedBy: string,
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const invoice = await Invoice.findOne({
        _id: invoiceId,
        isDeleted: false,
      }).session(session);

      if (!invoice) {
        throw new NotFoundError('Invoice not found');
      }

      if (invoice.status === InvoiceStatus.PAID) {
        throw new BadRequestError('Invoice is already fully paid');
      }

      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new BadRequestError('Cannot pay a cancelled invoice');
      }

      const payment = await Payment.create(
        [
          {
            invoiceId: invoice._id,
            studentId: invoice.studentId,
            schoolId: invoice.schoolId,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            reference: data.reference,
            notes: data.notes,
            recordedBy,
          },
        ],
        { session },
      );

      await Invoice.findByIdAndUpdate(
        invoice._id,
        { $inc: { paidAmount: data.amount } },
        { session },
      );

      const updatedInvoice = await Invoice.findById(invoice._id).session(session);
      if (!updatedInvoice) {
        throw new NotFoundError('Invoice not found after update');
      }

      updatedInvoice.status =
        (updatedInvoice.paidAmount + updatedInvoice.discountAmount + updatedInvoice.writeOffAmount) >= updatedInvoice.totalAmount
          ? InvoiceStatus.PAID
          : InvoiceStatus.PARTIAL;
      await updatedInvoice.save({ session });

      await session.commitTransaction();
      return { payment: payment[0], invoice: updatedInvoice };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getPayments(invoiceId: string) {
    return Payment.find({ invoiceId, isDeleted: false }).sort({ createdAt: -1 }).lean();
  }

  // ─── Late Fee Calculation ───────────────────────────────────────────────────

  static async calculateLateFees(schoolId: string, lateFeePercentage: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueInvoices = await Invoice.find({
      schoolId,
      isDeleted: false,
      status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
      dueDate: { $lt: new Date() },
    });

    const results: Array<{ invoiceId: mongoose.Types.ObjectId; lateFee: number }> = [];
    const bulkOps: Array<{
      updateOne: {
        filter: { _id: mongoose.Types.ObjectId };
        update: { $inc: { lateFeeAmount: number; totalAmount: number }; $set: { status: InvoiceStatus; lastLateFeeDate: Date } };
      };
    }> = [];
    const ledgerEntries: Array<{
      parentId: mongoose.Types.ObjectId;
      studentId: mongoose.Types.ObjectId;
      schoolId: mongoose.Types.ObjectId;
      type: string;
      amount: number;
      runningBalance: number;
      reference: string;
      description: string;
      relatedInvoiceId: mongoose.Types.ObjectId;
    }> = [];

    for (const invoice of overdueInvoices) {
      const outstanding = invoice.totalAmount - invoice.paidAmount - (invoice.discountAmount ?? 0) - (invoice.writeOffAmount ?? 0);
      const lateFee = Math.round(outstanding * (lateFeePercentage / 100));

      if (lateFee > 0) {
        bulkOps.push({
          updateOne: {
            filter: { _id: invoice._id },
            update: {
              $inc: { lateFeeAmount: lateFee, totalAmount: lateFee },
              $set: { status: InvoiceStatus.OVERDUE, lastLateFeeDate: today },
            },
          },
        });

        ledgerEntries.push({
          parentId: invoice.studentId,
          studentId: invoice.studentId,
          schoolId: invoice.schoolId,
          type: 'interest',
          amount: lateFee,
          runningBalance: (invoice.totalAmount + lateFee) - invoice.paidAmount - (invoice.writeOffAmount ?? 0),
          reference: invoice.invoiceNumber,
          description: `Late fee: ${lateFeePercentage}% on outstanding balance`,
          relatedInvoiceId: invoice._id,
        });

        results.push({
          invoiceId: invoice._id,
          lateFee,
        });
      }
    }

    if (bulkOps.length > 0) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        await Invoice.bulkWrite(bulkOps, { session });
        if (ledgerEntries.length > 0) {
          await AccountLedger.insertMany(ledgerEntries, { session });
        }
        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    }

    return { processed: results.length, results };
  }

  // ─── Allocate Payment ───────────────────────────────────────────────────────

  static async allocatePayment(
    studentId: string,
    data: RecordPaymentInput,
    recordedBy: string,
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let remaining = data.amount;

      const invoices = await Invoice.find({
        studentId,
        isDeleted: false,
        status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
      })
        .sort({ dueDate: 1 })
        .session(session);

      if (invoices.length === 0) {
        throw new BadRequestError('No outstanding invoices found for this student');
      }

      const allocations: Array<{ invoiceId: unknown; amount: number }> = [];

      for (const invoice of invoices) {
        if (remaining <= 0) break;

        const outstanding = invoice.totalAmount - invoice.paidAmount - (invoice.discountAmount ?? 0) - (invoice.writeOffAmount ?? 0);
        const allocation = Math.min(remaining, outstanding);

        const rcptSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();

        await Payment.create(
          [
            {
              invoiceId: invoice._id,
              studentId: invoice.studentId,
              schoolId: invoice.schoolId,
              amount: allocation,
              paymentMethod: data.paymentMethod,
              reference: data.reference,
              notes: data.notes,
              receiptNumber: `RCP-${Date.now()}-${rcptSuffix}`,
              paymentDate: new Date(),
              recordedBy,
            },
          ],
          { session },
        );

        const newPaidAmount = invoice.paidAmount + allocation;
        const newStatus =
          (newPaidAmount + (invoice.discountAmount ?? 0) + (invoice.writeOffAmount ?? 0)) >= invoice.totalAmount
            ? InvoiceStatus.PAID
            : InvoiceStatus.PARTIAL;

        await Invoice.findByIdAndUpdate(
          invoice._id,
          {
            $inc: { paidAmount: allocation },
            $set: { status: newStatus },
          },
          { session },
        );

        allocations.push({
          invoiceId: invoice._id,
          amount: allocation,
        });

        remaining -= allocation;
      }

      await session.commitTransaction();
      return { allocations, remainingCredit: remaining };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ─── Debit Order ──────────────────────────────────────────────────────────

  static async createDebitOrder(data: CreateDebitOrderInput) {
    return DebitOrder.create(data);
  }

  static async listDebitOrders(
    schoolId: string,
    query: { page?: number; limit?: number },
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter = { schoolId, isDeleted: false };

    const [debitOrders, total] = await Promise.all([
      DebitOrder.find(filter)
        .populate('studentId', 'admissionNumber userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DebitOrder.countDocuments(filter),
    ]);

    return { debitOrders, total, page: query.page ?? 1, limit };
  }

  static async getDebitOrder(id: string) {
    const debitOrder = await DebitOrder.findOne({ _id: id, isDeleted: false }).lean();
    if (!debitOrder) {
      throw new NotFoundError('Debit order not found');
    }
    return debitOrder;
  }

  static async updateDebitOrder(id: string, data: UpdateDebitOrderInput) {
    const debitOrder = await DebitOrder.findOneAndUpdate(
      { _id: id, isDeleted: false },
      data,
      { new: true },
    );
    if (!debitOrder) {
      throw new NotFoundError('Debit order not found');
    }
    return debitOrder;
  }

  static async deleteDebitOrder(id: string) {
    const debitOrder = await DebitOrder.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );
    if (!debitOrder) {
      throw new NotFoundError('Debit order not found');
    }
    return debitOrder;
  }

  // ─── Payment Arrangement ────────────────────────────────────────────────────

  static async createPaymentArrangement(data: CreatePaymentArrangementInput) {
    const startDate = new Date(data.startDate);
    const instalments: Array<{
      dueDate: Date;
      amount: number;
      paidAmount: number;
      status: 'pending';
    }> = [];

    for (let i = 0; i < data.numberOfInstalments; i++) {
      const dueDate = new Date(startDate);
      if (data.frequency === 'monthly') {
        dueDate.setMonth(dueDate.getMonth() + i);
      } else {
        dueDate.setDate(dueDate.getDate() + i * 7);
      }
      instalments.push({
        dueDate,
        amount: data.instalmentAmount,
        paidAmount: 0,
        status: 'pending',
      });
    }

    return PaymentArrangement.create({
      studentId: data.studentId,
      schoolId: data.schoolId,
      totalOutstanding: data.totalOutstanding,
      instalmentAmount: data.instalmentAmount,
      numberOfInstalments: data.numberOfInstalments,
      frequency: data.frequency,
      startDate,
      nextPaymentDate: startDate,
      remainingInstalments: data.numberOfInstalments,
      instalments,
    });
  }

  static async listPaymentArrangements(
    schoolId: string,
    query: { page?: number; limit?: number; status?: string },
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.status) filter.status = query.status;

    const [arrangements, total] = await Promise.all([
      PaymentArrangement.find(filter)
        .populate('studentId', 'admissionNumber userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaymentArrangement.countDocuments(filter),
    ]);

    return { arrangements, total, page: query.page ?? 1, limit };
  }

  // ─── Fee Exemption ──────────────────────────────────────────────────────────

  static async createFeeExemption(data: CreateFeeExemptionInput, approvedBy: string) {
    return FeeExemption.create({
      ...data,
      validFrom: new Date(data.validFrom),
      validTo: new Date(data.validTo),
      approvedBy,
    });
  }

  static async listFeeExemptions(
    schoolId: string,
    query: { page?: number; limit?: number; status?: string },
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.status) filter.status = query.status;

    const [exemptions, total] = await Promise.all([
      FeeExemption.find(filter)
        .populate('studentId', 'admissionNumber userId')
        .populate('feeTypeId', 'name amount category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FeeExemption.countDocuments(filter),
    ]);

    return { exemptions, total, page: query.page ?? 1, limit };
  }
}
