import mongoose from 'mongoose';
import { PayrollRun, PayrollTaxCertificate } from './model-run.js';
import type { IPayrollRun, ITaxCertificate } from './model-run.js';
import { SalaryRecord } from './model.js';
import type { ISalaryRecord } from './model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import type { AdjustItemInput, ReviewRunInput } from './validation.js';

// ─── Run Lifecycle ────────────────────────────────────────────────────────────

export class PayrollRunService {
  static async listRuns(
    schoolId: string,
    filters: { year?: number; status?: string; page?: number; limit?: number },
  ): Promise<{ runs: IPayrollRun[]; total: number }> {
    const query: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };
    if (filters.year) query.year = filters.year;
    if (filters.status) query.status = filters.status;

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const [runs, total] = await Promise.all([
      PayrollRun.find(query)
        .populate('items.staffId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .sort({ year: -1, month: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<IPayrollRun[]>(),
      PayrollRun.countDocuments(query),
    ]);

    return { runs, total };
  }

  static async getRun(id: string, schoolId: string): Promise<IPayrollRun> {
    const run = await PayrollRun.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('items.staffId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('processedBy', 'firstName lastName')
      .lean<IPayrollRun>();

    if (!run) throw new NotFoundError('Payroll run not found');
    return run;
  }

  static async reviewRun(id: string, schoolId: string, userId: string, data: ReviewRunInput): Promise<IPayrollRun> {
    const run = await PayrollRun.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean<IPayrollRun>();

    if (!run) throw new NotFoundError('Payroll run not found');
    if (run.status !== 'draft') throw new BadRequestError('Only draft runs can be reviewed');

    const updated = await PayrollRun.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          status: 'reviewed',
          reviewedBy: new mongoose.Types.ObjectId(userId),
          reviewedAt: new Date(),
          reviewNotes: data.reviewNotes ?? null,
        },
      },
      { new: true },
    ).lean<IPayrollRun>();

    logger.info({ runId: id, schoolId }, 'Payroll run reviewed');
    return updated as IPayrollRun;
  }

  static async approveRun(id: string, schoolId: string, userId: string): Promise<IPayrollRun> {
    const run = await PayrollRun.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean<IPayrollRun>();

    if (!run) throw new NotFoundError('Payroll run not found');
    if (run.status !== 'reviewed') throw new BadRequestError('Only reviewed runs can be approved');

    const updated = await PayrollRun.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          status: 'approved',
          approvedBy: new mongoose.Types.ObjectId(userId),
          approvedAt: new Date(),
        },
      },
      { new: true },
    ).lean<IPayrollRun>();

    logger.info({ runId: id, schoolId }, 'Payroll run approved');
    return updated as IPayrollRun;
  }

  static async processRun(id: string, schoolId: string, userId: string): Promise<IPayrollRun> {
    const run = await PayrollRun.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean<IPayrollRun>();

    if (!run) throw new NotFoundError('Payroll run not found');
    if (run.status !== 'approved') throw new BadRequestError('Only approved runs can be processed');

    const updated = await PayrollRun.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          status: 'processed',
          processedBy: new mongoose.Types.ObjectId(userId),
          processedAt: new Date(),
        },
      },
      { new: true },
    ).lean<IPayrollRun>();

    logger.info({ runId: id, schoolId }, 'Payroll run processed');
    return updated as IPayrollRun;
  }

  static async adjustItem(
    runId: string,
    itemId: string,
    schoolId: string,
    data: AdjustItemInput,
  ): Promise<IPayrollRun> {
    const run = await PayrollRun.findOne({
      _id: new mongoose.Types.ObjectId(runId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    });

    if (!run) throw new NotFoundError('Payroll run not found');
    if (run.status !== 'draft') throw new BadRequestError('Adjustments only allowed on draft runs');

    const item = run.items.find((i) => String(i._id) === itemId);
    if (!item) throw new NotFoundError('Payroll item not found');

    // Apply adjustments
    item.adjustments = data.adjustments;
    let adjTotal = 0;
    for (const adj of data.adjustments) {
      adjTotal += adj.type === 'addition' ? adj.amount : -adj.amount;
    }
    item.netPay = Math.max(0, item.netPay + adjTotal);

    // Recalculate totals
    run.totals.totalNetPay = run.items.reduce((s, i) => s + i.netPay, 0);

    await run.save();
    logger.info({ runId, itemId, schoolId }, 'Payroll item adjusted');

    return PayrollRunService.getRun(runId, schoolId);
  }

  // ─── Payslip ────────────────────────────────────────────────────────────

  static async getPayslip(
    runId: string,
    staffId: string,
    schoolId: string,
  ): Promise<Record<string, unknown>> {
    const run = await PayrollRun.findOne({
      _id: new mongoose.Types.ObjectId(runId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('items.staffId', 'firstName lastName email')
      .lean<IPayrollRun>();

    if (!run) throw new NotFoundError('Payroll run not found');

    const item = run.items.find((i) => String(i.staffId?._id ?? i.staffId) === staffId);
    if (!item) throw new NotFoundError('Payslip not found for this staff member');

    const salary = await SalaryRecord.findOne({
      staffId: new mongoose.Types.ObjectId(staffId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean<ISalaryRecord>();

    const staffRec = item.staffId as unknown as Record<string, unknown>;
    const staffName = `${staffRec.firstName ?? ''} ${staffRec.lastName ?? ''}`.trim();

    // Build earnings list
    const earnings: Array<{ description: string; amount: number }> = [
      { description: 'Basic Salary', amount: item.basicSalary },
    ];
    if (salary) {
      for (const a of salary.allowances) {
        earnings.push({ description: a.name, amount: a.amount });
      }
    }

    // Build deductions list
    const deductions: Array<{ description: string; amount: number }> = [
      { description: 'PAYE', amount: item.paye },
      { description: 'UIF (Employee)', amount: item.uifEmployee },
    ];
    if (salary) {
      for (const d of salary.deductions) {
        deductions.push({ description: d.name, amount: d.amount });
      }
    }

    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return {
      payslipNumber: `PS-${run.year}${String(run.month).padStart(2, '0')}-${staffId.slice(-4)}`,
      staffName,
      department: salary?.department ?? 'N/A',
      payPeriod: `${monthNames[run.month]} ${run.year}`,
      earnings,
      deductions,
      grossPay: item.grossPay,
      totalDeductions: item.paye + item.uifEmployee + item.preTaxDeductions + item.postTaxDeductions,
      netPay: item.netPay,
    };
  }

  // ─── Bank File ──────────────────────────────────────────────────────────

  static async generateBankFile(
    runId: string,
    schoolId: string,
    format: 'acb' | 'csv',
  ): Promise<{ filename: string; content: string; contentType: string }> {
    const run = await PayrollRun.findOne({
      _id: new mongoose.Types.ObjectId(runId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('items.staffId', 'firstName lastName')
      .lean<IPayrollRun>();

    if (!run) throw new NotFoundError('Payroll run not found');
    if (run.status !== 'approved' && run.status !== 'processed') {
      throw new BadRequestError('Bank file can only be generated for approved or processed runs');
    }

    const salaries = await SalaryRecord.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isActive: true,
      isDeleted: false,
    }).lean<ISalaryRecord[]>();

    const salaryMap = new Map(salaries.map((s) => [String(s.staffId), s]));
    const period = `${run.year}${String(run.month).padStart(2, '0')}`;

    if (format === 'csv') {
      const header = 'Employee Name,Account Number,Branch Code,Bank Name,Account Type,Amount (ZAR)';
      const rows = run.items.map((item) => {
        const staff = item.staffId as unknown as Record<string, unknown>;
        const salary = salaryMap.get(String(staff._id ?? item.staffId));
        const name = `${staff.firstName ?? ''} ${staff.lastName ?? ''}`.trim();
        const bank = salary?.bankDetails;
        const amountRands = (item.netPay / 100).toFixed(2);
        return `"${name}","${bank?.accountNumber ?? ''}","${bank?.branchCode ?? ''}","${bank?.bankName ?? ''}","${bank?.accountType ?? ''}","${amountRands}"`;
      });

      return {
        filename: `payroll-${period}.csv`,
        content: [header, ...rows].join('\n'),
        contentType: 'text/csv',
      };
    }

    // ACB format (simplified fixed-width)
    const lines: string[] = [];
    lines.push(`H${period.padEnd(119)}`); // header
    for (const item of run.items) {
      const staff = item.staffId as unknown as Record<string, unknown>;
      const salary = salaryMap.get(String(staff._id ?? item.staffId));
      const bank = salary?.bankDetails;
      const name = `${staff.firstName ?? ''} ${staff.lastName ?? ''}`.trim().slice(0, 30).padEnd(30);
      const acct = (bank?.accountNumber ?? '').padEnd(16);
      const branch = (bank?.branchCode ?? '').padEnd(6);
      const amount = String(item.netPay).padStart(12, '0');
      lines.push(`T${branch}${acct}${name}${amount}${''.padEnd(120 - 1 - 6 - 16 - 30 - 12)}`);
    }
    const totalAmount = String(run.totals.totalNetPay).padStart(12, '0');
    lines.push(`Z${String(run.items.length).padStart(6, '0')}${totalAmount}${''.padEnd(101)}`);

    return {
      filename: `payroll-${period}.acb`,
      content: lines.join('\n'),
      contentType: 'text/plain',
    };
  }

  // ─── Tax Certificates ──────────────────────────────────────────────────

  static async generateCertificates(
    schoolId: string,
    taxYear: number,
    certificateType: 'IRP5' | 'IT3a',
  ): Promise<{ generated: number; certificates: ITaxCertificate[] }> {
    // Get all processed runs in the tax year (March previous year to February this year)
    const startMonth = new Date(taxYear - 1, 2, 1); // March of previous year
    const endMonth = new Date(taxYear, 1, 28); // February of tax year

    const runs = await PayrollRun.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      status: 'processed',
      isDeleted: false,
      $expr: {
        $and: [
          { $gte: [{ $dateFromParts: { year: '$year', month: '$month', day: 1 } }, startMonth] },
          { $lte: [{ $dateFromParts: { year: '$year', month: '$month', day: 1 } }, endMonth] },
        ],
      },
    }).lean<IPayrollRun[]>();

    // Aggregate by staff member
    const staffTotals = new Map<string, { income: number; paye: number; uif: number; deductions: number }>();

    for (const run of runs) {
      for (const item of run.items) {
        const sid = String(item.staffId);
        const existing = staffTotals.get(sid) ?? { income: 0, paye: 0, uif: 0, deductions: 0 };
        existing.income += item.grossPay;
        existing.paye += item.paye;
        existing.uif += item.uifEmployee;
        existing.deductions += item.preTaxDeductions + item.postTaxDeductions;
        staffTotals.set(sid, existing);
      }
    }

    const certificates: ITaxCertificate[] = [];
    let counter = 1;

    for (const [staffId, totals] of staffTotals) {
      const certNumber = `${certificateType}-${taxYear}-${String(counter).padStart(4, '0')}`;
      const cert = await PayrollTaxCertificate.findOneAndUpdate(
        {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          staffId: new mongoose.Types.ObjectId(staffId),
          taxYear,
        },
        {
          $set: {
            certificateType,
            certificateNumber: certNumber,
            totalIncome: totals.income,
            totalPAYE: totals.paye,
            totalUIF: totals.uif,
            totalDeductions: totals.deductions,
            status: 'generated',
            isDeleted: false,
          },
        },
        { upsert: true, new: true },
      )
        .populate('staffId', 'firstName lastName email')
        .lean<ITaxCertificate>();

      certificates.push(cert as ITaxCertificate);
      counter++;
    }

    logger.info({ schoolId, taxYear, generated: certificates.length }, 'Tax certificates generated');
    return { generated: certificates.length, certificates };
  }

  // ─── CTC Report ────────────────────────────────────────────────────────

  static async getCostToCompany(
    schoolId: string,
    month: number,
    year: number,
  ): Promise<Record<string, unknown>> {
    const run = await PayrollRun.findOne({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      month,
      year,
      isDeleted: false,
    }).lean<IPayrollRun>();

    const salaries = await SalaryRecord.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isActive: true,
      isDeleted: false,
    }).lean<ISalaryRecord[]>();

    // Group by department
    const deptMap = new Map<string, { headcount: number; basic: number; allowances: number; employer: number }>();

    for (const salary of salaries) {
      const dept = salary.department ?? 'Unassigned';
      const entry = deptMap.get(dept) ?? { headcount: 0, basic: 0, allowances: 0, employer: 0 };
      entry.headcount++;
      entry.basic += salary.basicSalary;
      entry.allowances += salary.allowances.reduce((s, a) => s + a.amount, 0);

      // Find employer contributions from run
      if (run) {
        const item = run.items.find((i) => String(i.staffId) === String(salary.staffId));
        if (item) {
          entry.employer += item.uifEmployer + item.sdl;
        }
      }

      deptMap.set(dept, entry);
    }

    const departments = Array.from(deptMap.entries()).map(([dept, data]) => ({
      department: dept,
      headcount: data.headcount,
      totalBasic: data.basic,
      totalAllowances: data.allowances,
      totalEmployerContributions: data.employer,
      costToCompany: data.basic + data.allowances + data.employer,
    }));

    const schoolTotal = departments.reduce(
      (acc, d) => ({
        headcount: acc.headcount + d.headcount,
        totalBasic: acc.totalBasic + d.totalBasic,
        totalAllowances: acc.totalAllowances + d.totalAllowances,
        totalEmployerContributions: acc.totalEmployerContributions + d.totalEmployerContributions,
        costToCompany: acc.costToCompany + d.costToCompany,
      }),
      { headcount: 0, totalBasic: 0, totalAllowances: 0, totalEmployerContributions: 0, costToCompany: 0 },
    );

    return { month, year, departments, schoolTotal };
  }
}
