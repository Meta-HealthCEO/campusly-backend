import mongoose, { Schema, type Document, type Types } from 'mongoose';

// ─── Asset Category ───────────────────────────────────────────────────────

export interface IAssetCategory extends Document {
  schoolId: Types.ObjectId;
  name: string;
  code: string;
  parentId?: Types.ObjectId;
  description?: string;
  depreciationRate?: number;
  usefulLifeYears?: number;
  isActive: boolean;
  isDeleted: boolean;
}

const assetCategorySchema = new Schema<IAssetCategory>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'AssetCategory', default: null },
    description: { type: String, default: '' },
    depreciationRate: { type: Number, default: null },
    usefulLifeYears: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

assetCategorySchema.index({ schoolId: 1, code: 1 }, { unique: true });
assetCategorySchema.index({ schoolId: 1, parentId: 1 });

export const AssetCategory = mongoose.model<IAssetCategory>('AssetCategory', assetCategorySchema);

// ─── Asset Location ───────────────────────────────────────────────────────

export const LOCATION_TYPES = ['building', 'room', 'hall', 'field', 'storage', 'office', 'other'] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export interface IAssetLocation extends Document {
  schoolId: Types.ObjectId;
  name: string;
  type: LocationType;
  building?: string;
  floor?: string;
  department?: string;
  description?: string;
  isDeleted: boolean;
}

const assetLocationSchema = new Schema<IAssetLocation>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: LOCATION_TYPES },
    building: { type: String, default: '' },
    floor: { type: String, default: '' },
    department: { type: String, default: '' },
    description: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

assetLocationSchema.index({ schoolId: 1, type: 1 });
assetLocationSchema.index({ schoolId: 1, building: 1 });

export const AssetLocation = mongoose.model<IAssetLocation>('AssetLocation', assetLocationSchema);

// ─── Asset ────────────────────────────────────────────────────────────────

export const ASSET_STATUSES = ['procured', 'in_service', 'under_repair', 'disposed', 'lost', 'stolen'] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const CONDITIONS = ['new', 'good', 'fair', 'poor', 'damaged'] as const;
export type Condition = (typeof CONDITIONS)[number];

export const ASSIGNMENT_TYPES = ['user', 'department', 'location', 'class'] as const;
export type AssignmentType = (typeof ASSIGNMENT_TYPES)[number];

export interface IAssignmentHistory {
  assignedTo: Types.ObjectId;
  assignedToType: AssignmentType;
  assignedBy: Types.ObjectId;
  assignedAt: Date;
  unassignedAt?: Date;
  notes?: string;
}

// Using separate fields interface to avoid conflict with Document.model
export interface IAssetFields {
  schoolId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  assetTag: string;
  serialNumber?: string;
  make?: string;
  model?: string;
  description?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  warrantyExpiry?: Date;
  vendor?: string;
  invoiceReference?: string;
  locationId?: Types.ObjectId;
  status: AssetStatus;
  condition?: Condition;
  isPortable: boolean;
  assignedTo?: Types.ObjectId;
  assignedToType?: AssignmentType;
  assignmentHistory: IAssignmentHistory[];
  imageUrl?: string;
  notes?: string;
  isDeleted: boolean;
}

const assignmentHistorySchema = new Schema<IAssignmentHistory>(
  {
    assignedTo: { type: Schema.Types.ObjectId, required: true },
    assignedToType: { type: String, required: true, enum: ASSIGNMENT_TYPES },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date, required: true },
    unassignedAt: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { _id: false },
);

export type IAsset = IAssetFields & Document;

const assetSchema = new Schema<IAssetFields>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'AssetCategory', required: true },
    name: { type: String, required: true, trim: true },
    assetTag: { type: String, required: true, trim: true },
    serialNumber: { type: String, trim: true, default: null },
    make: { type: String, default: '' },
    model: { type: String, default: '' },
    description: { type: String, default: '' },
    purchaseDate: { type: Date, default: null },
    purchasePrice: { type: Number, default: null },
    warrantyExpiry: { type: Date, default: null },
    vendor: { type: String, default: '' },
    invoiceReference: { type: String, default: '' },
    locationId: { type: Schema.Types.ObjectId, ref: 'AssetLocation', default: null },
    status: { type: String, required: true, enum: ASSET_STATUSES },
    condition: { type: String, enum: CONDITIONS, default: null },
    isPortable: { type: Boolean, default: false },
    assignedTo: { type: Schema.Types.ObjectId, default: null },
    assignedToType: { type: String, enum: ASSIGNMENT_TYPES, default: null },
    assignmentHistory: { type: [assignmentHistorySchema], default: [] },
    imageUrl: { type: String, default: null },
    notes: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

assetSchema.index({ schoolId: 1, assetTag: 1 }, { unique: true });
assetSchema.index(
  { schoolId: 1, serialNumber: 1 },
  { unique: true, partialFilterExpression: { serialNumber: { $ne: null } } },
);
assetSchema.index({ schoolId: 1, categoryId: 1 });
assetSchema.index({ schoolId: 1, status: 1 });
assetSchema.index({ schoolId: 1, locationId: 1 });
assetSchema.index({ schoolId: 1, assignedTo: 1 });

export const Asset = mongoose.model<IAssetFields>('Asset', assetSchema);

// ─── Asset Check-Out ──────────────────────────────────────────────────────

export const CHECKOUT_STATUSES = ['checked_out', 'returned', 'overdue'] as const;
export type CheckOutStatus = (typeof CHECKOUT_STATUSES)[number];

export interface IAssetCheckOut extends Document {
  assetId: Types.ObjectId;
  schoolId: Types.ObjectId;
  borrowerId: Types.ObjectId;
  checkedOutBy: Types.ObjectId;
  checkedOutAt: Date;
  expectedReturnDate: Date;
  checkedInAt?: Date;
  checkedInBy?: Types.ObjectId;
  conditionOut?: Condition;
  conditionIn?: Condition;
  purpose: string;
  status: CheckOutStatus;
  notes?: string;
  isDeleted: boolean;
}

const assetCheckOutSchema = new Schema<IAssetCheckOut>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    borrowerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    checkedOutBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    checkedOutAt: { type: Date, required: true },
    expectedReturnDate: { type: Date, required: true },
    checkedInAt: { type: Date, default: null },
    checkedInBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    conditionOut: { type: String, enum: CONDITIONS, default: null },
    conditionIn: { type: String, enum: CONDITIONS, default: null },
    purpose: { type: String, required: true },
    status: { type: String, required: true, enum: CHECKOUT_STATUSES },
    notes: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

assetCheckOutSchema.index({ assetId: 1, status: 1 });
assetCheckOutSchema.index({ schoolId: 1, status: 1 });
assetCheckOutSchema.index({ borrowerId: 1, status: 1 });
assetCheckOutSchema.index({ expectedReturnDate: 1 });

export const AssetCheckOut = mongoose.model<IAssetCheckOut>('AssetCheckOut', assetCheckOutSchema);
