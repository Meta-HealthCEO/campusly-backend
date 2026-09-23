import mongoose from 'mongoose';
import { BudgetCategory, Expense, Budget } from './model.js';
import { BadRequestError, NotFoundError, ConflictError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import type { CreateCategoryInput, UpdateCategoryInput } from './validation.js';

// Default SA school budget categories
const DEFAULT_CATEGORIES: { code: string; name: string; parent?: string }[] = [
  { code: 'SAL', name: 'Salaries & Wages' },
  { code: 'SAL-TEACH', name: 'Teaching Staff', parent: 'SAL' },
  { code: 'SAL-SUPP', name: 'Support Staff', parent: 'SAL' },
  { code: 'SAL-ADMIN', name: 'Administrative Staff', parent: 'SAL' },
  { code: 'MAINT', name: 'Maintenance & Repairs' },
  { code: 'MAINT-BLDG', name: 'Building Maintenance', parent: 'MAINT' },
  { code: 'MAINT-GRND', name: 'Grounds Maintenance', parent: 'MAINT' },
  { code: 'SUPP', name: 'Supplies & Materials' },
  { code: 'SUPP-EDUC', name: 'Educational Supplies', parent: 'SUPP' },
  { code: 'SUPP-OFFICE', name: 'Office Supplies', parent: 'SUPP' },
  { code: 'UTIL', name: 'Utilities' },
  { code: 'UTIL-ELEC', name: 'Electricity', parent: 'UTIL' },
  { code: 'UTIL-WATER', name: 'Water & Sewage', parent: 'UTIL' },
  { code: 'UTIL-COMM', name: 'Communications (Internet, Phone)', parent: 'UTIL' },
  { code: 'TRANS', name: 'Transport' },
  { code: 'EVENTS', name: 'Events & Functions' },
  { code: 'SPORT', name: 'Sport & Extramurals' },
  { code: 'PROF', name: 'Professional Services' },
  { code: 'PROF-AUDIT', name: 'Audit Fees', parent: 'PROF' },
  { code: 'PROF-LEGAL', name: 'Legal Fees', parent: 'PROF' },
  { code: 'INSUR', name: 'Insurance' },
  { code: 'DEPR', name: 'Depreciation' },
  { code: 'OTHER', name: 'Other Expenses' },
];

export class CategoryService {
  static async create(data: CreateCategoryInput) {
    const schoolId = new mongoose.Types.ObjectId(data.schoolId);

    // Check code uniqueness
    const existing = await BudgetCategory.findOne({
      schoolId,
      code: data.code,
      isDeleted: false,
    }).lean();
    if (existing) {
      throw new ConflictError(`Category code "${data.code}" already exists`);
    }

    // Validate parentId if provided
    if (data.parentId) {
      const parent = await BudgetCategory.findOne({
        _id: new mongoose.Types.ObjectId(data.parentId),
        schoolId,
        isDeleted: false,
      }).lean();
      if (!parent) throw new NotFoundError('Parent category not found');
    }

    const category = await BudgetCategory.create({
      ...data,
      schoolId,
      parentId: data.parentId ? new mongoose.Types.ObjectId(data.parentId) : null,
    });

    return category.toObject();
  }

  static async list(schoolId: string) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const categories = await BudgetCategory.find({
      schoolId: sid,
      isDeleted: false,
    }).sort({ code: 1 }).lean();

    // Build tree
    const topLevel = categories.filter((c) => !c.parentId);
    return topLevel.map((parent) => ({
      ...parent,
      children: categories.filter(
        (c) => c.parentId && c.parentId.toString() === parent._id.toString(),
      ),
    }));
  }

  static async listFlat(schoolId: string) {
    return BudgetCategory.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
      isActive: true,
    }).sort({ code: 1 }).lean();
  }

  static async update(id: string, schoolId: string, data: UpdateCategoryInput) {
    const sid = new mongoose.Types.ObjectId(schoolId);

    // Check code uniqueness if code is being changed
    if (data.code) {
      const existing = await BudgetCategory.findOne({
        schoolId: sid,
        code: data.code,
        _id: { $ne: new mongoose.Types.ObjectId(id) },
        isDeleted: false,
      }).lean();
      if (existing) throw new ConflictError(`Category code "${data.code}" already exists`);
    }

    const category = await BudgetCategory.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), schoolId: sid, isDeleted: false },
      { $set: data },
      { new: true },
    ).lean();

    if (!category) throw new NotFoundError('Category not found');
    return category;
  }

  static async delete(id: string, schoolId: string) {
    const sid = new mongoose.Types.ObjectId(schoolId);
    const catId = new mongoose.Types.ObjectId(id);

    // Check for linked expenses
    const expenseCount = await Expense.countDocuments({
      categoryId: catId,
      schoolId: sid,
      isDeleted: false,
    });
    if (expenseCount > 0) {
      throw new BadRequestError('Cannot delete category with linked expenses');
    }

    // Check for linked budget line items
    const budgetCount = await Budget.countDocuments({
      schoolId: sid,
      'lineItems.categoryId': catId,
      isDeleted: false,
    });
    if (budgetCount > 0) {
      throw new BadRequestError('Cannot delete category with linked budget line items');
    }

    const category = await BudgetCategory.findOneAndUpdate(
      { _id: catId, schoolId: sid, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    ).lean();

    if (!category) throw new NotFoundError('Category not found');

    // Also soft-delete children
    await BudgetCategory.updateMany(
      { parentId: catId, schoolId: sid, isDeleted: false },
      { $set: { isDeleted: true } },
    );

    return category;
  }

  static async seed(schoolId: string) {
    const sid = new mongoose.Types.ObjectId(schoolId);

    const existingCount = await BudgetCategory.countDocuments({
      schoolId: sid,
      isDeleted: false,
    });
    if (existingCount > 0) {
      throw new BadRequestError('Categories already exist for this school. Delete existing categories first.');
    }

    // Create top-level first
    const topLevel = DEFAULT_CATEGORIES.filter((c) => !c.parent);
    const parentMap = new Map<string, mongoose.Types.ObjectId>();

    for (const cat of topLevel) {
      const created = await BudgetCategory.create({
        schoolId: sid,
        name: cat.name,
        code: cat.code,
        parentId: null,
        isDefault: true,
        isActive: true,
      });
      parentMap.set(cat.code, created._id as mongoose.Types.ObjectId);
    }

    // Create children
    const children = DEFAULT_CATEGORIES.filter((c) => c.parent);
    for (const cat of children) {
      const parentId = parentMap.get(cat.parent!);
      if (!parentId) {
        logger.warn({ code: cat.code, parent: cat.parent }, 'Parent not found for category');
        continue;
      }
      await BudgetCategory.create({
        schoolId: sid,
        name: cat.name,
        code: cat.code,
        parentId,
        isDefault: true,
        isActive: true,
      });
    }

    return this.list(schoolId);
  }
}
