import { Request, Response } from 'express';
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
    const feeType = await FeeService.getFeeType(req.params.id as string);
    res.json(apiResponse(true, feeType));
  }

  static async updateFeeType(req: Request, res: Response): Promise<void> {
    const feeType = await FeeService.updateFeeType(req.params.id as string, req.body);
    res.json(apiResponse(true, feeType, 'Fee type updated successfully'));
  }

  static async deleteFeeType(req: Request, res: Response): Promise<void> {
    await FeeService.deleteFeeType(req.params.id as string);
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
    const schedule = await FeeService.getFeeSchedule(req.params.id as string);
    res.json(apiResponse(true, schedule));
  }

  static async updateFeeSchedule(req: Request, res: Response): Promise<void> {
    const schedule = await FeeService.updateFeeSchedule(req.params.id as string, req.body);
    res.json(apiResponse(true, schedule, 'Fee schedule updated successfully'));
  }

  static async deleteFeeSchedule(req: Request, res: Response): Promise<void> {
    await FeeService.deleteFeeSchedule(req.params.id as string);
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
    const invoice = await FeeService.getInvoice(req.params.id as string);
    res.json(apiResponse(true, invoice));
  }

  // ─── Payment ───────────────────────────────────────────────────────────────

  static async recordPayment(req: Request, res: Response): Promise<void> {
    const result = await FeeService.recordPayment(
      req.params.id as string,
      req.body,
      req.user!.id,
    );
    res.status(201).json(apiResponse(true, result, 'Payment recorded successfully'));
  }

  static async getPayments(req: Request, res: Response): Promise<void> {
    const payments = await FeeService.getPayments(req.params.invoiceId as string);
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
    const debitOrder = await FeeService.getDebitOrder(req.params.id as string);
    res.json(apiResponse(true, debitOrder));
  }

  static async updateDebitOrder(req: Request, res: Response): Promise<void> {
    const debitOrder = await FeeService.updateDebitOrder(req.params.id as string, req.body);
    res.json(apiResponse(true, debitOrder, 'Debit order updated successfully'));
  }

  static async deleteDebitOrder(req: Request, res: Response): Promise<void> {
    await FeeService.deleteDebitOrder(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Debit order deleted successfully'));
  }
}
