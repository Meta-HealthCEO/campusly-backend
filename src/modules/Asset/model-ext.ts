import mongoose, { Schema, type Document, type Types } from 'mongoose';
import { CONDITIONS } from './model.js';

// ─── Asset Maintenance ────────────────────────────────────────────────────

export const MAINTENANCE_TYPES = ['repair', 'service', 'upgrade', 'inspection'] as const;
export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export const MAINTENANCE_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'] as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

export interface IAssetMaintenance extends Document {
  assetId: Types.ObjectId;
  schoolId: Types.ObjectId;
  type: MaintenanceType;
  description: string;
  vendor?: string;
  cost?: number;
  scheduledDate?: Date;
  completedDate?: Date;
  status: MaintenanceStatus;
  createdBy: Types.ObjectId;
  notes?: string;
  isDeleted: boolean;
}

const assetMaintenanceSchema = new Schema<IAssetMaintenance>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    type: { type: String, required: true, enum: MAINTENANCE_TYPES },
    description: { type: String, required: true },
    vendor: { type: String, default: '' },
    cost: { type: Number, default: null },
    scheduledDate: { type: Date, default: null },
    completedDate: { type: Date, default: null },
    status: { type: String, required: true, enum: MAINTENANCE_STATUSES },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

assetMaintenanceSchema.index({ assetId: 1, status: 1 });
assetMaintenanceSchema.index({ schoolId: 1, scheduledDate: 1 });
assetMaintenanceSchema.index({ schoolId: 1, status: 1 });

export const AssetMaintenance = mongoose.model<IAssetMaintenance>(
  'AssetMaintenance', assetMaintenanceSchema,
);

// ─── Asset Incident ───────────────────────────────────────────────────────

export const ASSET_INCIDENT_TYPES = ['damage', 'loss', 'theft', 'vandalism'] as const;
export type AssetIncidentType = (typeof ASSET_INCIDENT_TYPES)[number];

export const ASSET_INCIDENT_STATUSES = ['reported', 'investigating', 'resolved'] as const;
export type AssetIncidentStatus = (typeof ASSET_INCIDENT_STATUSES)[number];

export interface IAssetIncident extends Document {
  assetId: Types.ObjectId;
  schoolId: Types.ObjectId;
  type: AssetIncidentType;
  description: string;
  date: Date;
  reportedBy: Types.ObjectId;
  responsiblePartyId?: Types.ObjectId;
  estimatedCost?: number;
  actualCost?: number;
  images: string[];
  status: AssetIncidentStatus;
  resolution?: string;
  isDeleted: boolean;
}

const assetIncidentSchema = new Schema<IAssetIncident>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    type: { type: String, required: true, enum: ASSET_INCIDENT_TYPES },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    responsiblePartyId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    estimatedCost: { type: Number, default: null },
    actualCost: { type: Number, default: null },
    images: { type: [String], default: [] },
    status: { type: String, required: true, enum: ASSET_INCIDENT_STATUSES, default: 'reported' },
    resolution: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

assetIncidentSchema.index({ schoolId: 1, type: 1 });
assetIncidentSchema.index({ assetId: 1 });
assetIncidentSchema.index({ schoolId: 1, status: 1 });

export const AssetIncident = mongoose.model<IAssetIncident>('AssetIncident', assetIncidentSchema);

// ─── Asset Insurance ──────────────────────────────────────────────────────

export const PREMIUM_FREQUENCIES = ['monthly', 'quarterly', 'annual'] as const;
export type PremiumFrequency = (typeof PREMIUM_FREQUENCIES)[number];

export interface IAssetInsurance extends Document {
  schoolId: Types.ObjectId;
  policyNumber: string;
  insurer: string;
  categoryId?: Types.ObjectId;
  coverageAmount: number;
  premium: number;
  premiumFrequency: PremiumFrequency;
  startDate: Date;
  expiryDate: Date;
  excess?: number;
  notes?: string;
  isDeleted: boolean;
}

const assetInsuranceSchema = new Schema<IAssetInsurance>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    policyNumber: { type: String, required: true, trim: true },
    insurer: { type: String, required: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'AssetCategory', default: null },
    coverageAmount: { type: Number, required: true },
    premium: { type: Number, required: true },
    premiumFrequency: { type: String, required: true, enum: PREMIUM_FREQUENCIES },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    excess: { type: Number, default: null },
    notes: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

assetInsuranceSchema.index({ schoolId: 1, expiryDate: 1 });
assetInsuranceSchema.index({ schoolId: 1, categoryId: 1 });

export const AssetInsurance = mongoose.model<IAssetInsurance>(
  'AssetInsurance', assetInsuranceSchema,
);

// Re-export CONDITIONS for use in other files
export { CONDITIONS };
