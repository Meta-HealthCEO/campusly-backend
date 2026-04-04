import mongoose from 'mongoose';
import { Expense } from './model.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { UserRole } from '../../common/enums.js';
import type { CreateExpenseInput, UpdateExpenseInput } from './validation.js';

interface ExpenseListFilters {
  schoolId: string;
  categoryId?: string;
  budgetId?: string;
  status?: string;
  term?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class ExpenseService {
  static async create(
    schoolId: string,
    userId: string,
    role: UserRole,
    data: CreateExpenseInput,
  ) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const isAdmin = role === 'school_admin' || role === 'super_admin';

    const expense = await Expense.create({
      schoolId: sid,
      categoryId: new mongoose.Types.ObjectId(data.categoryId),
      budgetId: data.budgetId ? new mongoose.Types.ObjectId(data.budgetId) : undefined,
      amount: data.amount,
      description: data.description,
      vendor: data.vendor,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : undefined,
      paymentMethod: data.paymentMethod,
      receiptUrl: data.receiptUrl,
      term: data.term,
      notes: data.notes,
      status: isAdmin ? 'approved' : 'pending',
      submittedBy: new mongoose.Types.ObjectId(userId),
      approvedBy: isAdmin ? new mongoose.Types.ObjectId(userId) : undefined,
      approvedAt: isAdmin ? new Date() : undefined,
    });

    return Expense.findById(expense._id)
      .populate('categoryId', 'name code')
      .lean();
  }

  static async list(filters: ExpenseListFilters, userId?: string, role?: UserRole) {
    const sid = new mongoose.Types.ObjectId(filters.schoolId);
    const query: Record<string, unknown> = { schoolId: sid, isDeleted: false };

    // Non-admin users only see their own expenses
    if (role && role !== 'school_admin' && role !== 'super_admin') {
      query.submittedBy = new mongoose.Types.ObjectId(userId!);
    }

    if (filters.categoryId) query.categoryId = new mongoose.Types.ObjectId(filters.categoryId);
    if (filters.budgetId) query.budgetId = new mongoose.Types.ObjectId(filters.budgetId);
    if (filters.status) query.status = filters.status;
    if (filters.term) query.term = filters.term;

    if (filters.startDate || filters.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.startDate) dateFilter.$gte = new Date(filters.startDate);
      if (filters.endDate) dateFilter.$lte = new Date(filters.endDate);
      query.createdAt = dateFilter;
    }

    const { skip, limit } = paginationHelper(filters.page, filters.limit);
    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('categoryId', 'name code')
        .populate('submittedBy', 'name email')
        .lean(),
      Expense.countDocuments(query),
    ]);

    return { expenses, total, page: filters.page ?? 1, limit };
  }

  static async getById(id: string, schoolId: string) {
    const expense = await Expense.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('categoryId', 'name code')
      .populate('submittedBy', 'name email')
      .populate('approvedBy', 'name email')
      .lean();

    if (!expense) throw new NotFoundError('Expense not found');
    return expense;
  }

  static async update(
    id: string,
    schoolId: string,
    userId: string,
    role: UserRole,
    data: UpdateExpenseInput,
  ) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const eid = new mongoose.Types.ObjectId(id);

    const existing = await Expense.findOne({
      _id: eid,
      schoolId: sid,
      isDeleted: false,
    }).lean();

    if (!existing) throw new NotFoundError('Expense not found');

    const isAdmin = role === 'school_admin' || role === 'super_admin';
    const isOwner = existing.submittedBy.toString() === userId;

    if (!isAdmin) {
      if (!isOwner) throw new ForbiddenError('You can only edit your own expenses');
      if (existing.status === 'approved') {
        throw new BadRequestError('Cannot edit an approved expense');
      }
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.categoryId) updateData.categoryId = new mongoose.Types.ObjectId(data.categoryId);
    if (data.budgetId) updateData.budgetId = new mongoose.Types.ObjectId(data.budgetId);
    if (data.invoiceDate) updateData.invoiceDate = new Date(data.invoiceDate);

    const expense = await Expense.findOneAndUpdate(
      { _id: eid, schoolId: sid, isDeleted: false },
      { $set: updateData },
      { new: true },
    )
      .populate('categoryId', 'name code')
      .lean();

    if (!expense) throw new NotFoundError('Expense not found');
    return expense;
  }

  static async delete(id: string, schoolId: string) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const expense = await Expense.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), schoolId: sid, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    ).lean();

    if (!expense) throw new NotFoundError('Expense not found');
    return { success: true };
  }

  static async approve(id: string, schoolId: string, userId: string, notes?: string) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const eid = new mongoose.Types.ObjectId(id);

    const expense = await Expense.findOneAndUpdate(
      { _id: eid, schoolId: sid, isDeleted: false, status: 'pending' },
      {
        $set: {
          status: 'approved',
          approvedBy: new mongoose.Types.ObjectId(userId),
          approvedAt: new Date(),
          approvalNotes: notes ?? undefined,
        },
      },
      { new: true },
    ).lean();

    if (!expense) throw new NotFoundError('Pending expense not found');
    return expense;
  }

  static async reject(id: string, schoolId: string, userId: string, reason: string) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const eid = new mongoose.Types.ObjectId(id);

    const expense = await Expense.findOneAndUpdate(
      { _id: eid, schoolId: sid, isDeleted: false, status: 'pending' },
      {
        $set: {
          status: 'rejected',
          approvedBy: new mongoose.Types.ObjectId(userId),
          approvedAt: new Date(),
          rejectionReason: reason,
        },
      },
      { new: true },
    ).lean();

    if (!expense) throw new NotFoundError('Pending expense not found');
    return expense;
  }
}
