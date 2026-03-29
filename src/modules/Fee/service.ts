import mongoose from 'mongoose';
import {
  FeeType,
  FeeSchedule,
  Invoice,
  Payment,
  DebitOrder,
  CreditNote,
  FeeExemption,
  PaymentArrangement,
  CollectionAction,
  AccountLedger,
} from './model.js';
import type { CollectionStage } from './model.js';
import { InvoiceStatus } from '../../common/enums.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type {
  CreateFeeTypeInput,
  UpdateFeeTypeInput,
  CreateFeeScheduleInput,
  UpdateFeeScheduleInput,
  CreateInvoiceInput,
  RecordPaymentInput,
  CreateDebitOrderInput,
  UpdateDebitOrderInput,
  CreateCreditNoteInput,
  ApproveCreditNoteInput,
  CreateFeeExemptionInput,
  CreatePaymentArrangementInput,
  EscalateCollectionInput,
  WriteOffDebtInput,
  ApplyDiscountInput,
  BulkInvoiceInput,
  GenerateStatementInput,
} from './validation.js';

export class FeeService {
  // ─── Fee Type ──────────────────────────────────────────────────────────────

  static async createFeeType(data: CreateFeeTypeInput) {
    return FeeType.create(data);
  }

  static async listFeeTypes(
    schoolId: string,
    query: { page?: number; limit?: number; category?: string },
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.category) {
      filter.category = query.category;
    }

    const [feeTypes, total] = await Promise.all([
      FeeType.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      FeeType.countDocuments(filter),
    ]);

    return { feeTypes, total, page: query.page ?? 1, limit };
  }

  static async getFeeType(id: string) {
    const feeType = await FeeType.findOne({ _id: id, isDeleted: false });
    if (!feeType) {
      throw new NotFoundError('Fee type not found');
    }
    return feeType;
  }

  static async updateFeeType(id: string, data: UpdateFeeTypeInput) {
    const feeType = await FeeType.findOneAndUpdate(
      { _id: id, isDeleted: false },
      data,
      { new: true },
    );
    if (!feeType) {
      throw new NotFoundError('Fee type not found');
    }
    return feeType;
  }

  static async deleteFeeType(id: string) {
    const feeType = await FeeType.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );
    if (!feeType) {
      throw new NotFoundError('Fee type not found');
    }
    return feeType;
  }

  // ─── Fee Schedule ──────────────────────────────────────────────────────────

  static async createFeeSchedule(data: CreateFeeScheduleInput) {
    return FeeSchedule.create({
      ...data,
      dueDate: new Date(data.dueDate),
    });
  }

  static async listFeeSchedules(
    schoolId: string,
    query: { page?: number; limit?: number; academicYear?: number },
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.academicYear) {
      filter.academicYear = query.academicYear;
    }

    const [schedules, total] = await Promise.all([
      FeeSchedule.find(filter)
        .populate('feeTypeId')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FeeSchedule.countDocuments(filter),
    ]);

    return { schedules, total, page: query.page ?? 1, limit };
  }

  static async getFeeSchedule(id: string) {
    const schedule = await FeeSchedule.findOne({ _id: id, isDeleted: false }).populate(
      'feeTypeId',
    );
    if (!schedule) {
      throw new NotFoundError('Fee schedule not found');
    }
    return schedule;
  }

  static async updateFeeSchedule(id: string, data: UpdateFeeScheduleInput) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    const schedule = await FeeSchedule.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true },
    );
    if (!schedule) {
      throw new NotFoundError('Fee schedule not found');
    }
    return schedule;
  }

  static async deleteFeeSchedule(id: string) {
    const schedule = await FeeSchedule.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );
    if (!schedule) {
      throw new NotFoundError('Fee schedule not found');
    }
    return schedule;
  }

  // ─── Invoice ───────────────────────────────────────────────────────────────

  static async createInvoice(data: CreateInvoiceInput) {
    const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0);

    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const random = String(Math.floor(1000 + Math.random() * 9000));
    const invoiceNumber = `INV-${datePart}-${random}`;

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
        .populate('studentId')
        .populate('feeScheduleId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    return { invoices, total, page: query.page ?? 1, limit };
  }

  static async getInvoice(id: string) {
    const invoice = await Invoice.findOne({ _id: id, isDeleted: false })
      .populate('studentId')
      .populate('feeScheduleId');
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }
    return invoice;
  }

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

      invoice.paidAmount += data.amount;
      invoice.status =
        invoice.paidAmount >= invoice.totalAmount
          ? InvoiceStatus.PAID
          : InvoiceStatus.PARTIAL;

      await invoice.save({ session });

      await session.commitTransaction();
      return { payment: payment[0], invoice };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getPayments(invoiceId: string) {
    return Payment.find({ invoiceId, isDeleted: false }).sort({ createdAt: -1 });
  }

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
        },
      },
    ]);

    if (result.length === 0) {
      return { totalOwed: 0, totalPaid: 0, outstanding: 0 };
    }

    return {
      totalOwed: result[0].totalOwed,
      totalPaid: result[0].totalPaid,
      outstanding: result[0].totalOwed - result[0].totalPaid,
    };
  }

  // ─── Overdue Invoices ──────────────────────────────────────────────────────

  static async getOverdueInvoices(schoolId: string) {
    return Invoice.find({
      schoolId,
      isDeleted: false,
      status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] },
      dueDate: { $lt: new Date() },
    })
      .populate('studentId')
      .sort({ dueDate: 1 });
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
        .populate('studentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      DebitOrder.countDocuments(filter),
    ]);

    return { debitOrders, total, page: query.page ?? 1, limit };
  }

  static async getDebitOrder(id: string) {
    const debitOrder = await DebitOrder.findOne({ _id: id, isDeleted: false });
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

  // ─── Debtors Report ─────────────────────────────────────────────────────────

  static async getDebtorsReport(
    schoolId: string,
    query: { page?: number; limit?: number; minAge?: number },
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const now = new Date();
    const minAgeDays = query.minAge ?? 0;
    const cutoffDate = new Date(now.getTime() - minAgeDays * 24 * 60 * 60 * 1000);

    const filter: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
      status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
      dueDate: { $lte: cutoffDate },
    };

    const [debtors, total] = await Promise.all([
      Invoice.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$studentId',
            totalOwed: { $sum: '$totalAmount' },
            totalPaid: { $sum: '$paidAmount' },
            totalLateFees: { $sum: '$lateFeeAmount' },
            invoiceCount: { $sum: 1 },
            oldestDueDate: { $min: '$dueDate' },
          },
        },
        {
          $addFields: {
            outstanding: { $subtract: ['$totalOwed', '$totalPaid'] },
            ageDays: {
              $dateDiff: { startDate: '$oldestDueDate', endDate: now, unit: 'day' },
            },
          },
        },
        { $sort: { outstanding: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'students',
            localField: '_id',
            foreignField: '_id',
            as: 'student',
          },
        },
        { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      ]),
      Invoice.aggregate([
        { $match: filter },
        { $group: { _id: '$studentId' } },
        { $count: 'total' },
      ]),
    ]);

    return {
      debtors,
      total: total[0]?.total ?? 0,
      page: query.page ?? 1,
      limit,
    };
  }

  // ─── Collection Escalation ──────────────────────────────────────────────────

  static async escalateCollection(
    data: EscalateCollectionInput,
    performedBy: string,
  ) {
    const invoice = await Invoice.findOne({ _id: data.invoiceId, isDeleted: false });
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    const action = await CollectionAction.create({
      studentId: invoice.studentId,
      schoolId: invoice.schoolId,
      invoiceId: data.invoiceId,
      stage: data.stage,
      scheduledDate: new Date(),
      sentDate: new Date(),
      sentVia: data.sentVia,
      notes: data.notes,
      performedBy,
    });

    invoice.collectionStage = data.stage as CollectionStage;
    await invoice.save();

    return { action, invoice };
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

  // ─── Late Fee Calculation ───────────────────────────────────────────────────

  static async calculateLateFees(schoolId: string, lateFeePercentage: number) {
    const overdueInvoices = await Invoice.find({
      schoolId,
      isDeleted: false,
      status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
      dueDate: { $lt: new Date() },
    });

    const results: Array<{ invoiceId: unknown; lateFee: number }> = [];

    for (const invoice of overdueInvoices) {
      const outstanding = invoice.totalAmount - invoice.paidAmount;
      const lateFee = Math.round(outstanding * (lateFeePercentage / 100));

      if (lateFee > 0) {
        invoice.lateFeeAmount += lateFee;
        invoice.totalAmount += lateFee;
        invoice.status = InvoiceStatus.OVERDUE;
        await invoice.save();

        results.push({
          invoiceId: invoice._id,
          lateFee,
        });
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

        const outstanding = invoice.totalAmount - invoice.paidAmount;
        const allocation = Math.min(remaining, outstanding);

        const now = new Date();
        const rcptRandom = String(Math.floor(1000 + Math.random() * 9000));
        const rcptDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

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
              receiptNumber: `RCP-${rcptDate}-${rcptRandom}`,
              paymentDate: new Date(),
              recordedBy,
            },
          ],
          { session },
        );

        invoice.paidAmount += allocation;
        invoice.status =
          invoice.paidAmount >= invoice.totalAmount
            ? InvoiceStatus.PAID
            : InvoiceStatus.PARTIAL;
        await invoice.save({ session });

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
        .populate('studentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaymentArrangement.countDocuments(filter),
    ]);

    return { arrangements, total, page: query.page ?? 1, limit };
  }

  // ─── Write Off Debt ─────────────────────────────────────────────────────────

  static async writeOffDebt(data: WriteOffDebtInput, performedBy: string) {
    const invoice = await Invoice.findOne({ _id: data.invoiceId, isDeleted: false });
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    const outstanding = invoice.totalAmount - invoice.paidAmount;
    if (data.amount > outstanding) {
      throw new BadRequestError('Write-off amount cannot exceed outstanding balance');
    }

    invoice.writeOffAmount += data.amount;
    invoice.writeOffDate = new Date();
    invoice.writeOffReason = data.reason;
    invoice.paidAmount += data.amount;
    invoice.collectionStage = 'write_off';

    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = InvoiceStatus.PAID;
    }

    await invoice.save();

    await CollectionAction.create({
      studentId: invoice.studentId,
      schoolId: invoice.schoolId,
      invoiceId: invoice._id,
      stage: 'write_off',
      scheduledDate: new Date(),
      sentDate: new Date(),
      notes: data.reason,
      performedBy,
    });

    return invoice;
  }

  // ─── Apply Discount ─────────────────────────────────────────────────────────

  static async applyDiscount(data: ApplyDiscountInput, performedBy: string) {
    const invoice = await Invoice.findOne({ _id: data.invoiceId, isDeleted: false });
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    if (data.amount > invoice.totalAmount - invoice.paidAmount) {
      throw new BadRequestError('Discount amount cannot exceed outstanding balance');
    }

    invoice.discountAmount += data.amount;
    invoice.totalAmount -= data.amount;

    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = InvoiceStatus.PAID;
    }

    await invoice.save();

    await AccountLedger.create({
      parentId: invoice.studentId, // Will be resolved at runtime
      studentId: invoice.studentId,
      schoolId: invoice.schoolId,
      type: 'discount',
      amount: data.amount,
      runningBalance: invoice.totalAmount - invoice.paidAmount,
      reference: invoice.invoiceNumber,
      description: `Discount applied: ${data.reason}`,
      relatedInvoiceId: invoice._id,
    });

    return invoice;
  }

  // ─── Parent Account Balance ─────────────────────────────────────────────────

  static async getParentAccountBalance(parentId: string, schoolId: string) {
    const latestLedger = await AccountLedger.findOne({
      parentId,
      schoolId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

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
        },
      },
    ]);

    return {
      parentId,
      ledgerBalance,
      totalOwed: totals[0]?.totalOwed ?? 0,
      totalPaid: totals[0]?.totalPaid ?? 0,
      outstanding: (totals[0]?.totalOwed ?? 0) - (totals[0]?.totalPaid ?? 0),
    };
  }

  // ─── Bulk Invoice Generation ────────────────────────────────────────────────

  static async bulkInvoiceGeneration(data: BulkInvoiceInput) {
    const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0);
    const invoices: Array<Record<string, unknown>> = [];

    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    for (const studentId of data.studentIds) {
      const random = String(Math.floor(1000 + Math.random() * 9000));
      invoices.push({
        invoiceNumber: `INV-${datePart}-${random}`,
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

  static async createCreditNote(data: CreateCreditNoteInput) {
    const invoice = await Invoice.findOne({ _id: data.invoiceId, isDeleted: false });
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const random = String(Math.floor(1000 + Math.random() * 9000));

    return CreditNote.create({
      invoiceId: data.invoiceId,
      studentId: data.studentId,
      schoolId: data.schoolId,
      amount: data.amount,
      reason: data.reason,
      creditNoteNumber: `CN-${datePart}-${random}`,
    });
  }

  static async approveCreditNote(id: string, data: ApproveCreditNoteInput, approvedBy: string) {
    const creditNote = await CreditNote.findOne({ _id: id, isDeleted: false });
    if (!creditNote) {
      throw new NotFoundError('Credit note not found');
    }

    if (creditNote.status !== 'pending') {
      throw new BadRequestError('Credit note has already been processed');
    }

    creditNote.status = data.status;
    creditNote.approvedBy = new mongoose.Types.ObjectId(approvedBy);
    await creditNote.save();

    if (data.status === 'approved') {
      const invoice = await Invoice.findById(creditNote.invoiceId);
      if (invoice) {
        invoice.paidAmount += creditNote.amount;
        if (invoice.paidAmount >= invoice.totalAmount) {
          invoice.status = InvoiceStatus.PAID;
        }
        await invoice.save();
      }
    }

    return creditNote;
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
        .populate('invoiceId')
        .populate('studentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CreditNote.countDocuments(filter),
    ]);

    return { creditNotes, total, page: query.page ?? 1, limit };
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
        .populate('studentId')
        .populate('feeTypeId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FeeExemption.countDocuments(filter),
    ]);

    return { exemptions, total, page: query.page ?? 1, limit };
  }

  // ─── Collection Actions ─────────────────────────────────────────────────────

  static async listCollectionActions(
    schoolId: string,
    query: { page?: number; limit?: number; stage?: string },
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.stage) filter.stage = query.stage;

    const [actions, total] = await Promise.all([
      CollectionAction.find(filter)
        .populate('invoiceId')
        .populate('studentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CollectionAction.countDocuments(filter),
    ]);

    return { actions, total, page: query.page ?? 1, limit };
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
