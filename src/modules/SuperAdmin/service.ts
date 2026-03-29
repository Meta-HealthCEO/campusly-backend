import { Types } from 'mongoose';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import {
  Tenant,
  PlatformInvoice,
  SupportTicket,
  type ITenant,
  type IPlatformInvoice,
  type ISupportTicket,
} from './model.js';
import type {
  OnboardSchoolInput,
  UpdateTenantStatusInput,
  UpdateTenantModulesInput,
  SuspendTenantInput,
  GeneratePlatformInvoiceInput,
  CreateSupportTicketInput,
  ReplyToTicketInput,
  AssignTicketInput,
  UpdateTicketStatusInput,
} from './validation.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  status?: string;
  tenantId?: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function getPagination(query: ListQuery) {
  const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
  const limit = Math.min(
    Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
    PAGINATION_DEFAULTS.maxLimit,
  );
  const skip = (page - 1) * limit;
  const sortField = query.sort ?? '-createdAt';
  return { page, limit, skip, sortField };
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `INV-${datePart}-${randomPart}`;
}

// ─── SuperAdmin Service ───────────────────────────────────────────────────────

export class SuperAdminService {
  // ─── Tenant Management ────────────────────────────────────────────────

  static async onboardSchool(data: OnboardSchoolInput): Promise<ITenant> {
    const existing = await Tenant.findOne({ schoolId: data.schoolId, isDeleted: false });
    if (existing) throw new BadRequestError('School is already onboarded as a tenant');

    const now = new Date();
    const defaultTrialEnd = new Date(now);
    defaultTrialEnd.setDate(defaultTrialEnd.getDate() + 30);

    const tenant = new Tenant({
      schoolId: data.schoolId,
      status: 'trial',
      trialStartDate: data.trialStartDate ? new Date(data.trialStartDate) : now,
      trialEndDate: data.trialEndDate ? new Date(data.trialEndDate) : defaultTrialEnd,
      subscription: data.subscription
        ? {
            ...data.subscription,
            nextBillingDate: data.subscription.nextBillingDate
              ? new Date(data.subscription.nextBillingDate)
              : undefined,
          }
        : undefined,
      modulesEnabled: data.modulesEnabled ?? [],
      limits: data.limits ?? { maxStudents: 500, maxStaff: 50 },
      usage: { currentStudents: 0, currentStaff: 0 },
      billingContact: data.billingContact,
      onboardingStatus: data.onboardingStatus ?? 'pending',
      notes: data.notes,
    });

    return tenant.save();
  }

  static async getAllTenants(query: ListQuery): Promise<PaginatedResult<ITenant>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.status) filter.status = query.status;

    const [data, total] = await Promise.all([
      Tenant.find(filter)
        .populate('schoolId', 'name email phone')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Tenant.countDocuments(filter),
    ]);

    return { data: data as unknown as ITenant[], total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getTenantDetail(tenantId: string): Promise<ITenant> {
    const tenant = await Tenant.findOne({ _id: tenantId, isDeleted: false }).populate(
      'schoolId',
      'name email phone address',
    );
    if (!tenant) throw new NotFoundError('Tenant not found');
    return tenant;
  }

  static async updateTenantStatus(
    tenantId: string,
    data: UpdateTenantStatusInput,
  ): Promise<ITenant> {
    const setFields: Record<string, unknown> = { status: data.status };
    if (data.notes) setFields.notes = data.notes;

    const tenant = await Tenant.findOneAndUpdate(
      { _id: tenantId, isDeleted: false },
      { $set: setFields },
      { new: true, runValidators: true },
    );
    if (!tenant) throw new NotFoundError('Tenant not found');
    return tenant;
  }

  static async updateTenantModules(
    tenantId: string,
    data: UpdateTenantModulesInput,
  ): Promise<ITenant> {
    const tenant = await Tenant.findOneAndUpdate(
      { _id: tenantId, isDeleted: false },
      { $set: { modulesEnabled: data.modulesEnabled } },
      { new: true, runValidators: true },
    );
    if (!tenant) throw new NotFoundError('Tenant not found');
    return tenant;
  }

  static async suspendTenant(tenantId: string, data: SuspendTenantInput): Promise<ITenant> {
    const tenant = await Tenant.findOne({ _id: tenantId, isDeleted: false });
    if (!tenant) throw new NotFoundError('Tenant not found');
    if (tenant.status === 'suspended') throw new BadRequestError('Tenant is already suspended');

    const updated = await Tenant.findOneAndUpdate(
      { _id: tenantId, isDeleted: false },
      { $set: { status: 'suspended', notes: data.reason } },
      { new: true, runValidators: true },
    );
    if (!updated) throw new NotFoundError('Tenant not found');
    return updated;
  }

  // ─── Platform Stats ───────────────────────────────────────────────────

  static async getPlatformStats() {
    type StatRow = { _id: string; count: number };
    type InvoiceRow = { _id: string; count: number; total: number };

    const [tenantStats, invoiceStats, ticketStats] = await Promise.all([
      Tenant.aggregate<StatRow>([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      PlatformInvoice.aggregate<InvoiceRow>([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } },
      ]),
      SupportTicket.aggregate<StatRow>([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const byStatus = (rows: StatRow[]) =>
      rows.reduce<Record<string, number>>((acc, r) => { acc[r._id] = r.count; return acc; }, {});

    const tc = byStatus(tenantStats);
    const sc = byStatus(ticketStats);
    const ic = invoiceStats.reduce<Record<string, { count: number; total: number }>>((acc, r) => {
      acc[r._id] = { count: r.count, total: r.total };
      return acc;
    }, {});

    return {
      tenants: {
        total: (tc['trial'] ?? 0) + (tc['active'] ?? 0) + (tc['suspended'] ?? 0) + (tc['cancelled'] ?? 0),
        trial: tc['trial'] ?? 0,
        active: tc['active'] ?? 0,
        suspended: tc['suspended'] ?? 0,
        cancelled: tc['cancelled'] ?? 0,
      },
      revenue: {
        totalPaid: ic['paid']?.total ?? 0,
        paidInvoices: ic['paid']?.count ?? 0,
        overdueInvoices: ic['overdue']?.count ?? 0,
        draftInvoices: ic['draft']?.count ?? 0,
      },
      support: {
        open: sc['open'] ?? 0,
        inProgress: sc['in_progress'] ?? 0,
        resolved: sc['resolved'] ?? 0,
        closed: sc['closed'] ?? 0,
      },
    };
  }

  // ─── Platform Invoice ─────────────────────────────────────────────────

  static async generatePlatformInvoice(
    data: GeneratePlatformInvoiceInput,
  ): Promise<IPlatformInvoice> {
    const tenant = await Tenant.findOne({ _id: data.tenantId, isDeleted: false });
    if (!tenant) throw new NotFoundError('Tenant not found');

    const lineItems = data.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    const amount = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = data.tax ?? 0;
    const total = amount + (amount * taxRate) / 100;

    let invoiceNumber = generateInvoiceNumber();
    let attempts = 0;
    while (await PlatformInvoice.exists({ invoiceNumber })) {
      invoiceNumber = generateInvoiceNumber();
      if (++attempts > 10) throw new BadRequestError('Failed to generate unique invoice number');
    }

    const invoice = new PlatformInvoice({
      tenantId: new Types.ObjectId(data.tenantId),
      invoiceNumber,
      amount,
      tax: taxRate,
      total,
      status: data.status ?? 'draft',
      lineItems,
      issuedDate: data.issuedDate ? new Date(data.issuedDate) : new Date(),
      dueDate: new Date(data.dueDate),
    });

    return invoice.save();
  }

  static async getPlatformRevenue(query: { year?: number; month?: number }) {
    type InvoiceRow = { _id: string; count: number; total: number };

    const matchStage: Record<string, unknown> = { isDeleted: false, status: 'paid' };

    if (query.year) {
      const start = new Date(query.year, 0, 1);
      const end = new Date(query.year + 1, 0, 1);
      matchStage.paidDate = { $gte: start, $lt: end };
    }

    const [monthly, totals] = await Promise.all([
      PlatformInvoice.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { year: { $year: '$paidDate' }, month: { $month: '$paidDate' } },
            revenue: { $sum: '$total' },
            invoiceCount: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      PlatformInvoice.aggregate<InvoiceRow>([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } },
      ]),
    ]);

    const tm = totals.reduce<Record<string, { count: number; total: number }>>((acc, r) => {
      acc[r._id] = { count: r.count, total: r.total };
      return acc;
    }, {});

    return {
      monthly,
      summary: {
        totalPaid: tm['paid']?.total ?? 0,
        totalPaidCount: tm['paid']?.count ?? 0,
        totalOverdue: tm['overdue']?.total ?? 0,
        totalOverdueCount: tm['overdue']?.count ?? 0,
        totalDraft: tm['draft']?.total ?? 0,
        totalDraftCount: tm['draft']?.count ?? 0,
      },
    };
  }

  static async getInvoicesByTenant(
    tenantId: string,
    query: ListQuery,
  ): Promise<PaginatedResult<IPlatformInvoice>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = {
      isDeleted: false,
      tenantId: new Types.ObjectId(tenantId),
    };
    if (query.status) filter.status = query.status;

    const [data, total] = await Promise.all([
      PlatformInvoice.find(filter).sort(sortField).skip(skip).limit(limit).lean().exec(),
      PlatformInvoice.countDocuments(filter),
    ]);

    return {
      data: data as unknown as IPlatformInvoice[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Support Tickets ──────────────────────────────────────────────────

  static async createSupportTicket(
    data: CreateSupportTicketInput,
    raisedBy: string,
  ): Promise<ISupportTicket> {
    const tenant = await Tenant.findOne({ _id: data.tenantId, isDeleted: false });
    if (!tenant) throw new NotFoundError('Tenant not found');

    const ticket = new SupportTicket({
      tenantId: new Types.ObjectId(data.tenantId),
      schoolId: new Types.ObjectId(data.schoolId),
      raisedBy: new Types.ObjectId(raisedBy),
      category: data.category,
      subject: data.subject,
      description: data.description,
      priority: data.priority ?? 'medium',
      status: 'open',
      messages: [],
    });

    return ticket.save();
  }

  static async listSupportTickets(query: ListQuery): Promise<PaginatedResult<ISupportTicket>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { isDeleted: false };
    if (query.status) filter.status = query.status;
    if (query.tenantId) filter.tenantId = new Types.ObjectId(query.tenantId);

    const [data, total] = await Promise.all([
      SupportTicket.find(filter)
        .populate('raisedBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      SupportTicket.countDocuments(filter),
    ]);

    return {
      data: data as unknown as ISupportTicket[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getTicketDetail(ticketId: string): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findOne({ _id: ticketId, isDeleted: false })
      .populate('raisedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');
    if (!ticket) throw new NotFoundError('Support ticket not found');
    return ticket;
  }

  static async replyToTicket(
    ticketId: string,
    data: ReplyToTicketInput,
    senderId: string,
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findOne({ _id: ticketId, isDeleted: false });
    if (!ticket) throw new NotFoundError('Support ticket not found');
    if (ticket.status === 'closed') throw new BadRequestError('Cannot reply to a closed ticket');

    const newStatus = ticket.status === 'open' ? 'in_progress' : ticket.status;

    const updated = await SupportTicket.findOneAndUpdate(
      { _id: ticketId, isDeleted: false },
      {
        $push: {
          messages: {
            senderId: new Types.ObjectId(senderId),
            message: data.message,
            timestamp: new Date(),
            isInternal: data.isInternal ?? false,
          },
        },
        $set: { status: newStatus },
      },
      { new: true, runValidators: true },
    );
    if (!updated) throw new NotFoundError('Support ticket not found');
    return updated;
  }

  static async assignTicket(ticketId: string, data: AssignTicketInput): Promise<ISupportTicket> {
    const updated = await SupportTicket.findOneAndUpdate(
      { _id: ticketId, isDeleted: false },
      { $set: { assignedTo: new Types.ObjectId(data.assignedTo), status: 'in_progress' } },
      { new: true, runValidators: true },
    );
    if (!updated) throw new NotFoundError('Support ticket not found');
    return updated;
  }

  static async updateTicketStatus(
    ticketId: string,
    data: UpdateTicketStatusInput,
  ): Promise<ISupportTicket> {
    const setFields: Record<string, unknown> = { status: data.status };
    if (data.status === 'resolved') setFields.resolvedAt = new Date();

    const updated = await SupportTicket.findOneAndUpdate(
      { _id: ticketId, isDeleted: false },
      { $set: setFields },
      { new: true, runValidators: true },
    );
    if (!updated) throw new NotFoundError('Support ticket not found');
    return updated;
  }
}
