import { Request, Response } from 'express';
import { SuperAdminService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class SuperAdminController {
  // ─── Tenant Management ────────────────────────────────────────────────

  static async onboardSchool(req: Request, res: Response): Promise<void> {
    const tenant = await SuperAdminService.onboardSchool(req.body);
    res.status(201).json(apiResponse(true, tenant, 'School onboarded successfully'));
  }

  static async getPlatformStats(_req: Request, res: Response): Promise<void> {
    const stats = await SuperAdminService.getPlatformStats();
    res.json(apiResponse(true, stats, 'Platform stats retrieved successfully'));
  }

  static async getAllTenants(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
    };
    const result = await SuperAdminService.getAllTenants(query);
    res.json(apiResponse(true, result, 'Tenants retrieved successfully'));
  }

  static async getTenantDetail(req: Request, res: Response): Promise<void> {
    const tenant = await SuperAdminService.getTenantDetail(req.params.id as string);
    res.json(apiResponse(true, tenant, 'Tenant retrieved successfully'));
  }

  static async updateTenantStatus(req: Request, res: Response): Promise<void> {
    const tenant = await SuperAdminService.updateTenantStatus(req.params.id as string, req.body);
    res.json(apiResponse(true, tenant, 'Tenant status updated successfully'));
  }

  static async updateTenantModules(req: Request, res: Response): Promise<void> {
    const tenant = await SuperAdminService.updateTenantModules(req.params.id as string, req.body);
    res.json(apiResponse(true, tenant, 'Tenant modules updated successfully'));
  }

  static async suspendTenant(req: Request, res: Response): Promise<void> {
    const tenant = await SuperAdminService.suspendTenant(req.params.id as string, req.body);
    res.json(apiResponse(true, tenant, 'Tenant suspended successfully'));
  }

  // ─── Platform Invoice ─────────────────────────────────────────────────

  static async generatePlatformInvoice(req: Request, res: Response): Promise<void> {
    const invoice = await SuperAdminService.generatePlatformInvoice(req.body);
    res.status(201).json(apiResponse(true, invoice, 'Platform invoice generated successfully'));
  }

  static async getPlatformRevenue(req: Request, res: Response): Promise<void> {
    const query = {
      year: req.query.year ? Number(req.query.year) : undefined,
      month: req.query.month ? Number(req.query.month) : undefined,
    };
    const revenue = await SuperAdminService.getPlatformRevenue(query);
    res.json(apiResponse(true, revenue, 'Platform revenue retrieved successfully'));
  }

  static async getInvoicesByTenant(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      status: req.query.status as string | undefined,
    };
    const result = await SuperAdminService.getInvoicesByTenant(
      req.params.tenantId as string,
      query,
    );
    res.json(apiResponse(true, result, 'Tenant invoices retrieved successfully'));
  }

  // ─── Support Tickets ──────────────────────────────────────────────────

  static async createSupportTicket(req: Request, res: Response): Promise<void> {
    const ticket = await SuperAdminService.createSupportTicket(req.body, req.user!.id);
    res.status(201).json(apiResponse(true, ticket, 'Support ticket created successfully'));
  }

  static async listSupportTickets(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      status: req.query.status as string | undefined,
      tenantId: req.query.tenantId as string | undefined,
    };
    const result = await SuperAdminService.listSupportTickets(query);
    res.json(apiResponse(true, result, 'Support tickets retrieved successfully'));
  }

  static async getTicketDetail(req: Request, res: Response): Promise<void> {
    const ticket = await SuperAdminService.getTicketDetail(req.params.id as string);
    res.json(apiResponse(true, ticket, 'Support ticket retrieved successfully'));
  }

  static async replyToTicket(req: Request, res: Response): Promise<void> {
    const ticket = await SuperAdminService.replyToTicket(
      req.params.id as string,
      req.body,
      req.user!.id,
    );
    res.json(apiResponse(true, ticket, 'Reply sent successfully'));
  }

  static async assignTicket(req: Request, res: Response): Promise<void> {
    const ticket = await SuperAdminService.assignTicket(req.params.id as string, req.body);
    res.json(apiResponse(true, ticket, 'Ticket assigned successfully'));
  }

  static async updateTicketStatus(req: Request, res: Response): Promise<void> {
    const ticket = await SuperAdminService.updateTicketStatus(req.params.id as string, req.body);
    res.json(apiResponse(true, ticket, 'Ticket status updated successfully'));
  }
}
