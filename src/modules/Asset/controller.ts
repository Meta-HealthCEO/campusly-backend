import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { AssetCategoryService } from './service-categories.js';
import { AssetLocationService } from './service-locations.js';
import { AssetService } from './service.js';
import { AssetMaintenanceService } from './service-maintenance.js';
import { AssetIncidentService } from './service-incidents.js';
import { AssetInsuranceService } from './service-insurance.js';
import { AssetReportService } from './service-reports.js';
import type {
  CreateAssetCategoryInput, UpdateAssetCategoryInput,
  CreateLocationInput, UpdateLocationInput,
  CreateAssetInput, UpdateAssetInput, AssignAssetInput,
  CheckOutInput, CheckInInput,
  CreateMaintenanceInput, UpdateMaintenanceInput,
  CreateAssetIncidentInput, UpdateAssetIncidentInput,
  CreateInsuranceInput, UpdateInsuranceInput,
} from './validation.js';
import { resolveSchoolScope } from '../../common/school-scope.js';

export class AssetController {
  // ─── Categories ────────────────────────────────────────────────────────
  static async createCategory(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: CreateAssetCategoryInput = req.body;
    const cat = await AssetCategoryService.create(schoolId as string, data);
    res.status(201).json(apiResponse(true, cat, 'Asset category created successfully'));
  }

  static async listCategories(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const sid = resolveSchoolScope(req)!;
    const cats = await AssetCategoryService.list(sid);
    res.json(apiResponse(true, cats, 'Categories retrieved'));
  }

  static async updateCategory(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: UpdateAssetCategoryInput = req.body;
    const cat = await AssetCategoryService.update(req.params.id as string, schoolId as string, data);
    res.json(apiResponse(true, cat, 'Category updated'));
  }

  static async deleteCategory(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    await AssetCategoryService.remove(req.params.id as string, schoolId as string);
    res.json(apiResponse(true, undefined, 'Category deleted'));
  }

  static async seedCategories(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const cats = await AssetCategoryService.seed(schoolId as string);
    res.status(201).json(apiResponse(true, cats, 'Default categories seeded'));
  }

  // ─── Locations ─────────────────────────────────────────────────────────
  static async createLocation(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: CreateLocationInput = req.body;
    const loc = await AssetLocationService.create(schoolId as string, data);
    res.status(201).json(apiResponse(true, loc, 'Location created successfully'));
  }

  static async listLocations(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const sid = resolveSchoolScope(req)!;
    const locs = await AssetLocationService.list({
      schoolId: sid,
      type: req.query.type as string | undefined,
      building: req.query.building as string | undefined,
      department: req.query.department as string | undefined,
    });
    res.json(apiResponse(true, locs, 'Locations retrieved'));
  }

  static async updateLocation(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: UpdateLocationInput = req.body;
    const loc = await AssetLocationService.update(req.params.id as string, schoolId as string, data);
    res.json(apiResponse(true, loc, 'Location updated'));
  }

  static async deleteLocation(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    await AssetLocationService.remove(req.params.id as string, schoolId as string);
    res.json(apiResponse(true, undefined, 'Location deleted'));
  }

  // ─── Assets ────────────────────────────────────────────────────────────
  static async createAsset(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: CreateAssetInput = req.body;
    const asset = await AssetService.create(schoolId as string, data);
    res.status(201).json(apiResponse(true, asset, 'Asset registered successfully'));
  }

  static async listAssets(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await AssetService.list({
      schoolId: resolveSchoolScope(req)!,
      categoryId: req.query.categoryId as string | undefined,
      locationId: req.query.locationId as string | undefined,
      status: req.query.status as string | undefined,
      condition: req.query.condition as string | undefined,
      isPortable: req.query.isPortable as string | undefined,
      assignedTo: req.query.assignedTo as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Assets retrieved'));
  }

  static async getAsset(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const asset = await AssetService.getById(req.params.id as string, schoolId as string);
    res.json(apiResponse(true, asset, 'Asset retrieved'));
  }

  static async updateAsset(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: UpdateAssetInput = req.body;
    const asset = await AssetService.update(req.params.id as string, schoolId as string, data);
    res.json(apiResponse(true, asset, 'Asset updated'));
  }

  static async deleteAsset(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    await AssetService.remove(req.params.id as string, schoolId as string);
    res.json(apiResponse(true, undefined, 'Asset deleted'));
  }

  // ─── Assignment ────────────────────────────────────────────────────────
  static async assignAsset(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: AssignAssetInput = req.body;
    const asset = await AssetService.assign(req.params.id as string, user.schoolId as string, user.id, data);
    res.json(apiResponse(true, asset, 'Asset assigned successfully'));
  }

  static async unassignAsset(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const asset = await AssetService.unassign(req.params.id as string, schoolId as string);
    res.json(apiResponse(true, asset, 'Asset unassigned'));
  }

  // ─── Check-Out / Check-In ─────────────────────────────────────────────
  static async checkOut(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CheckOutInput = req.body;
    const co = await AssetService.checkOut(req.params.id as string, user.schoolId as string, user.id, data);
    res.status(201).json(apiResponse(true, co, 'Asset checked out successfully'));
  }

  static async checkIn(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CheckInInput = req.body;
    const co = await AssetService.checkIn(req.params.id as string, user.schoolId as string, user.id, data);
    res.json(apiResponse(true, co, 'Asset checked in successfully'));
  }

  static async listCheckOuts(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await AssetService.listCheckOuts({
      schoolId: resolveSchoolScope(req)!,
      status: req.query.status as string | undefined,
      assetId: req.query.assetId as string | undefined,
      borrowerId: req.query.borrowerId as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Check-outs retrieved'));
  }
}
