import mongoose, { Schema, Document, Types } from 'mongoose';

export type LostFoundItemType = 'found' | 'lost';
export type LostFoundItemStatus = 'found' | 'claimed' | 'archived' | 'returned';
export type LostFoundItemCategory =
  | 'clothing'
  | 'stationery'
  | 'electronics'
  | 'sports_equipment'
  | 'lunch_box'
  | 'bag'
  | 'jewellery'
  | 'other';

export interface ILostItem extends Document {
  schoolId: Types.ObjectId;
  reportedBy: Types.ObjectId;
  status: LostFoundItemStatus;
  type: LostFoundItemType;
  itemName: string;
  description: string;
  category: LostFoundItemCategory;
  locationFound?: string;
  locationLost?: string;
  dateFound?: Date;
  dateLost?: Date;
  photos: string[];
  claimedBy?: Types.ObjectId;
  claimedDate?: Date;
  verifiedBy?: Types.ObjectId;
  matchedItemId?: Types.ObjectId;
  studentId?: Types.ObjectId;
  parentNotified: boolean;
  parentNotifiedDate?: Date;
  archivedDate?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lostItemSchema = new Schema<ILostItem>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['found', 'claimed', 'archived', 'returned'],
      default: 'found',
    },
    type: {
      type: String,
      enum: ['found', 'lost'],
      required: true,
    },
    itemName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['clothing', 'stationery', 'electronics', 'sports_equipment', 'lunch_box', 'bag', 'jewellery', 'other'],
      required: true,
    },
    locationFound: { type: String, trim: true },
    locationLost: { type: String, trim: true },
    dateFound: { type: Date },
    dateLost: { type: Date },
    photos: [{ type: String }],
    claimedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    claimedDate: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    matchedItemId: { type: Schema.Types.ObjectId, ref: 'LostItem' },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    parentNotified: { type: Boolean, default: false },
    parentNotifiedDate: { type: Date },
    archivedDate: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

lostItemSchema.index({ schoolId: 1, isDeleted: 1 });
lostItemSchema.index({ schoolId: 1, status: 1 });
lostItemSchema.index({ schoolId: 1, type: 1 });
lostItemSchema.index({ schoolId: 1, category: 1 });
lostItemSchema.index({ matchedItemId: 1 });

export const LostItem = mongoose.model<ILostItem>('LostItem', lostItemSchema);
