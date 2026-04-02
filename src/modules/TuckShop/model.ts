import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Menu Item ──────────────────────────────────────────────────────────────────

export type MenuItemCategory = 'snack' | 'drink' | 'meal' | 'stationery' | 'other';

export type AllergenType = 'nuts' | 'dairy' | 'gluten' | 'eggs' | 'soy' | 'fish' | 'shellfish';

export interface INutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sugar?: number;
}

export interface IMenuItem extends Document {
  name: string;
  schoolId: Types.ObjectId;
  description?: string;
  price: number;
  category: MenuItemCategory;
  image?: string;
  isAvailable: boolean;
  stock: number;
  allergens: AllergenType[];
  allergenWarnings: string[];
  isHalal: boolean;
  isKosher: boolean;
  nutritionalInfo: INutritionalInfo;
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
      min: 0,
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
      min: 0,
    },
    allergens: {
      type: [String],
      enum: ['nuts', 'dairy', 'gluten', 'eggs', 'soy', 'fish', 'shellfish'],
      default: [],
    },
    allergenWarnings: {
      type: [String],
      default: [],
    },
    isHalal: {
      type: Boolean,
      default: false,
    },
    isKosher: {
      type: Boolean,
      default: false,
    },
    nutritionalInfo: {
      type: new Schema({
        calories: { type: Number },
        protein: { type: Number },
        carbs: { type: Number },
        fat: { type: Number },
        sugar: { type: Number },
      }, { _id: false }),
      default: () => ({}),
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

menuItemSchema.index({ schoolId: 1, isDeleted: 1 });
menuItemSchema.index({ schoolId: 1, category: 1 });
menuItemSchema.index({ schoolId: 1, isAvailable: 1 });
menuItemSchema.index({ schoolId: 1, category: 1, isAvailable: 1 });

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
      min: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
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

tuckShopOrderSchema.index({ schoolId: 1, isDeleted: 1 });
tuckShopOrderSchema.index({ schoolId: 1, createdAt: -1 });
tuckShopOrderSchema.index({ studentId: 1, createdAt: -1 });

export const TuckShopOrder = mongoose.model<ITuckShopOrder>(
  'TuckShopOrder',
  tuckShopOrderSchema,
);
