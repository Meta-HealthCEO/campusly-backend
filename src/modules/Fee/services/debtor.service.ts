import mongoose from 'mongoose';
import { Invoice, CollectionAction } from '../model.js';
import type { CollectionStage } from '../model.js';
import { AuditLog } from '../../Audit/model.js';
import { InvoiceStatus } from '../../../common/enums.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';
import { paginationHelper } from '../../../common/utils.js';
import type {
  EscalateCollectionInput,
  WriteOffDebtInput,
} from '../validation.js';

export class DebtorService {
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
            totalDiscount: { $sum: '$discountAmount' },
            totalWrittenOff: { $sum: '$writeOffAmount' },
            totalLateFees: { $sum: '$lateFeeAmount' },
            invoiceCount: { $sum: 1 },
            oldestDueDate: { $min: '$dueDate' },
          },
        },
        {
          $addFields: {
            outstanding: { $subtract: ['$totalOwed', { $add: ['$totalPaid', '$totalDiscount', '$totalWrittenOff'] }] },
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
    schoolId: string,
    performedBy: string,
  ) {
    const invoice = await Invoice.findOne({ _id: data.invoiceId, schoolId, isDeleted: false });
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

  // ─── Write Off Debt ─────────────────────────────────────────────────────────

  static async writeOffDebt(data: WriteOffDebtInput, schoolId: string, performedBy: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const invoice = await Invoice.findOne({ _id: data.invoiceId, schoolId, isDeleted: false }).session(session);
      if (!invoice) {
        throw new NotFoundError('Invoice not found');
      }

      const outstanding = invoice.totalAmount - invoice.paidAmount - invoice.discountAmount - invoice.writeOffAmount;
      if (data.amount > outstanding) {
        throw new BadRequestError('Write-off amount cannot exceed outstanding balance');
      }

      const previousBalance = outstanding;

      // Use $inc for writeOffAmount instead of adding to paidAmount
      await Invoice.findByIdAndUpdate(
        invoice._id,
        {
          $inc: { writeOffAmount: data.amount },
          $set: {
            writeOffDate: new Date(),
            writeOffReason: data.reason,
            collectionStage: 'write_off',
          },
        },
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

      await CollectionAction.create(
        [{
          studentId: invoice.studentId,
          schoolId: invoice.schoolId,
          invoiceId: invoice._id,
          stage: 'write_off',
          scheduledDate: new Date(),
          sentDate: new Date(),
          notes: data.reason,
          performedBy,
        }],
        { session },
      );

      await AuditLog.create(
        [{
          userId: performedBy,
          schoolId: invoice.schoolId,
          action: 'FEE_WRITE_OFF',
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

      // Return the updated invoice
      const result = await Invoice.findById(invoice._id).lean();
      return result!;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
        .populate('invoiceId', 'invoiceNumber totalAmount paidAmount status collectionStage')
        .populate('studentId', 'admissionNumber userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CollectionAction.countDocuments(filter),
    ]);

    return { actions, total, page: query.page ?? 1, limit };
  }
}
