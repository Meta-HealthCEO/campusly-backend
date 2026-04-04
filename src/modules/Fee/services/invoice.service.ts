import crypto from 'crypto';
import mongoose from 'mongoose';
import { Invoice, CreditNote, AccountLedger, Payment } from '../model.js';
import { InvoiceStatus } from '../../../common/enums.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';
import { paginationHelper } from '../../../common/utils.js';
import type {
  CreateInvoiceInput,
  CreateCreditNoteInput,
  ApproveCreditNoteInput,
  BulkInvoiceInput,
  GenerateStatementInput,
  ApplyDiscountInput,
} from '../validation.js';
import { AuditLog } from '../../Audit/model.js';

export class InvoiceService {
  // ─── Invoice ───────────────────────────────────────────────────────────────

  static async createInvoice(data: CreateInvoiceInput) {
    const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0);

    const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const invoiceNumber = `INV-${Date.now()}-${suffix}`;

    return Invoice.create({
      invoiceNumber,
      studentId: data.studentId,
      schoolId: data.schoolId,
      feeScheduleId: data.feeScheduleId,
      items: data.items,
      totalAmount,
      dueDate: new Date(data.dueDate),
    });
  }

  static async listInvoices(
    schoolId: string,
    query: { page?: number; limit?: number; status?: string; studentId?: string },
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.status) {
      filter.status = query.status;
    }
    if (query.studentId) {
      filter.studentId = query.studentId;
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('studentId', 'admissionNumber userId gradeId classId')
        .populate('feeScheduleId', 'feeTypeId academicYear term dueDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    return { invoices, total, page: query.page ?? 1, limit };
  }

  static async getInvoice(id: string, schoolId: string) {
    const invoice = await Invoice.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('studentId', 'admissionNumber userId gradeId classId')
      .populate('feeScheduleId', 'feeTypeId academicYear term dueDate')
      .lean();
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }
    return invoice;
  }

  // ─── Overdue Invoices ──────────────────────────────────────────────────────

  static async getOverdueInvoices(schoolId: string) {
    return Invoice.find({
      schoolId,
      isDeleted: false,
      status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] },
      dueDate: { $lt: new Date() },
    })
      .populate('studentId', 'admissionNumber userId gradeId classId')
      .sort({ dueDate: 1 })
      .lean();
  }

  // ─── Student Balance ───────────────────────────────────────────────────────

  static async getStudentBalance(studentId: string) {
    const result = await Invoice.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          isDeleted: false,
          status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
        },
      },
      {
        $group: {
          _id: null,
          totalOwed: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDiscount: { $sum: '$discountAmount' },
          totalWrittenOff: { $sum: '$writeOffAmount' },
        },
      },
    ]);

    if (result.length === 0) {
      return { totalOwed: 0, totalPaid: 0, totalDiscount: 0, totalWrittenOff: 0, outstanding: 0 };
    }

    return {
      totalOwed: result[0].totalOwed,
      totalPaid: result[0].totalPaid,
      totalDiscount: result[0].totalDiscount,
      totalWrittenOff: result[0].totalWrittenOff,
      outstanding: result[0].totalOwed - result[0].totalPaid - result[0].totalDiscount - result[0].totalWrittenOff,
    };
  }

  // ─── Statement Generation ───────────────────────────────────────────────────

  static async generateStatement(data: GenerateStatementInput) {
    const fromDate = data.fromDate ? new Date(data.fromDate) : new Date(0);
    const toDate = data.toDate ? new Date(data.toDate) : new Date();

    const [invoices, payments, ledgerEntries, creditNotes] = await Promise.all([
      Invoice.find({
        studentId: data.studentId,
        schoolId: data.schoolId,
        isDeleted: false,
        createdAt: { $gte: fromDate, $lte: toDate },
      })
        .sort({ createdAt: 1 })
        .lean(),
      Payment.find({
        studentId: data.studentId,
        schoolId: data.schoolId,
        isDeleted: false,
        createdAt: { $gte: fromDate, $lte: toDate },
      })
        .sort({ createdAt: 1 })
        .lean(),
      AccountLedger.find({
        studentId: data.studentId,
        schoolId: data.schoolId,
        isDeleted: false,
        createdAt: { $gte: fromDate, $lte: toDate },
      })
        .sort({ createdAt: 1 })
        .lean(),
      CreditNote.find({
        studentId: data.studentId,
        schoolId: data.schoolId,
        isDeleted: false,
        status: 'approved',
        createdAt: { $gte: fromDate, $lte: toDate },
      })
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    const totalInvoiced = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    const totalCredits = creditNotes.reduce((s, c) => s + c.amount, 0);

    return {
      studentId: data.studentId,
      schoolId: data.schoolId,
      period: { from: fromDate, to: toDate },
      invoices,
      payments,
      creditNotes,
      ledgerEntries,
      summary: {
        totalInvoiced,
        totalPaid,
        totalCredits,
        outstanding: totalInvoiced - totalPaid - totalCredits,
      },
    };
  }

  // ─── Apply Discount ─────────────────────────────────────────────────────────

  static async applyDiscount(data: ApplyDiscountInput, schoolId: string, performedBy: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const invoice = await Invoice.findOne({ _id: data.invoiceId, schoolId, isDeleted: false }).session(session);
      if (!invoice) {
        throw new NotFoundError('Invoice not found');
      }

      const previousBalance = invoice.totalAmount - invoice.paidAmount - invoice.discountAmount - invoice.writeOffAmount;

      if (data.amount > previousBalance) {
        throw new BadRequestError('Discount amount cannot exceed outstanding balance');
      }

      await Invoice.findByIdAndUpdate(
        invoice._id,
        { $inc: { discountAmount: data.amount } },
        { session },
      );

      // Re-read to check if fully settled
      const updated = await Invoice.findById(invoice._id).session(session).lean();
      if (updated && (updated.paidAmount + updated.discountAmount + updated.writeOffAmount) >= updated.totalAmount) {
        await Invoice.findByIdAndUpdate(
          invoice._id,
          { $set: { status: InvoiceStatus.PAID } },
          { session },
        );
      }

      const newBalance = updated
        ? updated.totalAmount - updated.paidAmount - updated.discountAmount - updated.writeOffAmount
        : 0;

      await AccountLedger.create(
        [{
          parentId: invoice.studentId,
          studentId: invoice.studentId,
          schoolId: invoice.schoolId,
          type: 'discount',
          amount: data.amount,
          runningBalance: newBalance,
          reference: invoice.invoiceNumber,
          description: `Discount applied: ${data.reason}`,
          relatedInvoiceId: invoice._id,
        }],
        { session },
      );

      await AuditLog.create(
        [{
          userId: performedBy,
          schoolId: invoice.schoolId,
          action: 'FEE_DISCOUNT_APPLIED',
          entity: 'Invoice',
          entityId: (invoice._id as mongoose.Types.ObjectId).toString(),
          details: {
            amount: data.amount,
            reason: data.reason,
            previousBalance,
            newBalance,
          },
        }],
        { session },
      );

      await session.commitTransaction();

      const result = await Invoice.findById(invoice._id);
      if (!result) throw new NotFoundError('Invoice not found after update');
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ─── Bulk Invoice Generation ────────────────────────────────────────────────

  static async bulkInvoiceGeneration(data: BulkInvoiceInput) {
    const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0);
    const invoices: Array<Record<string, unknown>> = [];

    for (const studentId of data.studentIds) {
      const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
      invoices.push({
        invoiceNumber: `INV-${Date.now()}-${suffix}`,
        studentId,
        schoolId: data.schoolId,
        feeScheduleId: data.feeScheduleId,
        items: data.items,
        totalAmount,
        dueDate: new Date(data.dueDate),
      });
    }

    const created = await Invoice.insertMany(invoices);
    return { created: created.length, invoices: created };
  }

  // ─── Credit Note ────────────────────────────────────────────────────────────

  static async createCreditNote(data: CreateCreditNoteInput, schoolId: string) {
    const invoice = await Invoice.findOne({ _id: data.invoiceId, schoolId, isDeleted: false });
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    const cnSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();

    return CreditNote.create({
      invoiceId: data.invoiceId,
      studentId: data.studentId,
      schoolId: data.schoolId,
      amount: data.amount,
      reason: data.reason,
      creditNoteNumber: `CN-${Date.now()}-${cnSuffix}`,
    });
  }

  static async approveCreditNote(id: string, data: ApproveCreditNoteInput, schoolId: string, approvedBy: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const creditNote = await CreditNote.findOne({ _id: id, schoolId, isDeleted: false }).session(session);
      if (!creditNote) {
        throw new NotFoundError('Credit note not found');
      }

      if (creditNote.status !== 'pending') {
        throw new BadRequestError('Credit note has already been processed');
      }

      creditNote.status = data.status;
      creditNote.approvedBy = new mongoose.Types.ObjectId(approvedBy);
      await creditNote.save({ session });

      if (data.status === 'approved') {
        const invoice = await Invoice.findOne({
          _id: creditNote.invoiceId,
          isDeleted: false,
        }).session(session);

        if (!invoice) {
          throw new NotFoundError('Associated invoice not found or deleted');
        }

        await Invoice.findByIdAndUpdate(
          invoice._id,
          { $inc: { paidAmount: creditNote.amount } },
          { session },
        );

        // Re-read to check status
        const updated = await Invoice.findById(invoice._id).session(session).lean();
        if (updated && (updated.paidAmount + updated.discountAmount + updated.writeOffAmount) >= updated.totalAmount) {
          await Invoice.findByIdAndUpdate(
            invoice._id,
            { $set: { status: InvoiceStatus.PAID } },
            { session },
          );
        }
      }

      await session.commitTransaction();
      return creditNote;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async listCreditNotes(
    schoolId: string,
    query: { page?: number; limit?: number; status?: string },
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.status) filter.status = query.status;

    const [creditNotes, total] = await Promise.all([
      CreditNote.find(filter)
        .populate('invoiceId', 'invoiceNumber totalAmount paidAmount status')
        .populate('studentId', 'admissionNumber userId gradeId classId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CreditNote.countDocuments(filter),
    ]);

    return { creditNotes, total, page: query.page ?? 1, limit };
  }

  // ─── Parent Account Balance ─────────────────────────────────────────────────

  static async getParentAccountBalance(parentId: string, schoolId: string) {
    const latestLedger = await AccountLedger.findOne({
      parentId,
      schoolId,
      isDeleted: false,
    }).sort({ createdAt: -1 }).lean();

    const ledgerBalance = latestLedger?.runningBalance ?? 0;

    const totals = await Invoice.aggregate([
      {
        $match: {
          isDeleted: false,
          schoolId: new mongoose.Types.ObjectId(schoolId),
          status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      { $match: { 'student.parentId': new mongoose.Types.ObjectId(parentId) } },
      {
        $group: {
          _id: null,
          totalOwed: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDiscount: { $sum: '$discountAmount' },
          totalWrittenOff: { $sum: '$writeOffAmount' },
        },
      },
    ]);

    return {
      parentId,
      ledgerBalance,
      totalOwed: totals[0]?.totalOwed ?? 0,
      totalPaid: totals[0]?.totalPaid ?? 0,
      totalDiscount: totals[0]?.totalDiscount ?? 0,
      totalWrittenOff: totals[0]?.totalWrittenOff ?? 0,
      outstanding: (totals[0]?.totalOwed ?? 0) - (totals[0]?.totalPaid ?? 0) - (totals[0]?.totalDiscount ?? 0) - (totals[0]?.totalWrittenOff ?? 0),
    };
  }

  // ─── Account Ledger ─────────────────────────────────────────────────────────

  static async getAccountLedger(
    studentId: string,
    schoolId: string,
    query: { page?: number; limit?: number },
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const filter = { studentId, schoolId, isDeleted: false };

    const [entries, total] = await Promise.all([
      AccountLedger.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AccountLedger.countDocuments(filter),
    ]);

    return { entries, total, page: query.page ?? 1, limit };
  }
}
