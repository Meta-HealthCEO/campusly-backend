import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { AdmissionsPublicService, AdmissionsAdminService } from './service.js';
import {
  AdmissionsCapacityService,
  AdmissionsReportsService,
  AdmissionsParentService,
} from './service-capacity.js';

export class AdmissionsController {
  // ═══════════════════════════════════════════════════════════════════════════
  // Public (no auth)
  // ═══════════════════════════════════════════════════════════════════════════

  static async submitApplication(req: Request, res: Response): Promise<void> {
    const files: Record<string, string> = {};
    const multerFiles = req.files as Record<string, Express.Multer.File[]> | undefined;

    if (multerFiles) {
      for (const [key, fileArr] of Object.entries(multerFiles)) {
        if (fileArr.length > 0) {
          files[key] = `/uploads/admissions/${fileArr[0].filename}`;
        }
      }
    }

    const result = await AdmissionsPublicService.submitApplication(req.body, files);
    res.status(201).json(apiResponse(true, result, 'Application submitted successfully'));
  }

  static async checkStatus(req: Request, res: Response): Promise<void> {
    const { trackingToken } = req.params;
    const result = await AdmissionsPublicService.checkStatus(trackingToken as string);
    res.json(apiResponse(true, result));
  }

  static async getPublicCapacity(req: Request, res: Response): Promise<void> {
    const { schoolId } = req.params;
    const result = await AdmissionsPublicService.getPublicCapacity(schoolId as string);
    res.json(apiResponse(true, result));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Admin: Applications
  // ═══════════════════════════════════════════════════════════════════════════

  static async listApplications(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId as string;
    const result = await AdmissionsAdminService.listApplications(schoolId, req.query as Record<string, string>);
    res.json(apiResponse(true, result));
  }

  static async getApplication(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId as string;
    const result = await AdmissionsAdminService.getApplication(schoolId, req.params.id as string);
    res.json(apiResponse(true, result));
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId as string;
    const result = await AdmissionsAdminService.updateStatus(
      schoolId, req.params.id as string, user.id, req.body,
    );
    res.json(apiResponse(true, result));
  }

  static async deleteApplication(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId as string;
    await AdmissionsAdminService.deleteApplication(schoolId, req.params.id as string);
    res.json(apiResponse(true, null, 'Application deleted'));
  }

  static async bulkAction(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId as string;
    const result = await AdmissionsAdminService.bulkAction(schoolId, user.id, req.body);
    res.json(apiResponse(true, result));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Admin: Interview
  // ═══════════════════════════════════════════════════════════════════════════

  static async scheduleInterview(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId as string;
    const result = await AdmissionsAdminService.scheduleInterview(
      schoolId, req.params.id as string, user.id, req.body,
    );
    res.json(apiResponse(true, result));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Admin: Capacity
  // ═══════════════════════════════════════════════════════════════════════════

  static async getCapacity(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId as string;
    const result = await AdmissionsCapacityService.getCapacity(schoolId);
    res.json(apiResponse(true, result));
  }

  static async updateCapacity(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId as string;
    const result = await AdmissionsCapacityService.updateCapacity(schoolId, req.body);
    res.json(apiResponse(true, result));
  }

  static async offerToWaitlist(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId as string;
    const grade = Number(req.params.grade);
    const result = await AdmissionsCapacityService.offerToWaitlist(schoolId, grade, user.id);
    if (!result) {
      res.json(apiResponse(true, null, 'No waitlisted applications for this grade'));
      return;
    }
    res.json(apiResponse(true, result, 'Offer sent to next waitlisted applicant'));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Admin: Reports
  // ═══════════════════════════════════════════════════════════════════════════

  static async getReportSummary(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId as string;
    const year = req.query.yearApplyingFor ? Number(req.query.yearApplyingFor) : undefined;
    const result = await AdmissionsReportsService.getSummary(schoolId, year);
    res.json(apiResponse(true, result));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Parent
  // ═══════════════════════════════════════════════════════════════════════════

  static async getMyApplications(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const result = await AdmissionsParentService.getMyApplications(user.email);
    res.json(apiResponse(true, result));
  }
}
