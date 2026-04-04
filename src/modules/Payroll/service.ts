import mongoose from 'mongoose';
import { SalaryRecord, SalaryHistory } from './model.js';
import type { ISalaryRecord } from './model.js';
import { PayrollRun } from './model-run.js';
import type { IPayrollRun, IPayrollItem, IPayrollTotals } from './model-run.js';
import { TaxService } from './service-tax.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import type { CreateSalaryInput, UpdateSalaryInput, CreatePayrollRunInput, AdjustItemInput } from './validation.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskField(value: string | null): string | null {
  if (!value || value.length < 4) return value;
  return '****' + value.slice(-4);
}

function maskSalary(record: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...record };
  const bank = record.bankDetails as Record<string, unknown> | undefined;
  if (bank) {
    masked.bankDetails = { ...bank, accountNumber: maskField(bank.accountNumber as string) };
  }
  if (record.taxNumber) {
    masked.taxNumber = maskField(record.taxNumber as string);
  }
  return masked;
}

function computeGrossPay(record: ISalaryRecord): number {
  return record.basicSalary + record.allowances.reduce((sum, a) => sum + a.amount, 0);
}

// ─── Salary CRUD ──────────────────────────────────────────────────────────────

export class PayrollService {
  static async createSalary(schoolId: string, data: CreateSalaryInput): Promise<ISalaryRecord> {
    const existing = await SalaryRecord.findOne({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      staffId: new mongoose.Types.ObjectId(data.staffId),
      isDeleted: false,
    }).lean();

    if (existing) {
      throw new BadRequestError('Salary record already exists for this staff member');
    }

    const record = await SalaryRecord.create({
      ...data,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      staffId: new mongoose.Types.ObjectId(data.staffId),
    });

    const populated = await SalaryRecord.findById(record._id)
      .populate('staffId', 'firstName lastName email')
      .lean<ISalaryRecord>();

    logger.info({ schoolId, staffId: data.staffId }, 'Salary record created');
    return populated as ISalaryRecord;
  }

  static async listSalaries(
    schoolId: string,
    filters: { department?: string; isActive?: boolean; page?: number; limit?: number },
  ): Promise<{ salaries: Record<string, unknown>[]; total: number }> {
    const query: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };
    if (filters.department) query.department = filters.department;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const [salaries, total] = await Promise.all([
      SalaryRecord.find(query)
        .populate('staffId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SalaryRecord.countDocuments(query),
    ]);

    const masked = salaries.map((s) => maskSalary(s as unknown as Record<string, unknown>));
    return { salaries: masked, total };
  }

  static async getSalary(id: string, schoolId: string): Promise<ISalaryRecord> {
    const record = await SalaryRecord.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('staffId', 'firstName lastName email')
      .lean<ISalaryRecord>();

    if (!record) throw new NotFoundError('Salary record not found');
    return record;
  }

  static async updateSalary(
    id: string,
    schoolId: string,
    userId: string,
    data: UpdateSalaryInput,
  ): Promise<ISalaryRecord> {
    const existing = await SalaryRecord.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean<ISalaryRecord>();

    if (!existing) throw new NotFoundError('Salary record not found');

    // Track changes for history
    const { reason, ...updateData } = data;
    const historyEntries: Array<{
      salaryRecordId: mongoose.Types.ObjectId;
      changedBy: mongoose.Types.ObjectId;
      changedAt: Date;
      field: string;
      previousValue: unknown;
      newValue: unknown;
      reason: string | null;
    }> = [];
    const now = new Date();

    for (const [key, value] of Object.entries(updateData)) {
      const prev = (existing as unknown as Record<string, unknown>)[key];
      if (JSON.stringify(prev) !== JSON.stringify(value)) {
        historyEntries.push({
          salaryRecordId: existing._id,
          changedBy: new mongoose.Types.ObjectId(userId),
          changedAt: now,
          field: key,
          previousValue: prev,
          newValue: value,
          reason: reason ?? null,
        });
      }
    }

    if (historyEntries.length > 0) {
      await SalaryHistory.insertMany(historyEntries);
    }

    const updated = await SalaryRecord.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId) },
      { $set: updateData },
      { new: true },
    )
      .populate('staffId', 'firstName lastName email')
      .lean<ISalaryRecord>();

    logger.info({ id, schoolId }, 'Salary record updated');
    return updated as ISalaryRecord;
  }

  static async getSalaryHistory(id: string, schoolId: string): Promise<unknown[]> {
    // Verify the salary record belongs to the school
    const record = await SalaryRecord.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();

    if (!record) throw new NotFoundError('Salary record not found');

    return SalaryHistory.find({
      salaryRecordId: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    })
      .populate('changedBy', 'firstName lastName')
      .sort({ changedAt: -1 })
      .lean();
  }

  // ─── Payroll Run ────────────────────────────────────────────────────────

  static async createRun(
    schoolId: string,
    userId: string,
    data: CreatePayrollRunInput,
  ): Promise<IPayrollRun> {
    // Check for existing run
    const existing = await PayrollRun.findOne({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      month: data.month,
      year: data.year,
      isDeleted: false,
    }).lean();

    if (existing) {
      throw new BadRequestError(`Payroll run for ${data.month}/${data.year} already exists`);
    }

    // Fetch all active salary records
    const salaries = await SalaryRecord.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isActive: true,
      isDeleted: false,
    }).lean<ISalaryRecord[]>();

    if (salaries.length === 0) {
      throw new BadRequestError('No active salary records found');
    }

    // Fetch tax table
    const taxTable = await TaxService.getTaxTable(schoolId);

    // Fetch unpaid leave days (try-catch — Leave module may not exist)
    const unpaidLeaveMap = await PayrollService.getUnpaidLeaveDays(
      schoolId, data.month, data.year,
    );

    // Calculate each employee's pay
    const items: IPayrollItem[] = salaries.map((salary) => {
      const grossPay = computeGrossPay(salary);
      const unpaidDays = unpaidLeaveMap.get(salary.staffId.toString()) ?? 0;
      const workingDaysInMonth = 22;
      const leaveDeduction = unpaidDays > 0
        ? Math.round((salary.basicSalary / workingDaysInMonth) * unpaidDays)
        : 0;

      const preTaxDeds = salary.deductions.filter((d) => d.preTax).reduce((s, d) => s + d.amount, 0);
      const postTaxDeds = salary.deductions.filter((d) => !d.preTax).reduce((s, d) => s + d.amount, 0);
      const taxableIncome = Math.max(0, grossPay - leaveDeduction - preTaxDeds);

      const age = TaxService.calculateAge(new Date(salary.dateOfBirth), new Date(data.year, data.month - 1, 1));
      const paye = TaxService.calculatePAYE(
        taxableIncome, taxTable.brackets, taxTable.rebates, taxTable.medicalCredits, age,
      );
      const uif = TaxService.calculateUIF(grossPay, taxTable.uifRate, taxTable.uifCeiling);
      const sdl = TaxService.calculateSDL(grossPay, taxTable.sdlRate);
      const netPay = grossPay - leaveDeduction - preTaxDeds - paye - uif.employee - postTaxDeds;

      return {
        staffId: salary.staffId,
        salaryRecordId: salary._id,
        basicSalary: salary.basicSalary,
        allowances: grossPay - salary.basicSalary,
        grossPay,
        unpaidLeaveDays: unpaidDays,
        leaveDeduction,
        preTaxDeductions: preTaxDeds,
        taxableIncome,
        paye,
        uifEmployee: uif.employee,
        uifEmployer: uif.employer,
        sdl,
        postTaxDeductions: postTaxDeds,
        adjustments: [],
        netPay: Math.max(0, netPay),
      };
    });

    const totals: IPayrollTotals = {
      grossPay: items.reduce((s, i) => s + i.grossPay, 0),
      totalPAYE: items.reduce((s, i) => s + i.paye, 0),
      totalUIF: items.reduce((s, i) => s + i.uifEmployee, 0),
      totalUIFEmployer: items.reduce((s, i) => s + i.uifEmployer, 0),
      totalSDL: items.reduce((s, i) => s + i.sdl, 0),
      totalDeductions: items.reduce((s, i) => s + i.preTaxDeductions + i.paye + i.uifEmployee + i.postTaxDeductions, 0),
      totalNetPay: items.reduce((s, i) => s + i.netPay, 0),
      employeeCount: items.length,
    };

    const run = await PayrollRun.create({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      month: data.month,
      year: data.year,
      description: data.description ?? null,
      status: 'draft',
      totals,
      items,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    const populated = await PayrollRun.findById(run._id)
      .populate('items.staffId', 'firstName lastName email')
      .lean<IPayrollRun>();

    logger.info({ schoolId, month: data.month, year: data.year, employees: items.length }, 'Payroll run created');
    return populated as IPayrollRun;
  }

  // ─── Unpaid Leave Integration ───────────────────────────────────────────

  private static async getUnpaidLeaveDays(
    schoolId: string,
    month: number,
    year: number,
  ): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    try {
      const LeaveRequest = mongoose.model('LeaveRequest');
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);

      const leaves = await LeaveRequest.find({
        schoolId: new mongoose.Types.ObjectId(schoolId),
        leaveType: 'unpaid',
        status: 'approved',
        isDeleted: false,
        startDate: { $lte: endOfMonth },
        endDate: { $gte: startOfMonth },
      }).lean();

      for (const leave of leaves) {
        const rec = leave as Record<string, unknown>;
        const staffId = String(rec.staffId);
        const days = (rec.workingDays as number) ?? 0;
        result.set(staffId, (result.get(staffId) ?? 0) + days);
      }
    } catch (err: unknown) {
      logger.warn({ err }, 'Leave module not available — skipping unpaid leave deductions');
    }
    return result;
  }
}
