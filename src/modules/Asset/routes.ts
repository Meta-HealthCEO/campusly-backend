import { Router } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { AssetController } from './controller.js';
import { AssetExtController } from './controller-ext.js';
import {
  createAssetCategorySchema, updateAssetCategorySchema,
  createLocationSchema, updateLocationSchema,
  createAssetSchema, updateAssetSchema, assignAssetSchema,
  checkOutSchema, checkInSchema,
  createMaintenanceSchema, updateMaintenanceSchema,
  createIncidentSchema, updateIncidentSchema,
  createInsuranceSchema, updateInsuranceSchema,
} from './validation.js';

const router = Router();

const adminOnly = authorize('school_admin', 'super_admin');
const staffAndAbove = authorize('school_admin', 'super_admin', 'teacher', 'staff');
const teacherAndAbove = authorize('school_admin', 'super_admin', 'teacher');

// ─── Categories ───────────────────────────────────────────────────────────
router.post('/categories', adminOnly, validate(createAssetCategorySchema), AssetController.createCategory);
router.get('/categories', staffAndAbove, AssetController.listCategories);
router.put('/categories/:id', adminOnly, validate(updateAssetCategorySchema), AssetController.updateCategory);
router.delete('/categories/:id', adminOnly, AssetController.deleteCategory);
router.post('/categories/seed', adminOnly, AssetController.seedCategories);

// ─── Locations ────────────────────────────────────────────────────────────
router.post('/locations', adminOnly, validate(createLocationSchema), AssetController.createLocation);
router.get('/locations', staffAndAbove, AssetController.listLocations);
router.put('/locations/:id', adminOnly, validate(updateLocationSchema), AssetController.updateLocation);
router.delete('/locations/:id', adminOnly, AssetController.deleteLocation);

// ─── Reports (before /:id routes) ────────────────────────────────────────
router.get('/reports/summary', adminOnly, AssetExtController.reportsSummary);
router.get('/reports/replacement', adminOnly, AssetExtController.replacementDue);
router.get('/reports/maintenance-costs', adminOnly, AssetExtController.maintenanceCosts);
router.get('/depreciation', adminOnly, AssetExtController.depreciation);

// ─── Insurance ────────────────────────────────────────────────────────────
router.post('/insurance', adminOnly, validate(createInsuranceSchema), AssetExtController.createInsurance);
router.get('/insurance', adminOnly, AssetExtController.listInsurance);
router.get('/insurance/expiring', adminOnly, AssetExtController.listExpiringInsurance);
router.put('/insurance/:id', adminOnly, validate(updateInsuranceSchema), AssetExtController.updateInsurance);
router.delete('/insurance/:id', adminOnly, AssetExtController.deleteInsurance);

// ─── Check-Outs (list) ──────────────────────────────────────────────────
router.get('/check-outs', adminOnly, AssetController.listCheckOuts);

// ─── Maintenance (global) ────────────────────────────────────────────────
router.get('/maintenance/upcoming', adminOnly, AssetExtController.listUpcomingMaintenance);
router.get('/maintenance', adminOnly, AssetExtController.listAllMaintenance);
router.put('/maintenance/:id', adminOnly, validate(updateMaintenanceSchema), AssetExtController.updateMaintenance);

// ─── Incidents (global list) ─────────────────────────────────────────────
router.get('/incidents', adminOnly, AssetExtController.listIncidents);
router.put('/incidents/:id', adminOnly, validate(updateIncidentSchema), AssetExtController.updateIncident);

// ─── Assets CRUD ──────────────────────────────────────────────────────────
router.post('/', adminOnly, validate(createAssetSchema), AssetController.createAsset);
router.get('/', staffAndAbove, AssetController.listAssets);
router.get('/:id', staffAndAbove, AssetController.getAsset);
router.put('/:id', adminOnly, validate(updateAssetSchema), AssetController.updateAsset);
router.delete('/:id', adminOnly, AssetController.deleteAsset);

// ─── Asset Sub-Resources ─────────────────────────────────────────────────
router.post('/:id/assign', adminOnly, validate(assignAssetSchema), AssetController.assignAsset);
router.post('/:id/unassign', adminOnly, AssetController.unassignAsset);
router.post('/:id/check-out', teacherAndAbove, validate(checkOutSchema), AssetController.checkOut);
router.post('/:id/check-in', teacherAndAbove, validate(checkInSchema), AssetController.checkIn);
router.post('/:id/maintenance', adminOnly, validate(createMaintenanceSchema), AssetExtController.createMaintenance);
router.get('/:id/maintenance', adminOnly, AssetExtController.listAssetMaintenance);
router.post('/:id/incidents', staffAndAbove, validate(createIncidentSchema), AssetExtController.createIncident);
router.get('/:id/qr-code', adminOnly, AssetExtController.qrCode);

export default router;
