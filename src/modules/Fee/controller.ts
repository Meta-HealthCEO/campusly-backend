import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { FeeService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class FeeController {
  // ─── Fee Type ──────────────────────────────────────────────────────────────

  static async createFeeType(req: Request, res: Response): Promise<void> {
    const feeType = await FeeService.createFeeType(req.body);
    res.status(201).json(apiResponse(true, feeType, 'Fee type created successfully'));
  }

  static async listFeeTypes(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    const result = await FeeService.listFeeTypes(schoolId as string, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      category: req.query.category as string | undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async getFeeType(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const feeType = await FeeService.getFeeType(req.params.id as string, schoolId);
    res.json(apiResponse(true, feeType));
  }

  static async updateFeeType(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const feeType = await FeeService.updateFeeType(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, feeType, 'Fee type updated successfully'));
  }

  static async deleteFeeType(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await FeeService.deleteFeeType(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Fee type deleted successfully'));
  }

  // ─── Fee Schedule ──────────────────────────────────────────────────────────

  static async createFeeSchedule(req: Request, res: Response): Promise<void> {
    const schedule = await FeeService.createFeeSchedule(req.body);
    res.status(201).json(apiResponse(true, schedule, 'Fee schedule created successfully'));
  }

  static async listFeeSchedules(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    const result = await FeeService.listFeeSchedules(schoolId as string, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      academicYear: req.query.academicYear ? Number(req.query.academicYear) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async getFeeSchedule(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const schedule = await FeeService.getFeeSchedule(req.params.id as string, schoolId);
    res.json(apiResponse(true, schedule));
  }

  static async updateFeeSchedule(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const schedule = await FeeService.updateFeeSchedule(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, schedule, 'Fee schedule updated successfully'));
  }

  static async deleteFeeSchedule(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await FeeService.deleteFeeSchedule(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Fee schedule deleted successfully'));
  }

  // ─── Invoice ───────────────────────────────────────────────────────────────

  static async createInvoice(req: Request, res: Response): Promise<void> {
    const invoice = await FeeService.createInvoice(req.body);
    res.status(201).json(apiResponse(true, invoice, 'Invoice created successfully'));
  }

  static async listInvoices(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    const result = await FeeService.listInvoices(schoolId as string, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      status: req.query.status as string | undefined,
      studentId: req.query.studentId as string | undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async getInvoice(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const invoice = await FeeService.getInvoice(req.params.id as string, schoolId);
    res.json(apiResponse(true, invoice));
  }

  // ─── Payment ───────────────────────────────────────────────────────────────

  static async recordPayment(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await FeeService.recordPayment(
      req.params.id as string,
      req.body,
      schoolId,
      getUser(req).id,
    );
    res.status(201).json(apiResponse(true, result, 'Payment recorded successfully'));
  }

  static async getPayments(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const payments = await FeeService.getPayments(req.params.invoiceId as string, schoolId);
    res.json(apiResponse(true, payments));
  }

  // ─── Student Balance ───────────────────────────────────────────────────────

  static async getStudentBalance(req: Request, res: Response): Promise<void> {
    const balance = await FeeService.getStudentBalance(req.params.studentId as string);
    res.json(apiResponse(true, balance));
  }

  // ─── Overdue Invoices ──────────────────────────────────────────────────────

  static async getOverdueInvoices(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    const invoices = await FeeService.getOverdueInvoices(schoolId as string);
    res.json(apiResponse(true, invoices));
  }

  // ─── Debit Order ──────────────────────────────────────────────────────────

  static async createDebitOrder(req: Request, res: Response): Promise<void> {
    const debitOrder = await FeeService.createDebitOrder(req.body);
    res.status(201).json(apiResponse(true, debitOrder, 'Debit order created successfully'));
  }

  static async listDebitOrders(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    const result = await FeeService.listDebitOrders(schoolId as string, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async getDebitOrder(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const debitOrder = await FeeService.getDebitOrder(req.params.id as string, schoolId);
    res.json(apiResponse(true, debitOrder));
  }

  static async updateDebitOrder(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const debitOrder = await FeeService.updateDebitOrder(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, debitOrder, 'Debit order updated successfully'));
  }

  static async deleteDebitOrder(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await FeeService.deleteDebitOrder(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Debit order deleted successfully'));
  }

  // ─── Debtors Report ─────────────────────────────────────────────────────────

  static async getDebtorsReport(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId as string;
    const result = await FeeService.getDebtorsReport(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      minAge: req.query.minAge ? Number(req.query.minAge) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  // ─── Collection Escalation ──────────────────────────────────────────────────

  static async escalateCollection(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await FeeService.escalateCollection(req.body, schoolId, getUser(req).id);
    res.status(201).json(apiResponse(true, result, 'Collection escalated successfully'));
  }

  static async listCollectionActions(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId as string;
    const result = await FeeService.listCollectionActions(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      stage: req.query.stage as string | undefined,
    });
    res.json(apiResponse(true, result));
  }

  // ─── Statement ──────────────────────────────────────────────────────────────

  static async generateStatement(req: Request, res: Response): Promise<void> {
    const result = await FeeService.generateStatement(req.body);
    res.json(apiResponse(true, result));
  }

  // ─── Late Fees ──────────────────────────────────────────────────────────────

  static async calculateLateFees(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId as string;
    const percentage = Number(req.body.percentage ?? 5);
    const result = await FeeService.calculateLateFees(schoolId, percentage);
    res.json(apiResponse(true, result, 'Late fees calculated'));
  }

  // ─── Allocate Payment ───────────────────────────────────────────────────────

  static async allocatePayment(req: Request, res: Response): Promise<void> {
    const result = await FeeService.allocatePayment(
      req.params.studentId as string,
      req.body,
      getUser(req).id,
    );
    res.status(201).json(apiResponse(true, result, 'Payment allocated successfully'));
  }

  // ─── Payment Arrangement ────────────────────────────────────────────────────

  static async createPaymentArrangement(req: Request, res: Response): Promise<void> {
    const arrangement = await FeeService.createPaymentArrangement(req.body);
    res.status(201).json(apiResponse(true, arrangement, 'Payment arrangement created successfully'));
  }

  static async listPaymentArrangements(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId as string;
    const result = await FeeService.listPaymentArrangements(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      status: req.query.status as string | undefined,
    });
    res.json(apiResponse(true, result));
  }

  // ─── Write Off ──────────────────────────────────────────────────────────────

  static async writeOffDebt(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await FeeService.writeOffDebt(req.body, schoolId, getUser(req).id);
    res.json(apiResponse(true, result, 'Debt written off successfully'));
  }

  // ─── Discount ───────────────────────────────────────────────────────────────

  static async applyDiscount(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await FeeService.applyDiscount(req.body, schoolId, getUser(req).id);
    res.json(apiResponse(true, result, 'Discount applied successfully'));
  }

  // ─── Parent Account Balance ─────────────────────────────────────────────────

  static async getParentAccountBalance(req: Request, res: Response): Promise<void> {
    // Parents can only view their own balance
    if (req.user?.role === 'parent') {
      const { Parent } = await import('../Parent/model.js');
      const parent = await Parent.findOne({ userId: req.user.id }).lean();
      if (!parent || parent._id.toString() !== req.params.parentId) {
        res.status(403).json(apiResponse(false, undefined, undefined, 'Access denied: you can only view your own balance'));
        return;
      }
    }

    const balance = await FeeService.getParentAccountBalance(
      req.params.parentId as string,
      req.params.schoolId as string,
    );
    res.json(apiResponse(true, balance));
  }

  // ─── Bulk Invoice ───────────────────────────────────────────────────────────

  static async bulkInvoiceGeneration(req: Request, res: Response): Promise<void> {
    const result = await FeeService.bulkInvoiceGeneration(req.body);
    res.status(201).json(apiResponse(true, result, 'Bulk invoices generated successfully'));
  }

  // ─── Credit Note ────────────────────────────────────────────────────────────

  static async createCreditNote(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const creditNote = await FeeService.createCreditNote(req.body, schoolId);
    res.status(201).json(apiResponse(true, creditNote, 'Credit note created successfully'));
  }

  static async approveCreditNote(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const creditNote = await FeeService.approveCreditNote(
      req.params.id as string,
      req.body,
      schoolId,
      getUser(req).id,
    );
    res.json(apiResponse(true, creditNote, 'Credit note updated successfully'));
  }

  static async listCreditNotes(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId as string;
    const result = await FeeService.listCreditNotes(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      status: req.query.status as string | undefined,
    });
    res.json(apiResponse(true, result));
  }

  // ─── Fee Exemption ──────────────────────────────────────────────────────────

  static async createFeeExemption(req: Request, res: Response): Promise<void> {
    const exemption = await FeeService.createFeeExemption(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, exemption, 'Fee exemption created successfully'));
  }

  static async listFeeExemptions(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId as string;
    const result = await FeeService.listFeeExemptions(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      status: req.query.status as string | undefined,
    });
    res.json(apiResponse(true, result));
  }

  // ─── Account Ledger ─────────────────────────────────────────────────────────

  static async getAccountLedger(req: Request, res: Response): Promise<void> {
    const result = await FeeService.getAccountLedger(
      req.params.studentId as string,
      req.params.schoolId as string,
      {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      },
    );
    res.json(apiResponse(true, result));
  }
}
