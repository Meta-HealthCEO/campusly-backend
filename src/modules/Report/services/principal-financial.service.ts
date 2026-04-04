import mongoose from 'mongoose';
import { Invoice, Payment } from '../../Fee/model.js';
import { SchoolBenchmark } from '../models/SchoolBenchmark.js';
import { logger } from '../../../common/logger.js';

// ─── Types ──────────────────────────────────────────────────────────────────

interface MonthlyBreakdown {
  month: number;
  revenue: number;
  budget: number;
}

interface RevenueVsBudget {
  totalRevenue: number;
  annualBudget: number;
  percentOfBudget: number;
  monthlyBreakdown: MonthlyBreakdown[];
}

interface OutstandingFeesAging {
  current: number;
  thirtyDays: number;
  sixtyDays: number;
  ninetyDays: number;
  overNinetyDays: number;
  total: number;
}

interface CashFlowProjection {
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  netCashFlow: number;
}

export interface FinancialHealthData {
  revenueVsBudget: RevenueVsBudget;
  outstandingFeesAging: OutstandingFeesAging;
  cashFlowProjection: CashFlowProjection[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function toYearMonthStr(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

// ─── Financial Health ───────────────────────────────────────────────────────

export async function getFinancialHealth(
  schoolId: string,
  year?: number,
): Promise<FinancialHealthData> {
  const currentYear = year ?? new Date().getFullYear();
  const schoolOid = new mongoose.Types.ObjectId(schoolId);
  const now = new Date();

  try {
    const [revenueAgg, benchmark, agingAgg, trailingRevenue] = await Promise.all([
      // Monthly revenue breakdown
      Payment.aggregate([
        {
          $match: {
            schoolId: schoolOid,
            isDeleted: false,
            paymentDate: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1),
            },
          },
        },
        {
          $group: {
            _id: { $month: '$paymentDate' },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Get benchmark for budget
      SchoolBenchmark.findOne({
        schoolId: schoolOid,
        isDeleted: false,
      }).lean(),

      // Outstanding fees aging
      Invoice.aggregate([
        {
          $match: {
            schoolId: schoolOid,
            isDeleted: false,
            status: { $nin: ['paid', 'cancelled'] },
          },
        },
        {
          $addFields: {
            outstanding: { $subtract: ['$totalAmount', '$paidAmount'] },
            ageDays: {
              $divide: [
                { $subtract: [now, '$dueDate'] },
                86400000, // ms per day
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            current: {
              $sum: { $cond: [{ $lte: ['$ageDays', 0] }, '$outstanding', 0] },
            },
            thirtyDays: {
              $sum: {
                $cond: [
                  { $and: [{ $gt: ['$ageDays', 0] }, { $lte: ['$ageDays', 30] }] },
                  '$outstanding',
                  0,
                ],
              },
            },
            sixtyDays: {
              $sum: {
                $cond: [
                  { $and: [{ $gt: ['$ageDays', 30] }, { $lte: ['$ageDays', 60] }] },
                  '$outstanding',
                  0,
                ],
              },
            },
            ninetyDays: {
              $sum: {
                $cond: [
                  { $and: [{ $gt: ['$ageDays', 60] }, { $lte: ['$ageDays', 90] }] },
                  '$outstanding',
                  0,
                ],
              },
            },
            overNinetyDays: {
              $sum: { $cond: [{ $gt: ['$ageDays', 90] }, '$outstanding', 0] },
            },
            total: { $sum: '$outstanding' },
          },
        },
      ]),

      // Trailing 3-month revenue for projection
      Payment.aggregate([
        {
          $match: {
            schoolId: schoolOid,
            isDeleted: false,
            paymentDate: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 3, 1),
              $lt: new Date(now.getFullYear(), now.getMonth(), 1),
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' }, months: { $addToSet: { $month: '$paymentDate' } } } },
      ]),
    ]);

    const annualBudget = benchmark?.annualBudget ?? 0;
    const monthlyBudget = annualBudget > 0 ? Math.round(annualBudget / 12) : 0;
    const monthlyExpense = benchmark?.monthlyExpenseEstimate ?? 0;

    // Build monthly breakdown
    const monthlyBreakdown: MonthlyBreakdown[] = [];
    let totalRevenue = 0;
    for (let m = 1; m <= 12; m++) {
      const found = revenueAgg.find(
        (r: { _id: number; revenue: number }) => r._id === m,
      );
      const rev = found ? (found.revenue as number) : 0;
      totalRevenue += rev;
      monthlyBreakdown.push({ month: m, revenue: rev, budget: monthlyBudget });
    }

    // Aging
    const aging = agingAgg[0];
    const outstandingFeesAging: OutstandingFeesAging = {
      current: aging?.current ?? 0,
      thirtyDays: aging?.thirtyDays ?? 0,
      sixtyDays: aging?.sixtyDays ?? 0,
      ninetyDays: aging?.ninetyDays ?? 0,
      overNinetyDays: aging?.overNinetyDays ?? 0,
      total: aging?.total ?? 0,
    };

    // Cash flow projection (3 months ahead)
    const trailing = trailingRevenue[0];
    const trailingMonths = trailing?.months?.length ?? 1;
    const avgMonthlyIncome = trailing
      ? Math.round((trailing.total as number) / Math.max(trailingMonths, 1))
      : 0;

    const cashFlowProjection: CashFlowProjection[] = [];
    for (let i = 0; i < 3; i++) {
      const projMonth = now.getMonth() + i;
      const projYear = now.getFullYear() + Math.floor(projMonth / 12);
      const projMonthNorm = (projMonth % 12) + 1;
      const projectedIncome = Math.round(avgMonthlyIncome * (1 - i * 0.03));
      cashFlowProjection.push({
        month: toYearMonthStr(projYear, projMonthNorm),
        projectedIncome,
        projectedExpenses: monthlyExpense,
        netCashFlow: projectedIncome - monthlyExpense,
      });
    }

    return {
      revenueVsBudget: {
        totalRevenue,
        annualBudget,
        percentOfBudget: annualBudget > 0
          ? Math.round((totalRevenue / annualBudget) * 1000) / 10
          : 0,
        monthlyBreakdown,
      },
      outstandingFeesAging,
      cashFlowProjection,
    };
  } catch (err: unknown) {
    logger.error({ err, schoolId }, 'Failed to compute financial health');
    throw err;
  }
}
