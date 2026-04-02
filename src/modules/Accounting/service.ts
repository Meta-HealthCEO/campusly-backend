import mongoose from 'mongoose';
import { AccountingConfig, AccountingExport } from './model.js';
import type { IAccountingConfig, IAccountingExport, ExportFormat } from './model.js';
import { Invoice, Payment } from '../Fee/model.js';
import {
  generateCSV,
  generateSageCSV,
  generatePastelCSV,
  generateQuickBooksIIF,
} from './services/export-generator.js';

interface ExportInput {
  format: ExportFormat;
  dateFrom: string;
  dateTo: string;
}

interface RevenueByCategory {
  category: string;
  totalInvoiced: number;
  count: number;
}

interface IncomeStatement {
  revenueByCategory: RevenueByCategory[];
  totalInvoiced: number;
  totalCollected: number;
  outstanding: number;
  writeOffs: number;
}

interface CashFlowPoint {
  date: string;
  amount: number;
  runningTotal: number;
}

const formatLabels: Record<string, string> = {
  csv: 'csv',
  sage_csv: 'csv',
  xero_csv: 'csv',
  pastel_csv: 'csv',
  quickbooks_iif: 'iif',
};

export class AccountingService {
  // ─── Config ──────────────────────────────────────────────────────────────

  static async getConfig(schoolId: string): Promise<IAccountingConfig | null> {
    return AccountingConfig.findOne({ schoolId, isDeleted: false });
  }

  static async upsertConfig(
    schoolId: string,
    data: Partial<IAccountingConfig>,
  ): Promise<IAccountingConfig> {
    const config = await AccountingConfig.findOneAndUpdate(
      { schoolId },
      { $set: { ...data, schoolId, isDeleted: false } },
      { upsert: true, new: true },
    );
    return config;
  }

  // ─── Export ──────────────────────────────────────────────────────────────

  static async generateExport(
    userId: string,
    schoolId: string,
    input: ExportInput,
  ): Promise<IAccountingExport> {
    const config = await AccountingConfig.findOne({ schoolId, isDeleted: false });
    const safeConfig = config ?? ({
      glMapping: [],
      bankMapping: [],
      vatRegistered: false,
      provider: 'none',
    } as unknown as IAccountingConfig);

    const dateRange = {
      from: new Date(input.dateFrom),
      to: new Date(input.dateTo),
    };

    const ext = formatLabels[input.format] ?? 'csv';
    const fileName = `export_${schoolId}_${input.dateFrom}_${input.dateTo}.${ext}`;

    const exportRecord = await AccountingExport.create({
      schoolId,
      exportedBy: userId,
      format: input.format,
      dateRange,
      fileName,
      status: 'generating',
    });

    try {
      let result: { content: string; recordCount: number };

      switch (input.format) {
        case 'sage_csv':
          result = await generateSageCSV(schoolId, dateRange, safeConfig);
          break;
        case 'pastel_csv':
          result = await generatePastelCSV(schoolId, dateRange, safeConfig);
          break;
        case 'quickbooks_iif':
          result = await generateQuickBooksIIF(schoolId, dateRange, safeConfig);
          break;
        default:
          result = await generateCSV(schoolId, dateRange, safeConfig);
          break;
      }

      // Store content as base64 data URL for now
      const base64 = Buffer.from(result.content, 'utf-8').toString('base64');
      const mimeType = input.format === 'quickbooks_iif' ? 'text/plain' : 'text/csv';
      const downloadUrl = `data:${mimeType};base64,${base64}`;

      exportRecord.status = 'ready';
      exportRecord.recordCount = result.recordCount;
      exportRecord.downloadUrl = downloadUrl;
      await exportRecord.save();

      // Update last export timestamp on config
      await AccountingConfig.findOneAndUpdate(
        { schoolId, isDeleted: false },
        { $set: { lastExportAt: new Date() } },
      );

      return exportRecord;
    } catch (err: unknown) {
      exportRecord.status = 'failed';
      await exportRecord.save();
      throw err;
    }
  }

  static async listExports(
    schoolId: string,
    page = 1,
    limit = 20,
  ): Promise<{ exports: IAccountingExport[]; total: number }> {
    const skip = (page - 1) * limit;
    const [exports, total] = await Promise.all([
      AccountingExport.find({ schoolId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('exportedBy', 'name email'),
      AccountingExport.countDocuments({ schoolId, isDeleted: false }),
    ]);
    return { exports, total };
  }

  static async downloadExport(
    exportId: string,
    schoolId: string,
  ): Promise<IAccountingExport | null> {
    return AccountingExport.findOne({
      _id: exportId,
      schoolId,
      isDeleted: false,
      status: 'ready',
    });
  }

  // ─── Reports ─────────────────────────────────────────────────────────────

  static async getIncomeStatement(
    schoolId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<IncomeStatement> {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    const [categoryAgg, paymentAgg, writeOffAgg] = await Promise.all([
      Invoice.aggregate([
        {
          $match: {
            schoolId: sid,
            isDeleted: false,
            status: { $ne: 'cancelled' },
            createdAt: { $gte: from, $lte: to },
          },
        },
        {
          $lookup: {
            from: 'feeschedules',
            localField: 'feeScheduleId',
            foreignField: '_id',
            as: 'schedule',
          },
        },
        { $unwind: { path: '$schedule', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'feetypes',
            localField: 'schedule.feeTypeId',
            foreignField: '_id',
            as: 'feeType',
          },
        },
        { $unwind: { path: '$feeType', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ['$feeType.category', 'other'] },
            totalInvoiced: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Payment.aggregate([
        {
          $match: {
            schoolId: sid,
            isDeleted: false,
            paymentDate: { $gte: from, $lte: to },
          },
        },
        { $group: { _id: null, totalCollected: { $sum: '$amount' } } },
      ]),
      Invoice.aggregate([
        {
          $match: {
            schoolId: sid,
            isDeleted: false,
            writeOffAmount: { $gt: 0 },
            createdAt: { $gte: from, $lte: to },
          },
        },
        { $group: { _id: null, writeOffs: { $sum: '$writeOffAmount' } } },
      ]),
    ]);

    const revenueByCategory: RevenueByCategory[] = categoryAgg.map(
      (r: { _id: string; totalInvoiced: number; count: number }) => ({
        category: r._id,
        totalInvoiced: r.totalInvoiced,
        count: r.count,
      }),
    );

    const totalInvoiced = revenueByCategory.reduce(
      (sum: number, r: RevenueByCategory) => sum + r.totalInvoiced, 0,
    );
    const totalCollected = paymentAgg[0]?.totalCollected ?? 0;
    const writeOffs = writeOffAgg[0]?.writeOffs ?? 0;

    return {
      revenueByCategory,
      totalInvoiced,
      totalCollected,
      outstanding: totalInvoiced - totalCollected - writeOffs,
      writeOffs,
    };
  }

  static async getCashFlow(
    schoolId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<CashFlowPoint[]> {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    const dailyPayments = await Payment.aggregate([
      {
        $match: {
          schoolId: sid,
          isDeleted: false,
          paymentDate: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' },
          },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    let runningTotal = 0;
    return dailyPayments.map((d: { _id: string; amount: number }) => {
      runningTotal += d.amount;
      return {
        date: d._id,
        amount: d.amount,
        runningTotal,
      };
    });
  }
}
