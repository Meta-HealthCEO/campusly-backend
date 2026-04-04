import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { TaxService } from './service-tax.js';
import { PayrollService } from './service.js';
import { PayrollRunService } from './service-runs.js';
import type {
  CreateTaxTableInput,
  CreateSalaryInput,
  UpdateSalaryInput,
  CreatePayrollRunInput,
  ReviewRunInput,
  AdjustItemInput,
  GenerateCertificatesInput,
} from './validation.js';

export class PayrollController {
  // ─── Tax Tables ─────────────────────────────────────────────────────────

  static async getTaxTable(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const taxYear = req.query.taxYear ? Number(req.query.taxYear) : undefined;
    const table = await TaxService.getTaxTable(schoolId as string, taxYear);
    res.json(apiResponse(true, table, 'Tax table retrieved successfully'));
  }

  static async upsertTaxTable(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: CreateTaxTableInput = req.body;
    const table = await TaxService.upsertTaxTable(schoolId as string, data);
    res.json(apiResponse(true, table, 'Tax table saved successfully'));
  }

  // ─── Salary Records ────────────────────────────────────────────────────

  static async createSalary(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: CreateSalaryInput = req.body;
    const record = await PayrollService.createSalary(schoolId as string, data);
    res.status(201).json(apiResponse(true, record, 'Salary record created successfully'));
  }

  static async listSalaries(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const filters = {
      department: req.query.department as string | undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await PayrollService.listSalaries(schoolId as string, filters);
    res.json(apiResponse(true, result, 'Salary records retrieved'));
  }

  static async getSalary(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { id } = req.params;
    const record = await PayrollService.getSalary(id as string, schoolId as string);
    res.json(apiResponse(true, record, 'Salary record retrieved'));
  }

  static async updateSalary(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { id } = req.params;
    const data: UpdateSalaryInput = req.body;
    const record = await PayrollService.updateSalary(id as string, user.schoolId as string, user.id, data);
    res.json(apiResponse(true, record, 'Salary record updated'));
  }

  static async getSalaryHistory(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { id } = req.params;
    const history = await PayrollService.getSalaryHistory(id as string, schoolId as string);
    res.json(apiResponse(true, history, 'Salary history retrieved'));
  }

  // ─── Payroll Runs ──────────────────────────────────────────────────────

  static async createRun(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CreatePayrollRunInput = req.body;
    const run = await PayrollService.createRun(user.schoolId as string, user.id, data);
    res.status(201).json(apiResponse(true, run, 'Payroll run created successfully'));
  }

  static async listRuns(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const filters = {
      year: req.query.year ? Number(req.query.year) : undefined,
      status: req.query.status as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await PayrollRunService.listRuns(schoolId as string, filters);
    res.json(apiResponse(true, result, 'Payroll runs retrieved'));
  }

  static async getRun(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { id } = req.params;
    const run = await PayrollRunService.getRun(id as string, schoolId as string);
    res.json(apiResponse(true, run, 'Payroll run retrieved'));
  }

  static async reviewRun(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { id } = req.params;
    const data: ReviewRunInput = req.body;
    const run = await PayrollRunService.reviewRun(id as string, user.schoolId as string, user.id, data);
    res.json(apiResponse(true, run, 'Payroll run reviewed'));
  }

  static async approveRun(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { id } = req.params;
    const run = await PayrollRunService.approveRun(id as string, user.schoolId as string, user.id);
    res.json(apiResponse(true, run, 'Payroll run approved'));
  }

  static async processRun(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const { id } = req.params;
    const run = await PayrollRunService.processRun(id as string, user.schoolId as string, user.id);
    res.json(apiResponse(true, run, 'Payroll run processed'));
  }

  static async adjustItem(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { id, itemId } = req.params;
    const data: AdjustItemInput = req.body;
    const run = await PayrollRunService.adjustItem(id as string, itemId as string, schoolId as string, data);
    res.json(apiResponse(true, run, 'Payroll item adjusted'));
  }

  // ─── Payslips ──────────────────────────────────────────────────────────

  static async getPayslip(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { runId, staffId } = req.params;
    const payslip = await PayrollRunService.getPayslip(runId as string, staffId as string, schoolId as string);
    res.json(apiResponse(true, payslip, 'Payslip retrieved'));
  }

  // ─── Bank File ─────────────────────────────────────────────────────────

  static async getBankFile(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const { id } = req.params;
    const format = (req.query.format as 'acb' | 'csv') ?? 'csv';
    const file = await PayrollRunService.generateBankFile(id as string, schoolId as string, format);

    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.content);
  }

  // ─── Tax Certificates ─────────────────────────────────────────────────

  static async generateCertificates(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: GenerateCertificatesInput = req.body;
    const result = await PayrollRunService.generateCertificates(
      schoolId as string, data.taxYear, data.certificateType,
    );
    res.json(apiResponse(true, result, 'Tax certificates generated successfully'));
  }

  // ─── Reports ───────────────────────────────────────────────────────────

  static async getCostToCompany(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    const report = await PayrollRunService.getCostToCompany(schoolId as string, month, year);
    res.json(apiResponse(true, report, 'Cost to company report retrieved'));
  }
}
