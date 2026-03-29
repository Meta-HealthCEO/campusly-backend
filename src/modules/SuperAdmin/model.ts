import mongoose, { Document, Schema, Types } from 'mongoose';

// ─── Tenant Model ─────────────────────────────────────────────────────────────

export interface ISubscription {
  tier: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  nextBillingDate?: Date;
}

export interface ITenantLimits {
  maxStudents: number;
  maxStaff: number;
}

export interface ITenantUsage {
  currentStudents: number;
  currentStaff: number;
}

export interface IBillingContact {
  name: string;
  email: string;
  phone?: string;
}

export interface ITenant extends Document {
  schoolId: Types.ObjectId;
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  trialStartDate?: Date;
  trialEndDate?: Date;
  subscription?: ISubscription;
  modulesEnabled: string[];
  limits: ITenantLimits;
  usage: ITenantUsage;
  billingContact?: IBillingContact;
  onboardingStatus: 'pending' | 'in_progress' | 'complete';
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    tier: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    billingCycle: { type: String, enum: ['monthly', 'annual'], required: true },
    nextBillingDate: { type: Date },
  },
  { _id: false },
);

const limitsSchema = new Schema<ITenantLimits>(
  {
    maxStudents: { type: Number, required: true, min: 0 },
    maxStaff: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const usageSchema = new Schema<ITenantUsage>(
  {
    currentStudents: { type: Number, default: 0 },
    currentStaff: { type: Number, default: 0 },
  },
  { _id: false },
);

const billingContactSchema = new Schema<IBillingContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
  },
  { _id: false },
);

const tenantSchema = new Schema<ITenant>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, unique: true },
    status: {
      type: String,
      enum: ['trial', 'active', 'suspended', 'cancelled'],
      default: 'trial',
    },
    trialStartDate: { type: Date },
    trialEndDate: { type: Date },
    subscription: { type: subscriptionSchema },
    modulesEnabled: { type: [String], default: [] },
    limits: {
      type: limitsSchema,
      default: () => ({ maxStudents: 500, maxStaff: 50 }),
    },
    usage: {
      type: usageSchema,
      default: () => ({ currentStudents: 0, currentStaff: 0 }),
    },
    billingContact: { type: billingContactSchema },
    onboardingStatus: {
      type: String,
      enum: ['pending', 'in_progress', 'complete'],
      default: 'pending',
    },
    notes: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

tenantSchema.index({ schoolId: 1 });
tenantSchema.index({ status: 1 });

export const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);

// ─── PlatformInvoice Model ────────────────────────────────────────────────────

export interface ILineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IPlatformInvoice extends Document {
  tenantId: Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  lineItems: ILineItem[];
  issuedDate: Date;
  dueDate: Date;
  paidDate?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lineItemSchema = new Schema<ILineItem>(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const platformInvoiceSchema = new Schema<IPlatformInvoice>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue'],
      default: 'draft',
    },
    lineItems: { type: [lineItemSchema], default: [] },
    issuedDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

platformInvoiceSchema.index({ tenantId: 1 });
platformInvoiceSchema.index({ status: 1 });

export const PlatformInvoice = mongoose.model<IPlatformInvoice>(
  'PlatformInvoice',
  platformInvoiceSchema,
);

// ─── SupportTicket Model ──────────────────────────────────────────────────────

export interface ITicketMessage {
  senderId: Types.ObjectId;
  message: string;
  timestamp: Date;
  isInternal: boolean;
}

export interface ISupportTicket extends Document {
  tenantId: Types.ObjectId;
  schoolId: Types.ObjectId;
  raisedBy: Types.ObjectId;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: Types.ObjectId;
  messages: ITicketMessage[];
  resolvedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ticketMessageSchema = new Schema<ITicketMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
    isInternal: { type: Boolean, default: false },
  },
  { _id: false },
);

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    messages: { type: [ticketMessageSchema], default: [] },
    resolvedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

supportTicketSchema.index({ tenantId: 1 });
supportTicketSchema.index({ schoolId: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ priority: 1 });

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);
