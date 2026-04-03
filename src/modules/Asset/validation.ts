import { z } from 'zod/v4';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

// ─── Asset Categories ─────────────────────────────────────────────────────

export const createAssetCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  code: z.string().min(1, 'Code is required').max(50),
  parentId: objectIdSchema.optional(),
  description: z.string().max(1000).optional(),
  depreciationRate: z.number().min(0).max(100).optional(),
  usefulLifeYears: z.number().int().positive().optional(),
}).strict();

export type CreateAssetCategoryInput = z.infer<typeof createAssetCategorySchema>;

export const updateAssetCategorySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(50).optional(),
  parentId: objectIdSchema.nullable().optional(),
  description: z.string().max(1000).optional(),
  depreciationRate: z.number().min(0).max(100).optional(),
  usefulLifeYears: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
}).strict();

export type UpdateAssetCategoryInput = z.infer<typeof updateAssetCategorySchema>;

// ─── Locations ────────────────────────────────────────────────────────────

const locationTypes = ['building', 'room', 'hall', 'field', 'storage', 'office', 'other'] as const;

export const createLocationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: z.enum(locationTypes),
  building: z.string().max(200).optional(),
  floor: z.string().max(50).optional(),
  department: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
}).strict();

export type CreateLocationInput = z.infer<typeof createLocationSchema>;

export const updateLocationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(locationTypes).optional(),
  building: z.string().max(200).optional(),
  floor: z.string().max(50).optional(),
  department: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
}).strict();

export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

// ─── Assets ───────────────────────────────────────────────────────────────

const assetStatuses = ['procured', 'in_service', 'under_repair', 'disposed', 'lost', 'stolen'] as const;
const conditions = ['new', 'good', 'fair', 'poor', 'damaged'] as const;
const assignmentTypes = ['user', 'department', 'location', 'class'] as const;

export const createAssetSchema = z.object({
  categoryId: objectIdSchema,
  name: z.string().min(1, 'Name is required').max(300),
  assetTag: z.string().min(1, 'Asset tag is required').max(100),
  serialNumber: z.string().max(200).optional(),
  make: z.string().max(200).optional(),
  model: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().int().nonnegative().optional(),
  warrantyExpiry: z.string().optional(),
  vendor: z.string().max(200).optional(),
  invoiceReference: z.string().max(200).optional(),
  locationId: objectIdSchema.optional(),
  status: z.enum(assetStatuses),
  condition: z.enum(conditions).optional(),
  isPortable: z.boolean().optional(),
  imageUrl: z.string().url().nullable().optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export type CreateAssetInput = z.infer<typeof createAssetSchema>;

export const updateAssetSchema = z.object({
  categoryId: objectIdSchema.optional(),
  name: z.string().min(1).max(300).optional(),
  assetTag: z.string().min(1).max(100).optional(),
  serialNumber: z.string().max(200).optional(),
  make: z.string().max(200).optional(),
  model: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().int().nonnegative().optional(),
  warrantyExpiry: z.string().optional(),
  vendor: z.string().max(200).optional(),
  invoiceReference: z.string().max(200).optional(),
  locationId: objectIdSchema.nullable().optional(),
  status: z.enum(assetStatuses).optional(),
  condition: z.enum(conditions).optional(),
  isPortable: z.boolean().optional(),
  imageUrl: z.string().url().nullable().optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

// ─── Assignment ───────────────────────────────────────────────────────────

export const assignAssetSchema = z.object({
  assignedTo: objectIdSchema,
  assignedToType: z.enum(assignmentTypes),
  notes: z.string().max(1000).optional(),
}).strict();

export type AssignAssetInput = z.infer<typeof assignAssetSchema>;

// ─── Check-Out / Check-In ────────────────────────────────────────────────

export const checkOutSchema = z.object({
  borrowerId: objectIdSchema,
  purpose: z.string().min(1, 'Purpose is required').max(1000),
  expectedReturnDate: z.string().min(1, 'Expected return date is required'),
  notes: z.string().max(1000).optional(),
}).strict();

export type CheckOutInput = z.infer<typeof checkOutSchema>;

export const checkInSchema = z.object({
  conditionIn: z.enum(conditions).optional(),
  notes: z.string().max(1000).optional(),
}).strict();

export type CheckInInput = z.infer<typeof checkInSchema>;

// ─── Maintenance ──────────────────────────────────────────────────────────

const maintenanceTypes = ['repair', 'service', 'upgrade', 'inspection'] as const;
const maintenanceStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'] as const;

export const createMaintenanceSchema = z.object({
  type: z.enum(maintenanceTypes),
  description: z.string().min(1, 'Description is required').max(2000),
  vendor: z.string().max(200).optional(),
  cost: z.number().int().nonnegative().optional(),
  scheduledDate: z.string().optional(),
  completedDate: z.string().optional(),
  status: z.enum(maintenanceStatuses),
  notes: z.string().max(2000).optional(),
}).strict();

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;

export const updateMaintenanceSchema = z.object({
  type: z.enum(maintenanceTypes).optional(),
  description: z.string().min(1).max(2000).optional(),
  vendor: z.string().max(200).optional(),
  cost: z.number().int().nonnegative().optional(),
  scheduledDate: z.string().optional(),
  completedDate: z.string().optional(),
  status: z.enum(maintenanceStatuses).optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;

// ─── Incidents ────────────────────────────────────────────────────────────

const incidentTypes = ['damage', 'loss', 'theft', 'vandalism'] as const;
const incidentStatuses = ['reported', 'investigating', 'resolved'] as const;

export const createIncidentSchema = z.object({
  type: z.enum(incidentTypes),
  description: z.string().min(1, 'Description is required').max(2000),
  date: z.string().min(1, 'Date is required'),
  responsiblePartyId: objectIdSchema.optional(),
  estimatedCost: z.number().int().nonnegative().optional(),
  images: z.array(z.string().url()).optional(),
}).strict();

export type CreateAssetIncidentInput = z.infer<typeof createIncidentSchema>;

export const updateIncidentSchema = z.object({
  type: z.enum(incidentTypes).optional(),
  description: z.string().min(1).max(2000).optional(),
  status: z.enum(incidentStatuses).optional(),
  resolution: z.string().max(2000).optional(),
  actualCost: z.number().int().nonnegative().optional(),
}).strict();

export type UpdateAssetIncidentInput = z.infer<typeof updateIncidentSchema>;

// ─── Insurance ────────────────────────────────────────────────────────────

const premiumFrequencies = ['monthly', 'quarterly', 'annual'] as const;

export const createInsuranceSchema = z.object({
  policyNumber: z.string().min(1, 'Policy number is required').max(100),
  insurer: z.string().min(1, 'Insurer is required').max(200),
  categoryId: objectIdSchema.optional(),
  coverageAmount: z.number().int().positive(),
  premium: z.number().int().nonnegative(),
  premiumFrequency: z.enum(premiumFrequencies),
  startDate: z.string().min(1, 'Start date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  excess: z.number().int().nonnegative().optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export type CreateInsuranceInput = z.infer<typeof createInsuranceSchema>;

export const updateInsuranceSchema = z.object({
  policyNumber: z.string().min(1).max(100).optional(),
  insurer: z.string().min(1).max(200).optional(),
  categoryId: objectIdSchema.nullable().optional(),
  coverageAmount: z.number().int().positive().optional(),
  premium: z.number().int().nonnegative().optional(),
  premiumFrequency: z.enum(premiumFrequencies).optional(),
  startDate: z.string().optional(),
  expiryDate: z.string().optional(),
  excess: z.number().int().nonnegative().optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export type UpdateInsuranceInput = z.infer<typeof updateInsuranceSchema>;

// ─── QR Batch ─────────────────────────────────────────────────────────────

export const qrBatchSchema = z.object({
  assetIds: z.array(objectIdSchema).min(1, 'At least one asset is required').max(100),
}).strict();

export type QrBatchInput = z.infer<typeof qrBatchSchema>;
