import ExcelJS from 'exceljs';
import mongoose from 'mongoose';
import { Budget, Expense } from './model.js';
import { NotFoundError } from '../../common/errors.js';

export class ExportService {
  static async generateBudgetExcel(schoolId: string, budgetId: string): Promise<ExcelJS.Workbook> {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const bid = new mongoose.Types.ObjectId(budgetId);

    const budget = await Budget.findOne({ _id: bid, schoolId: sid, isDeleted: false })
      .populate('lineItems.categoryId', 'name code')
      .lean();

    if (!budget) throw new NotFoundError('Budget not found');

    // Get approved expenses by category
    const expensesByCategory = await Expense.aggregate([
      { $match: { schoolId: sid, status: 'approved', isDeleted: false } },
      { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
    ]);
    const expenseMap = new Map<string, number>();
    for (const e of expensesByCategory) {
      expenseMap.set(e._id.toString(), e.total as number);
    }

    // Get monthly expenses
    const startOfYear = new Date(`${budget.year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${budget.year}-12-31T23:59:59.999Z`);
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          schoolId: sid,
          status: 'approved',
          isDeleted: false,
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$amount' } } },
    ]);
    const monthMap = new Map<number, number>();
    for (const m of monthlyExpenses) {
      monthMap.set(m._id as number, m.total as number);
    }

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Campusly';
    wb.created = new Date();

    // ── Sheet 1: Budget Summary ──
    const summarySheet = wb.addWorksheet('Budget Summary');
    summarySheet.columns = [
      { header: 'Field', key: 'field', width: 25 },
      { header: 'Value', key: 'value', width: 30 },
    ];
    const totalActual = budget.lineItems.reduce((s, li) => {
      const cat = li.categoryId as unknown as { _id: mongoose.Types.ObjectId };
      return s + (expenseMap.get(cat._id.toString()) ?? 0);
    }, 0);
    summarySheet.addRows([
      { field: 'Budget Name', value: budget.name },
      { field: 'Year', value: budget.year },
      { field: 'Status', value: budget.status },
      { field: 'Total Budgeted', value: (budget.totalBudgeted / 100).toFixed(2) },
      { field: 'Total Spent', value: (totalActual / 100).toFixed(2) },
      { field: 'Remaining', value: ((budget.totalBudgeted - totalActual) / 100).toFixed(2) },
    ]);
    summarySheet.getRow(1).font = { bold: true };

    // ── Sheet 2: Line Items ──
    const itemsSheet = wb.addWorksheet('Line Items');
    itemsSheet.columns = [
      { header: 'Category', key: 'category', width: 25 },
      { header: 'Code', key: 'code', width: 12 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Budgeted (R)', key: 'budgeted', width: 15 },
      { header: 'Actual (R)', key: 'actual', width: 15 },
      { header: 'Variance (R)', key: 'variance', width: 15 },
      { header: 'Utilization %', key: 'utilization', width: 14 },
    ];

    for (const li of budget.lineItems) {
      const cat = li.categoryId as unknown as {
        _id: mongoose.Types.ObjectId;
        name: string;
        code: string;
      };
      const actual = expenseMap.get(cat._id.toString()) ?? 0;
      const variance = li.annualAmount - actual;
      const utilization =
        li.annualAmount > 0 ? Math.round((actual / li.annualAmount) * 1000) / 10 : 0;

      itemsSheet.addRow({
        category: cat.name,
        code: cat.code,
        description: li.description ?? '',
        budgeted: (li.annualAmount / 100).toFixed(2),
        actual: (actual / 100).toFixed(2),
        variance: (variance / 100).toFixed(2),
        utilization,
      });
    }
    itemsSheet.getRow(1).font = { bold: true };

    // ── Sheet 3: Monthly Breakdown ──
    const monthlySheet = wb.addWorksheet('Monthly Breakdown');
    monthlySheet.columns = [
      { header: 'Month', key: 'month', width: 15 },
      { header: 'Expenditure (R)', key: 'expenditure', width: 18 },
    ];
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    for (let i = 0; i < 12; i++) {
      const exp = monthMap.get(i + 1) ?? 0;
      monthlySheet.addRow({ month: monthNames[i], expenditure: (exp / 100).toFixed(2) });
    }
    monthlySheet.getRow(1).font = { bold: true };

    return wb;
  }
}
