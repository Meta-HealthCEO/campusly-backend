import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { CategoryService } from './service-categories.js';
import { BudgetCrudService } from './service-budgets.js';
import { ExpenseService } from './service-expenses.js';
import { ReportService } from './service-reports.js';
import type { UserRole } from '../../common/enums.js';
import { resolveSchoolScope } from '../../common/school-scope.js';

export class BudgetController {
  // ─── Categories ─────────────────────────────────────────────────────────

  static async createCategory(req: Request, res: Response): Promise<void> {
    const category = await CategoryService.create(req.body);
    res.status(201).json(apiResponse(true, category, 'Budget category created successfully'));
  }

  static async listCategories(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req)!;
    const categories = await CategoryService.list(schoolId);
    res.json(apiResponse(true, categories, 'Budget categories retrieved successfully'));
  }

  static async updateCategory(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const category = await CategoryService.update(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, category, 'Category updated successfully'));
  }

  static async deleteCategory(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await CategoryService.delete(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Category deleted successfully'));
  }

  static async seedCategories(req: Request, res: Response): Promise<void> {
    const schoolId = req.body.schoolId || req.user!.schoolId!;
    const categories = await CategoryService.seed(schoolId);
    res.status(201).json(apiResponse(true, categories, 'Default categories seeded successfully'));
  }

  // ─── Budgets ────────────────────────────────────────────────────────────

  static async createBudget(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.body.schoolId || user.schoolId!;
    const budget = await BudgetCrudService.create(schoolId, user.id, req.body);
    res.status(201).json(apiResponse(true, budget, 'Budget created successfully'));
  }

  static async listBudgets(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req)!;
    const result = await BudgetCrudService.list(schoolId, {
      year: req.query.year ? Number(req.query.year) : undefined,
      status: req.query.status as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async getBudget(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const budget = await BudgetCrudService.getById(req.params.id as string, schoolId);
    res.json(apiResponse(true, budget));
  }

  static async updateBudget(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const budget = await BudgetCrudService.update(
      req.params.id as string,
      schoolId,
      user.id,
      req.body,
    );
    res.json(apiResponse(true, budget, 'Budget updated successfully'));
  }

  static async deleteBudget(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await BudgetCrudService.delete(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Budget deleted successfully'));
  }

  // ─── Expenses ───────────────────────────────────────────────────────────

  static async createExpense(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = req.body.schoolId || user.schoolId!;
    const expense = await ExpenseService.create(
      schoolId, user.id, user.role as UserRole, req.body,
    );
    res.status(201).json(apiResponse(true, expense, 'Expense recorded successfully'));
  }

  static async listExpenses(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = resolveSchoolScope(req)!;
    const result = await ExpenseService.list(
      {
        schoolId,
        categoryId: req.query.categoryId as string | undefined,
        budgetId: req.query.budgetId as string | undefined,
        status: req.query.status as string | undefined,
        term: req.query.term ? Number(req.query.term) : undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      },
      user.id,
      user.role as UserRole,
    );
    res.json(apiResponse(true, result));
  }

  static async getExpense(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const expense = await ExpenseService.getById(req.params.id as string, schoolId);
    res.json(apiResponse(true, expense));
  }

  static async updateExpense(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const expense = await ExpenseService.update(
      req.params.id as string,
      user.schoolId!,
      user.id,
      user.role as UserRole,
      req.body,
    );
    res.json(apiResponse(true, expense, 'Expense updated successfully'));
  }

  static async deleteExpense(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await ExpenseService.delete(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Expense deleted successfully'));
  }

  static async approveExpense(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const expense = await ExpenseService.approve(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body.notes,
    );
    res.json(apiResponse(true, expense, 'Expense approved successfully'));
  }

  static async rejectExpense(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const expense = await ExpenseService.reject(
      req.params.id as string,
      user.schoolId!,
      user.id,
      req.body.reason,
    );
    res.json(apiResponse(true, expense, 'Expense rejected successfully'));
  }

  // ─── Reports ────────────────────────────────────────────────────────────

  static async getVariance(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req)!;
    const data = await ReportService.getVariance(
      schoolId,
      req.query.budgetId as string,
      req.query.term ? Number(req.query.term) : undefined,
    );
    res.json(apiResponse(true, data, 'Variance report generated successfully'));
  }

  static async getMonthly(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req)!;
    const data = await ReportService.getMonthly(schoolId, Number(req.query.year));
    res.json(apiResponse(true, data));
  }

  static async getCashflow(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req)!;
    const data = await ReportService.getCashflow(
      schoolId,
      req.query.budgetId as string,
      req.query.months ? Number(req.query.months) : 6,
    );
    res.json(apiResponse(true, data));
  }

  static async getComparison(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req)!;
    const years = (req.query.years as string).split(',').map(Number);
    const data = await ReportService.getComparison(schoolId, years);
    res.json(apiResponse(true, data));
  }

  static async getAlerts(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req)!;
    const data = await ReportService.getAlerts(schoolId, req.query.budgetId as string);
    res.json(apiResponse(true, data, 'Budget alerts retrieved successfully'));
  }

  static async exportReport(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req)!;
    const budgetId = req.query.budgetId as string;

    const { ExportService } = await import('./service-export.js');
    const wb = await ExportService.generateBudgetExcel(schoolId, budgetId);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="budget-report.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  }

  static async uploadReceipt(req: Request, res: Response): Promise<void> {
    const multerReq = req as Request & { file?: Express.Multer.File };
    if (!multerReq.file) {
      res.status(400).json(apiResponse(false, undefined, 'No file uploaded'));
      return;
    }
    const url = `/uploads/budget/receipts/${multerReq.file.filename}`;
    res.json(apiResponse(true, { url }, 'Receipt uploaded successfully'));
  }
}
