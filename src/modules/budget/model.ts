import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Budget Category ────────────────────────────────────────────────────────

export interface IBudgetCategory extends Document {
  schoolId: Types.ObjectId;
  name: string;
  code: string;
  parentId: Types.ObjectId | null;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const budgetCategorySchema = new Schema<IBudgetCategory>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'BudgetCategory', default: null },
    description: { type: String },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

budgetCategorySchema.index({ schoolId: 1, code: 1 }, { unique: true });
budgetCategorySchema.index({ schoolId: 1, parentId: 1 });

export const BudgetCategory = mongoose.model<IBudgetCategory>('BudgetCategory', budgetCategorySchema);

// ─── Budget (Annual) ────────────────────────────────────────────────────────

export type BudgetStatus = 'draft' | 'approved' | 'revised';

export interface IBudgetLineItem {
  _id?: Types.ObjectId;
  categoryId: Types.ObjectId;
  description?: string;
  annualAmount: number;
  termAmounts?: number[];
  notes?: string;
}

export interface IBudget extends Document {
  schoolId: Types.ObjectId;
  year: number;
  name: string;
  description?: string;
  status: BudgetStatus;
  totalBudgeted: number;
  lineItems: IBudgetLineItem[];
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const budgetLineItemSchema = new Schema<IBudgetLineItem>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'BudgetCategory', required: true },
    description: { type: String },
    annualAmount: { type: Number, required: true },
    termAmounts: { type: [Number] },
    notes: { type: String },
  },
  { _id: true },
);

const budgetSchema = new Schema<IBudget>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    year: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    status: { type: String, enum: ['draft', 'approved', 'revised'], default: 'draft' },
    totalBudgeted: { type: Number, required: true, default: 0 },
    lineItems: { type: [budgetLineItemSchema], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

budgetSchema.index({ schoolId: 1, year: 1 });
budgetSchema.index({ schoolId: 1, status: 1 });

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema);

// ─── Expense ────────────────────────────────────────────────────────────────

export const PAYMENT_METHODS = ['cash', 'eft', 'card', 'debit_order', 'cheque', 'other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const EXPENSE_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];

export interface IExpense extends Document {
  schoolId: Types.ObjectId;
  categoryId: Types.ObjectId;
  budgetId?: Types.ObjectId;
  amount: number;
  description: string;
  vendor?: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  paymentMethod?: PaymentMethod;
  receiptUrl?: string;
  term?: number;
  notes?: string;
  status: ExpenseStatus;
  submittedBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  approvalNotes?: string;
  rejectionReason?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'BudgetCategory', required: true },
    budgetId: { type: Schema.Types.ObjectId, ref: 'Budget' },
    amount: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    vendor: { type: String, trim: true },
    invoiceNumber: { type: String, trim: true },
    invoiceDate: { type: Date },
    paymentMethod: { type: String, enum: PAYMENT_METHODS },
    receiptUrl: { type: String },
    term: { type: Number, min: 1, max: 4 },
    notes: { type: String },
    status: { type: String, enum: EXPENSE_STATUSES, default: 'pending' },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    approvalNotes: { type: String },
    rejectionReason: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

expenseSchema.index({ schoolId: 1, categoryId: 1 });
expenseSchema.index({ schoolId: 1, status: 1 });
expenseSchema.index({ schoolId: 1, createdAt: -1 });
expenseSchema.index({ submittedBy: 1, status: 1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
