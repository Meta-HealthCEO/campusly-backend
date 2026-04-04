import mongoose from 'mongoose';
import { Budget, Expense } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';

interface VarianceCategory {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  utilizationPercent: number;
  status: 'under_budget' | 'warning' | 'over_budget';
}

export class ReportService {
  static async getVariance(schoolId: string, budgetId: string, term?: number) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const bid = new mongoose.Types.ObjectId(budgetId);

    const budget = await Budget.findOne({
      _id: bid,
      schoolId: sid,
      isDeleted: false,
    })
      .populate('lineItems.categoryId', 'name code')
      .lean();

    if (!budget) throw new NotFoundError('Budget not found');

    // Get approved expenses grouped by category
    const matchStage: Record<string, unknown> = {
      schoolId: sid,
      status: 'approved',
      isDeleted: false,
    };
    if (term) matchStage.term = term;

    const expensesByCategory = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$categoryId',
          totalActual: { $sum: '$amount' },
        },
      },
    ]);

    const expenseMap = new Map<string, number>();
    for (const e of expensesByCategory) {
      expenseMap.set(e._id.toString(), e.totalActual as number);
    }

    const categories: VarianceCategory[] = budget.lineItems.map((li) => {
      const cat = li.categoryId as unknown as { _id: mongoose.Types.ObjectId; name: string; code: string };
      const budgeted = term && li.termAmounts?.length === 4
        ? li.termAmounts[term - 1]
        : li.annualAmount;
      const actual = expenseMap.get(cat._id.toString()) ?? 0;
      const variance = budgeted - actual;
      const utilizationPercent = budgeted > 0 ? Math.round((actual / budgeted) * 1000) / 10 : 0;
      const variancePercent = budgeted > 0
        ? Math.round((variance / budgeted) * 1000) / 10
        : 0;

      let status: 'under_budget' | 'warning' | 'over_budget' = 'under_budget';
      if (utilizationPercent >= 100) status = 'over_budget';
      else if (utilizationPercent >= 80) status = 'warning';

      return {
        categoryId: cat._id.toString(),
        categoryName: cat.name,
        categoryCode: cat.code,
        budgeted,
        actual,
        variance,
        variancePercent,
        utilizationPercent,
        status,
      };
    });

    const totalBudgeted = categories.reduce((s, c) => s + c.budgeted, 0);
    const totalActual = categories.reduce((s, c) => s + c.actual, 0);

    return {
      budgetId: budget._id.toString(),
      year: budget.year,
      term: term ?? null,
      totalBudgeted,
      totalActual,
      totalVariance: totalBudgeted - totalActual,
      categories,
    };
  }

  static async getMonthly(schoolId: string, year: number) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    // Get monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          schoolId: sid,
          status: 'approved',
          isDeleted: false,
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalExpenditure: { $sum: '$amount' },
        },
      },
    ]);

    const expenseMap = new Map<number, number>();
    for (const m of monthlyExpenses) {
      expenseMap.set(m._id as number, m.totalExpenditure as number);
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    let cumulativeIncome = 0;
    let cumulativeExpenditure = 0;

    const months = monthNames.map((label, i) => {
      const month = i + 1;
      const expenditure = expenseMap.get(month) ?? 0;
      // Income is placeholder — ideally from Fee payments
      const income = 0;
      cumulativeIncome += income;
      cumulativeExpenditure += expenditure;

      return {
        month,
        label,
        income,
        expenditure,
        surplus: income - expenditure,
        cumulativeIncome,
        cumulativeExpenditure,
      };
    });

    return { year, months };
  }

  static async getCashflow(schoolId: string, budgetId: string, months: number) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const bid = new mongoose.Types.ObjectId(budgetId);

    const budget = await Budget.findOne({
      _id: bid,
      schoolId: sid,
      isDeleted: false,
    }).lean();

    if (!budget) throw new NotFoundError('Budget not found');

    const monthlyBudget = Math.round(budget.totalBudgeted / 12);
    const now = new Date();
    const projections = [];

    // Get current total approved expenses
    const totalExpenses = await Expense.aggregate([
      {
        $match: {
          schoolId: sid,
          status: 'approved',
          isDeleted: false,
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    let currentBalance = budget.totalBudgeted - ((totalExpenses[0]?.total as number) ?? 0);

    for (let i = 0; i < months; i++) {
      const projDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const y = projDate.getFullYear();
      const m = String(projDate.getMonth() + 1).padStart(2, '0');
      const expectedIncome = 0; // Placeholder for fee income
      const plannedExpenditure = monthlyBudget;
      currentBalance = currentBalance + expectedIncome - plannedExpenditure;

      projections.push({
        month: `${y}-${m}`,
        expectedIncome,
        plannedExpenditure,
        projectedBalance: currentBalance,
      });
    }

    return {
      currentBalance: budget.totalBudgeted - ((totalExpenses[0]?.total as number) ?? 0),
      projections,
    };
  }

  static async getComparison(schoolId: string, years: number[]) {
    const sid = new mongoose.Types.ObjectId(schoolId);

    const budgets = await Budget.find({
      schoolId: sid,
      year: { $in: years },
      isDeleted: false,
    })
      .populate('lineItems.categoryId', 'name code')
      .lean();

    // Build per-year expense totals by category
    const expensesByCatYear = await Expense.aggregate([
      {
        $match: {
          schoolId: sid,
          status: 'approved',
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: {
            categoryId: '$categoryId',
            year: { $year: '$createdAt' },
          },
          actual: { $sum: '$amount' },
        },
      },
    ]);

    const actualMap = new Map<string, number>();
    for (const e of expensesByCatYear) {
      const key = `${(e._id as { categoryId: mongoose.Types.ObjectId; year: number }).categoryId}-${(e._id as { year: number }).year}`;
      actualMap.set(key, e.actual as number);
    }

    // Build category comparison
    const categoryMap = new Map<string, { name: string; values: { year: number; budgeted: number; actual: number }[] }>();

    for (const budget of budgets) {
      for (const li of budget.lineItems) {
        const cat = li.categoryId as unknown as { _id: mongoose.Types.ObjectId; name: string };
        const catId = cat._id.toString();
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, { name: cat.name, values: [] });
        }
        const actual = actualMap.get(`${catId}-${budget.year}`) ?? 0;
        categoryMap.get(catId)!.values.push({
          year: budget.year,
          budgeted: li.annualAmount,
          actual,
        });
      }
    }

    const categories = Array.from(categoryMap.values());
    const totals = years.map((year) => {
      const budget = budgets.find((b) => b.year === year);
      const totalBudgeted = budget?.totalBudgeted ?? 0;
      const totalActual = categories.reduce((sum, cat) => {
        const val = cat.values.find((v) => v.year === year);
        return sum + (val?.actual ?? 0);
      }, 0);
      return { year, budgeted: totalBudgeted, actual: totalActual };
    });

    return { years, categories, totals };
  }

  static async getAlerts(schoolId: string, budgetId: string) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const bid = new mongoose.Types.ObjectId(budgetId);

    const budget = await Budget.findOne({
      _id: bid,
      schoolId: sid,
      isDeleted: false,
    })
      .populate('lineItems.categoryId', 'name code')
      .lean();

    if (!budget) throw new NotFoundError('Budget not found');

    // Get approved expenses grouped by category
    const expensesByCategory = await Expense.aggregate([
      {
        $match: {
          schoolId: sid,
          status: 'approved',
          isDeleted: false,
        },
      },
      { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
    ]);

    const expenseMap = new Map<string, number>();
    for (const e of expensesByCategory) {
      expenseMap.set(e._id.toString(), e.total as number);
    }

    type AlertItem = {
      categoryId: string;
      categoryName: string;
      categoryCode: string;
      budgeted: number;
      actual: number;
      utilizationPercent: number;
      alertLevel: 'warning' | 'critical';
      message: string;
    };

    const alerts: AlertItem[] = [];

    for (const li of budget.lineItems) {
      const cat = li.categoryId as unknown as { _id: mongoose.Types.ObjectId; name: string; code: string };
      const actual = expenseMap.get(cat._id.toString()) ?? 0;
      const utilization = li.annualAmount > 0
        ? Math.round((actual / li.annualAmount) * 1000) / 10
        : 0;

      if (utilization >= 100) {
        alerts.push({
          categoryId: cat._id.toString(),
          categoryName: cat.name,
          categoryCode: cat.code,
          budgeted: li.annualAmount,
          actual,
          utilizationPercent: utilization,
          alertLevel: 'critical',
          message: `${cat.name} has exceeded its annual budget (${utilization}% utilized)`,
        });
      } else if (utilization >= 80) {
        alerts.push({
          categoryId: cat._id.toString(),
          categoryName: cat.name,
          categoryCode: cat.code,
          budgeted: li.annualAmount,
          actual,
          utilizationPercent: utilization,
          alertLevel: 'warning',
          message: `${cat.name} has used ${utilization}% of its annual budget`,
        });
      }
    }

    return alerts.sort((a, b) => b.utilizationPercent - a.utilizationPercent);
  }
}
