import mongoose from 'mongoose';
import { Invoice, Payment } from '../../Fee/model.js';
import { TuckShopOrder } from '../../TuckShop/model.js';

export class FinancialReportService {
  static async getRevenueReport(schoolId: string, startDate?: string, endDate?: string) {
    const match: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      match.createdAt = dateFilter;
    }

    const results = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          total: 1,
        },
      },
    ]);

    return results;
  }

  static async getDebtorsReport(schoolId: string, page = 1, limit = 50) {
    const now = new Date();
    const skip = (page - 1) * limit;

    const filter = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      status: { $nin: ['paid', 'cancelled'] },
      isDeleted: false,
    };

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('studentId', 'admissionNumber userId gradeId classId')
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    const debtors = invoices.map((invoice) => {
      const outstanding = invoice.totalAmount - invoice.paidAmount - (invoice.writeOffAmount ?? 0);
      const dueDate = new Date(invoice.dueDate);
      const ageDays = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

      let bucket: '0-30' | '31-60' | '61-90' | '90+';
      if (ageDays <= 30) {
        bucket = '0-30';
      } else if (ageDays <= 60) {
        bucket = '31-60';
      } else if (ageDays <= 90) {
        bucket = '61-90';
      } else {
        bucket = '90+';
      }

      return {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        studentId: invoice.studentId,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        outstanding,
        ageDays,
        bucket,
      };
    });

    return {
      data: debtors,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getDebtorsAgeingReport(schoolId: string, page = 1, limit = 50) {
    const now = new Date();
    const schoolObjId = new mongoose.Types.ObjectId(schoolId);
    const skip = (page - 1) * limit;

    const filter = {
      schoolId: schoolObjId,
      status: { $nin: ['paid', 'cancelled'] },
      isDeleted: false,
    };

    const [invoices, total, bucketsResult] = await Promise.all([
      Invoice.find(filter)
        .populate({
          path: 'studentId',
          populate: { path: 'userId', select: 'firstName lastName' },
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(filter),
      Invoice.aggregate([
        { $match: filter },
        {
          $project: {
            outstanding: { $subtract: ['$totalAmount', { $add: ['$paidAmount', { $ifNull: ['$writeOffAmount', 0] }] }] },
            ageDays: {
              $max: [
                0,
                { $floor: { $divide: [{ $subtract: [now, '$dueDate'] }, 1000 * 60 * 60 * 24] } },
              ],
            },
          },
        },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lte: ['$ageDays', 30] }, then: '0-30' },
                  { case: { $lte: ['$ageDays', 60] }, then: '31-60' },
                  { case: { $lte: ['$ageDays', 90] }, then: '61-90' },
                ],
                default: '90+',
              },
            },
            total: { $sum: '$outstanding' },
          },
        },
      ]),
    ]);

    const buckets: Record<string, number> = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    let totalOutstanding = 0;
    for (const b of bucketsResult) {
      buckets[b._id as string] = b.total;
      totalOutstanding += b.total;
    }

    const debtors = invoices.map((inv) => {
      const outstanding = inv.totalAmount - inv.paidAmount - (inv.writeOffAmount ?? 0);
      const ageDays = Math.max(0, Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
      const bucket = ageDays <= 30 ? '0-30' : ageDays <= 60 ? '31-60' : ageDays <= 90 ? '61-90' : '90+';

      return {
        invoiceId: inv._id,
        invoiceNumber: inv.invoiceNumber,
        student: inv.studentId,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        outstanding,
        ageDays,
        bucket,
      };
    });

    return {
      totalOutstanding,
      buckets,
      debtors,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getMonthlyFinancialSummary(schoolId: string, year?: number, month?: number) {
    const targetYear = year ?? new Date().getFullYear();
    const targetMonth = month ?? new Date().getMonth() + 1;
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
    const schoolObjId = new mongoose.Types.ObjectId(schoolId);

    const [payments, invoices, tuckShopSales] = await Promise.all([
      Payment.aggregate([
        { $match: { schoolId: schoolObjId, createdAt: { $gte: startDate, $lte: endDate }, isDeleted: false } },
        {
          $group: {
            _id: '$paymentMethod',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      Invoice.aggregate([
        { $match: { schoolId: schoolObjId, createdAt: { $gte: startDate, $lte: endDate }, isDeleted: false } },
        {
          $group: {
            _id: null,
            totalInvoiced: { $sum: '$totalAmount' },
            totalPaid: { $sum: '$paidAmount' },
            count: { $sum: 1 },
          },
        },
      ]),

      TuckShopOrder.aggregate([
        { $match: { schoolId: schoolObjId, createdAt: { $gte: startDate, $lte: endDate }, isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
    ]);

    const totalPayments = payments.reduce((sum, p) => sum + p.total, 0);

    return {
      year: targetYear,
      month: targetMonth,
      payments: {
        total: totalPayments,
        byMethod: payments.map((p) => ({ method: p._id, total: p.total, count: p.count })),
      },
      invoices: {
        totalInvoiced: invoices[0]?.totalInvoiced ?? 0,
        totalPaid: invoices[0]?.totalPaid ?? 0,
        count: invoices[0]?.count ?? 0,
      },
      tuckShop: {
        total: tuckShopSales[0]?.total ?? 0,
        count: tuckShopSales[0]?.count ?? 0,
      },
    };
  }

  static async getTuckShopSalesReport(
    schoolId: string,
    period: 'daily' | 'weekly' | 'monthly',
    startDate?: string,
    endDate?: string,
  ) {
    const match: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      match.createdAt = dateFilter;
    }

    let groupId: Record<string, unknown>;

    switch (period) {
      case 'daily':
        groupId = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
        break;
      case 'weekly':
        groupId = {
          year: { $isoWeekYear: '$createdAt' },
          week: { $isoWeek: '$createdAt' },
        };
        break;
      case 'monthly':
        groupId = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        };
        break;
    }

    const results = await TuckShopOrder.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupId,
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } },
      {
        $project: {
          _id: 0,
          period: '$_id',
          totalSales: 1,
          orderCount: 1,
        },
      },
    ]);

    return results;
  }
}
