import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Menu Item ──────────────────────────────────────────────────────────────────

export type MenuItemCategory = 'snack' | 'drink' | 'meal' | 'stationery' | 'other';

export interface IMenuItem extends Document {
  name: string;
  schoolId: Types.ObjectId;
  description?: string;
  price: number;
  category: MenuItemCategory;
  image?: string;
  isAvailable: boolean;
  stock: number;
  nutritionalInfo?: string;
  allergenWarnings: string[];
  isDailySpecial: boolean;
  stockAlertThreshold: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['snack', 'drink', 'meal', 'stationery', 'other'],
      required: true,
    },
    image: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    nutritionalInfo: {
      type: String,
    },
    allergenWarnings: {
      type: [String],
      default: [],
    },
    isDailySpecial: {
      type: Boolean,
      default: false,
    },
    stockAlertThreshold: {
      type: Number,
      default: 10,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

menuItemSchema.index({ schoolId: 1, category: 1 });
menuItemSchema.index({ schoolId: 1, isAvailable: 1 });

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);

// ─── Tuck Shop Order ────────────────────────────────────────────────────────────

export interface IOrderItem {
  menuItemId: Types.ObjectId;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type TuckShopPaymentMethod = 'wallet' | 'wristband' | 'cash';

export interface ITuckShopOrder extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: TuckShopPaymentMethod;
  walletTransactionId?: Types.ObjectId;
  processedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const tuckShopOrderSchema = new Schema<ITuckShopOrder>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['wallet', 'wristband', 'cash'],
      required: true,
    },
    walletTransactionId: {
      type: Schema.Types.ObjectId,
      ref: 'WalletTransaction',
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

tuckShopOrderSchema.index({ schoolId: 1, createdAt: -1 });
tuckShopOrderSchema.index({ studentId: 1, createdAt: -1 });

export const TuckShopOrder = mongoose.model<ITuckShopOrder>(
  'TuckShopOrder',
  tuckShopOrderSchema,
);
