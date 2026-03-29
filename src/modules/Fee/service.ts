import mongoose from 'mongoose';
import { FeeType, FeeSchedule, Invoice, Payment, DebitOrder } from './model.js';
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
      FeeType.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
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
        .limit(limit),
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
        .limit(limit),
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
}
