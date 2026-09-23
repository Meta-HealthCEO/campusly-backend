import mongoose from 'mongoose';
import { Budget } from './model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateBudgetInput, UpdateBudgetInput } from './validation.js';

export class BudgetCrudService {
  static async create(schoolId: string, userId: string, data: CreateBudgetInput) {
    const sid = new mongoose.Types.ObjectId(schoolId);

    // Validate termAmounts sums
    for (const item of data.lineItems) {
      if (item.termAmounts) {
        const sum = item.termAmounts.reduce((a, b) => a + b, 0);
        if (sum !== item.annualAmount) {
          throw new BadRequestError(
            `Term amounts (${sum}) do not sum to annual amount (${item.annualAmount}) for a line item`,
          );
        }
      }
    }

    const totalBudgeted = data.lineItems.reduce((sum, li) => sum + li.annualAmount, 0);

    const budget = await Budget.create({
      schoolId: sid,
      year: data.year,
      name: data.name,
      description: data.description,
      status: 'draft',
      totalBudgeted,
      lineItems: data.lineItems.map((li) => ({
        ...li,
        categoryId: new mongoose.Types.ObjectId(li.categoryId),
      })),
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    return budget.toObject();
  }

  static async list(
    schoolId: string,
    filters: { year?: number; status?: string; page?: number; limit?: number },
  ) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const query: Record<string, unknown> = { schoolId: sid, isDeleted: false };

    if (filters.year) query.year = filters.year;
    if (filters.status) query.status = filters.status;

    const { skip, limit } = paginationHelper(filters.page, filters.limit);
    const [budgets, total] = await Promise.all([
      Budget.find(query)
        .sort({ year: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('lineItems.categoryId', 'name code')
        .lean(),
      Budget.countDocuments(query),
    ]);

    return { budgets, total, page: filters.page ?? 1, limit };
  }

  static async getById(id: string, schoolId: string) {
    const budget = await Budget.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('lineItems.categoryId', 'name code')
      .lean();

    if (!budget) throw new NotFoundError('Budget not found');
    return budget;
  }

  static async update(id: string, schoolId: string, userId: string, data: UpdateBudgetInput) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const budgetId = new mongoose.Types.ObjectId(id);

    const existing = await Budget.findOne({
      _id: budgetId,
      schoolId: sid,
      isDeleted: false,
    }).lean();

    if (!existing) throw new NotFoundError('Budget not found');

    // Prevent modifications to approved budget line items
    if (existing.status === 'approved' && data.lineItems) {
      throw new BadRequestError('Cannot modify line items on an approved budget');
    }

    const update: Record<string, unknown> = {};

    if (data.name) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;

    if (data.lineItems) {
      // Validate termAmounts
      for (const item of data.lineItems) {
        if (item.termAmounts) {
          const sum = item.termAmounts.reduce((a, b) => a + b, 0);
          if (sum !== item.annualAmount) {
            throw new BadRequestError(
              `Term amounts (${sum}) do not sum to annual amount (${item.annualAmount})`,
            );
          }
        }
      }
      update.lineItems = data.lineItems.map((li) => ({
        ...li,
        categoryId: new mongoose.Types.ObjectId(li.categoryId),
      }));
      update.totalBudgeted = data.lineItems.reduce((sum, li) => sum + li.annualAmount, 0);
    }

    if (data.status) {
      // One-way transition to approved
      if (data.status === 'approved' && existing.status !== 'draft') {
        throw new BadRequestError('Only draft budgets can be approved');
      }
      update.status = data.status;
      if (data.status === 'approved') {
        update.approvedBy = new mongoose.Types.ObjectId(userId);
        update.approvedAt = new Date();
      }
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: budgetId, schoolId: sid, isDeleted: false },
      { $set: update },
      { new: true },
    )
      .populate('lineItems.categoryId', 'name code')
      .lean();

    if (!budget) throw new NotFoundError('Budget not found');
    return budget;
  }

  static async delete(id: string, schoolId: string) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const budgetId = new mongoose.Types.ObjectId(id);

    const existing = await Budget.findOne({
      _id: budgetId,
      schoolId: sid,
      isDeleted: false,
    }).lean();

    if (!existing) throw new NotFoundError('Budget not found');
    if (existing.status !== 'draft') {
      throw new BadRequestError('Only draft budgets can be deleted');
    }

    await Budget.findOneAndUpdate(
      { _id: budgetId, schoolId: sid },
      { $set: { isDeleted: true } },
    );

    return { success: true };
  }
}
