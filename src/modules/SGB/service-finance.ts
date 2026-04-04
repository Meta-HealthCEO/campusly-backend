import mongoose from 'mongoose';
import { logger } from '../../common/logger.js';

interface FinanceSummary {
  period: string;
  year: number;
  income: {
    totalFeesBilled: number;
    totalFeesCollected: number;
    collectionRate: number;
    otherIncome: number;
    totalIncome: number;
  };
  expenditure: {
    salaries: number;
    maintenance: number;
    supplies: number;
    utilities: number;
    transport: number;
    other: number;
    totalExpenditure: number;
  };
  balance: {
    netPosition: number;
    bankBalance: number;
    outstandingFees: number;
  };
  budgetComparison: {
    budgetedIncome: number;
    actualIncome: number;
    budgetedExpenditure: number;
    actualExpenditure: number;
    incomeVariance: number;
    expenditureVariance: number;
  } | null;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expenditure: number;
}

function getDateRange(period: string, year: number): { start: Date; end: Date } {
  const termRanges: Record<string, [number, number, number, number]> = {
    term1: [0, 1, 2, 31],
    term2: [3, 1, 5, 30],
    term3: [6, 1, 8, 30],
    term4: [9, 1, 11, 31],
    q1: [0, 1, 2, 31],
    q2: [3, 1, 5, 30],
    q3: [6, 1, 8, 30],
    q4: [9, 1, 11, 31],
  };

  if (period === 'annual') {
    return { start: new Date(year, 0, 1), end: new Date(year, 11, 31, 23, 59, 59) };
  }

  const range = termRanges[period];
  if (!range) {
    return { start: new Date(year, 0, 1), end: new Date(year, 11, 31, 23, 59, 59) };
  }

  return {
    start: new Date(year, range[0], range[1]),
    end: new Date(year, range[2], range[3], 23, 59, 59),
  };
}

export class SgbFinanceService {
  static async getFinanceSummary(schoolId: string, period: string, year: number): Promise<FinanceSummary> {
    const { start, end } = getDateRange(period, year);
    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    // Aggregate fee invoices billed
    let totalFeesBilled = 0;
    let totalFeesCollected = 0;

    try {
      const InvoiceModel = mongoose.model('Invoice');
      const billedResult = await InvoiceModel.aggregate([
        { $match: { schoolId: schoolOid, isDeleted: false, createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      totalFeesBilled = billedResult[0]?.total ?? 0;
    } catch (err: unknown) {
      logger.warn({ err }, 'Invoice model not available for finance summary');
    }

    // Aggregate payments collected
    try {
      const PaymentModel = mongoose.model('Payment');
      const collectedResult = await PaymentModel.aggregate([
        { $match: { schoolId: schoolOid, isDeleted: false, createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      totalFeesCollected = collectedResult[0]?.total ?? 0;
    } catch (err: unknown) {
      logger.warn({ err }, 'Payment model not available for finance summary');
    }

    const collectionRate = totalFeesBilled > 0
      ? Math.round((totalFeesCollected / totalFeesBilled) * 1000) / 10
      : 0;

    const outstandingFees = totalFeesBilled - totalFeesCollected;

    return {
      period,
      year,
      income: {
        totalFeesBilled,
        totalFeesCollected,
        collectionRate,
        otherIncome: 0,
        totalIncome: totalFeesCollected,
      },
      expenditure: {
        salaries: 0,
        maintenance: 0,
        supplies: 0,
        utilities: 0,
        transport: 0,
        other: 0,
        totalExpenditure: 0,
      },
      balance: {
        netPosition: totalFeesCollected,
        bankBalance: totalFeesCollected,
        outstandingFees: Math.max(0, outstandingFees),
      },
      budgetComparison: null,
    };
  }

  static async getFinanceTrends(schoolId: string, year: number): Promise<{ months: MonthlyTrend[] }> {
    const schoolOid = new mongoose.Types.ObjectId(schoolId);
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);

    const months: MonthlyTrend[] = [];

    try {
      const PaymentModel = mongoose.model('Payment');
      const monthlyIncome = await PaymentModel.aggregate([
        { $match: { schoolId: schoolOid, isDeleted: false, createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            income: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      for (let m = 0; m < 12; m++) {
        const monthStr = `${year}-${String(m + 1).padStart(2, '0')}`;
        const found = monthlyIncome.find((r: { _id: string; income: number }) => r._id === monthStr);
        months.push({
          month: monthStr,
          income: found?.income ?? 0,
          expenditure: 0,
        });
      }
    } catch (err: unknown) {
      logger.warn({ err }, 'Payment model not available for trends');
      for (let m = 0; m < 12; m++) {
        months.push({ month: `${year}-${String(m + 1).padStart(2, '0')}`, income: 0, expenditure: 0 });
      }
    }

    return { months };
  }
}
