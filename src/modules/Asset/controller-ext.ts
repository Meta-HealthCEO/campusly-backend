import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { AssetMaintenanceService } from './service-maintenance.js';
import { AssetIncidentService } from './service-incidents.js';
import { AssetInsuranceService } from './service-insurance.js';
import { AssetReportService } from './service-reports.js';
import type {
  CreateMaintenanceInput, UpdateMaintenanceInput,
  CreateAssetIncidentInput, UpdateAssetIncidentInput,
  CreateInsuranceInput, UpdateInsuranceInput,
} from './validation.js';

export class AssetExtController {
  // ─── Maintenance ───────────────────────────────────────────────────────

  static async createMaintenance(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CreateMaintenanceInput = req.body;
    const record = await AssetMaintenanceService.create(
      req.params.id as string, user.schoolId as string, user.id, data,
    );
    res.status(201).json(apiResponse(true, record, 'Maintenance record created successfully'));
  }

  static async listAssetMaintenance(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const records = await AssetMaintenanceService.listByAsset(req.params.id as string, schoolId as string);
    res.json(apiResponse(true, records, 'Maintenance history retrieved'));
  }

  static async updateMaintenance(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: UpdateMaintenanceInput = req.body;
    const record = await AssetMaintenanceService.update(req.params.id as string, schoolId as string, data);
    res.json(apiResponse(true, record, 'Maintenance record updated'));
  }

  static async listUpcomingMaintenance(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const sid = (req.query.schoolId as string) ?? (user.schoolId as string);
    const days = req.query.days ? Number(req.query.days) : 30;
    const records = await AssetMaintenanceService.listUpcoming(sid, days);
    res.json(apiResponse(true, records, 'Upcoming maintenance retrieved'));
  }

  static async listAllMaintenance(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await AssetMaintenanceService.listAll({
      schoolId: (req.query.schoolId as string) ?? (user.schoolId as string),
      status: req.query.status as string | undefined,
      assetId: req.query.assetId as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Maintenance records retrieved'));
  }

  // ─── Incidents ─────────────────────────────────────────────────────────

  static async createIncident(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CreateAssetIncidentInput = req.body;
    const incident = await AssetIncidentService.create(
      req.params.id as string, user.schoolId as string, user.id, data,
    );
    res.status(201).json(apiResponse(true, incident, 'Incident reported successfully'));
  }

  static async listIncidents(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await AssetIncidentService.list({
      schoolId: (req.query.schoolId as string) ?? (user.schoolId as string),
      type: req.query.type as string | undefined,
      assetId: req.query.assetId as string | undefined,
      status: req.query.status as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Incidents retrieved'));
  }

  static async updateIncident(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: UpdateAssetIncidentInput = req.body;
    const incident = await AssetIncidentService.update(req.params.id as string, schoolId as string, data);
    res.json(apiResponse(true, incident, 'Incident updated'));
  }

  // ─── Insurance ─────────────────────────────────────────────────────────

  static async createInsurance(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: CreateInsuranceInput = req.body;
    const policy = await AssetInsuranceService.create(schoolId as string, data);
    res.status(201).json(apiResponse(true, policy, 'Insurance policy created'));
  }

  static async listInsurance(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const sid = (req.query.schoolId as string) ?? (user.schoolId as string);
    const policies = await AssetInsuranceService.list(sid);
    res.json(apiResponse(true, policies, 'Insurance policies retrieved'));
  }

  static async updateInsurance(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data: UpdateInsuranceInput = req.body;
    const policy = await AssetInsuranceService.update(req.params.id as string, schoolId as string, data);
    res.json(apiResponse(true, policy, 'Insurance policy updated'));
  }

  static async deleteInsurance(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    await AssetInsuranceService.remove(req.params.id as string, schoolId as string);
    res.json(apiResponse(true, undefined, 'Insurance policy deleted'));
  }

  static async listExpiringInsurance(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const sid = (req.query.schoolId as string) ?? (user.schoolId as string);
    const days = req.query.days ? Number(req.query.days) : 60;
    const policies = await AssetInsuranceService.listExpiring(sid, days);
    res.json(apiResponse(true, policies, 'Expiring policies retrieved'));
  }

  // ─── Reports ───────────────────────────────────────────────────────────

  static async reportsSummary(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const sid = (req.query.schoolId as string) ?? (user.schoolId as string);
    const data = await AssetReportService.getSummary(sid);
    res.json(apiResponse(true, data, 'Asset report summary retrieved'));
  }

  static async depreciation(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const sid = (req.query.schoolId as string) ?? (user.schoolId as string);
    const data = await AssetReportService.getDepreciation(
      sid, req.query.asOfDate as string | undefined,
    );
    res.json(apiResponse(true, data, 'Depreciation report retrieved'));
  }

  static async replacementDue(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const sid = (req.query.schoolId as string) ?? (user.schoolId as string);
    const months = req.query.withinMonths ? Number(req.query.withinMonths) : 12;
    const data = await AssetReportService.getReplacementDue(sid, months);
    res.json(apiResponse(true, data, 'Replacement schedule retrieved'));
  }

  static async maintenanceCosts(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const sid = (req.query.schoolId as string) ?? (user.schoolId as string);
    const data = await AssetReportService.getMaintenanceCosts(
      sid,
      req.query.year ? Number(req.query.year) : undefined,
      req.query.categoryId as string | undefined,
    );
    res.json(apiResponse(true, data, 'Maintenance cost report retrieved'));
  }

  static async qrCode(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data = await AssetReportService.generateQrData(req.params.id as string, schoolId as string);
    res.json(apiResponse(true, data, 'QR code data generated'));
  }
}
