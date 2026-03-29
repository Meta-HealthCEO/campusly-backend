import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Uniform Item ───────────────────────────────────────────────────────────

export type UniformCategory = 'shirt' | 'pants' | 'skirt' | 'blazer' | 'tie' | 'shoes' | 'sports' | 'other';

export interface IUniformItem extends Document {
  name: string;
  schoolId: Types.ObjectId;
  description?: string;
  category: UniformCategory;
  sizes: string[];
  price: number;
  stock: number;
  image?: string;
  isAvailable: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const uniformItemSchema = new Schema<IUniformItem>(
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
    category: {
      type: String,
      enum: ['shirt', 'pants', 'skirt', 'blazer', 'tie', 'shoes', 'sports', 'other'],
      required: true,
    },
    sizes: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

uniformItemSchema.index({ schoolId: 1, category: 1 });
uniformItemSchema.index({ schoolId: 1, isAvailable: 1 });

export const UniformItem = mongoose.model<IUniformItem>('UniformItem', uniformItemSchema);

// ─── Uniform Order ──────────────────────────────────────────────────────────

export interface IUniformOrderItem {
  uniformItemId: Types.ObjectId;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type UniformOrderStatus = 'pending' | 'confirmed' | 'ready' | 'collected' | 'cancelled';

export interface IUniformOrder extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  items: IUniformOrderItem[];
  totalAmount: number;
  status: UniformOrderStatus;
  orderedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const uniformOrderItemSchema = new Schema<IUniformOrderItem>(
  {
    uniformItemId: {
      type: Schema.Types.ObjectId,
      ref: 'UniformItem',
      required: true,
    },
    size: {
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

const uniformOrderSchema = new Schema<IUniformOrder>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    items: {
      type: [uniformOrderItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'ready', 'collected', 'cancelled'],
      default: 'pending',
    },
    orderedBy: {
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

uniformOrderSchema.index({ schoolId: 1, createdAt: -1 });
uniformOrderSchema.index({ studentId: 1, createdAt: -1 });
uniformOrderSchema.index({ schoolId: 1, status: 1 });

export const UniformOrder = mongoose.model<IUniformOrder>('UniformOrder', uniformOrderSchema);
