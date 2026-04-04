import { Request, Response } from 'express';
import { apiResponse } from '../../common/utils.js';
import { SgbMemberService } from './service-members.js';
import { SgbMeetingService } from './service-meetings.js';
import { SgbResolutionService } from './service-resolutions.js';
import { SgbDocumentService } from './service-documents.js';
import { SgbFinanceService } from './service-finance.js';
import { SgbEnrollmentService } from './service-enrollment.js';
import { SgbSipService } from './service-sip.js';
import type { VoteChoice } from './model.js';

export class SgbController {
  // ─── Members ──────────────────────────────────────────────────────────────
  static async inviteMember(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const member = await SgbMemberService.inviteMember(req.body, schoolId, req.user!.id);
    res.status(201).json(apiResponse(true, member, 'SGB member invitation sent successfully'));
  }

  static async listMembers(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user!.schoolId!;
    const result = await SgbMemberService.listMembers({
      schoolId,
      status: req.query.status as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'SGB members retrieved successfully'));
  }

  static async updateMember(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const member = await SgbMemberService.updateMember(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, member, 'SGB member updated successfully'));
  }

  static async deleteMember(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await SgbMemberService.deleteMember(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'SGB member removed successfully'));
  }

  // ─── Meetings ─────────────────────────────────────────────────────────────
  static async createMeeting(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const meeting = await SgbMeetingService.createMeeting(req.body, schoolId, req.user!.id);
    res.status(201).json(apiResponse(true, meeting, 'SGB meeting created successfully'));
  }

  static async listMeetings(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user!.schoolId!;
    const result = await SgbMeetingService.listMeetings({
      schoolId,
      status: req.query.status as string | undefined,
      type: req.query.type as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'SGB meetings retrieved successfully'));
  }

  static async getMeeting(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const meeting = await SgbMeetingService.getMeeting(req.params.id as string, schoolId);
    res.json(apiResponse(true, meeting, 'SGB meeting retrieved successfully'));
  }

  static async updateMeeting(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const meeting = await SgbMeetingService.updateMeeting(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, meeting, 'SGB meeting updated successfully'));
  }

  static async deleteMeeting(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await SgbMeetingService.deleteMeeting(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'SGB meeting deleted successfully'));
  }

  static async recordMinutes(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const meeting = await SgbMeetingService.recordMinutes(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, meeting, 'Meeting minutes recorded successfully'));
  }

  // ─── Resolutions ──────────────────────────────────────────────────────────
  static async createResolution(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const resolution = await SgbResolutionService.createResolution(
      req.params.meetingId as string, req.body, schoolId, req.user!.id,
    );
    res.status(201).json(apiResponse(true, resolution, 'Resolution created successfully'));
  }

  static async listResolutions(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user!.schoolId!;
    const result = await SgbResolutionService.listResolutions({
      schoolId,
      status: req.query.status as string | undefined,
      meetingId: req.query.meetingId as string | undefined,
      category: req.query.category as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Resolutions retrieved successfully'));
  }

  static async castVote(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await SgbResolutionService.castVote(
      req.params.id as string, schoolId, req.user!.id, req.body.vote as VoteChoice,
    );
    res.json(apiResponse(true, result, 'Vote recorded successfully'));
  }

  // ─── Documents ────────────────────────────────────────────────────────────
  static async uploadDocument(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const file = req.file;
    if (!file) {
      res.status(400).json(apiResponse(false, undefined, 'File is required'));
      return;
    }
    const doc = await SgbDocumentService.createDocument({
      schoolId,
      title: req.body.title as string,
      category: req.body.category as string,
      description: req.body.description as string | undefined,
      fileUrl: `/uploads/sgb/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      policyReviewDate: req.body.policyReviewDate as string | undefined,
      uploadedBy: req.user!.id,
    });
    res.status(201).json(apiResponse(true, doc, 'Document uploaded successfully'));
  }

  static async listDocuments(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user!.schoolId!;
    const result = await SgbDocumentService.listDocuments({
      schoolId,
      category: req.query.category as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Documents retrieved successfully'));
  }

  static async downloadDocument(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const doc = await SgbDocumentService.getDocument(req.params.id as string, schoolId);
    res.download(doc.fileUrl, doc.fileName);
  }

  static async deleteDocument(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await SgbDocumentService.deleteDocument(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Document deleted successfully'));
  }

  // ─── Policy ───────────────────────────────────────────────────────────────
  static async proposePolicy(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const resolution = await SgbResolutionService.createPolicyResolution(
      req.body, schoolId, req.user!.id,
    );
    res.status(201).json(apiResponse(true, resolution, 'Policy proposed for SGB approval'));
  }

  static async getCompliance(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user!.schoolId!;
    const result = await SgbDocumentService.getComplianceSummary(schoolId);
    res.json(apiResponse(true, result, 'Compliance summary retrieved successfully'));
  }

  // ─── Finance ──────────────────────────────────────────────────────────────
  static async getFinanceSummary(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user!.schoolId!;
    const period = (req.query.period as string) ?? 'annual';
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const summary = await SgbFinanceService.getFinanceSummary(schoolId, period, year);
    res.json(apiResponse(true, summary, 'Financial summary retrieved successfully'));
  }

  static async getFinanceTrends(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user!.schoolId!;
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const trends = await SgbFinanceService.getFinanceTrends(schoolId, year);
    res.json(apiResponse(true, trends, 'Finance trends retrieved successfully'));
  }

  // ─── Enrollment ───────────────────────────────────────────────────────────
  static async getEnrollmentSummary(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user!.schoolId!;
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const summary = await SgbEnrollmentService.getEnrollmentSummary(schoolId, year);
    res.json(apiResponse(true, summary, 'Enrollment summary retrieved successfully'));
  }

  // ─── SIP ──────────────────────────────────────────────────────────────────
  static async getSip(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user!.schoolId!;
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const sip = await SgbSipService.getSip(schoolId, year);
    res.json(apiResponse(true, sip, 'School improvement plan retrieved successfully'));
  }

  static async upsertSip(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const sip = await SgbSipService.upsertSip(schoolId, req.body);
    res.json(apiResponse(true, sip, 'School improvement plan updated successfully'));
  }
}
