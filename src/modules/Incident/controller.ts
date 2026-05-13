import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { IncidentService } from './service.js';
import { IncidentReportService } from './service-reports.js';
import { ConfidentialNoteService } from './service-notes.js';
import type {
  CreateIncidentInput, UpdateIncidentInput,
  CreateActionInput, UpdateActionInput,
  CreateNoteInput, UpdateNoteInput,
} from './validation.js';

export class IncidentController {
  // ─── Incidents ─────────────────────────────────────────────────────────

  static async create(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CreateIncidentInput = req.body;
    const incident = await IncidentService.create(
      user, data,
    );
    res.status(201).json(apiResponse(true, incident, 'Incident reported successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const query = {
      status: req.query.status as string | undefined,
      type: req.query.type as string | undefined,
      severity: req.query.severity as string | undefined,
      studentId: req.query.studentId as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await IncidentService.list(user, query);
    res.json(apiResponse(true, result, 'Incidents retrieved'));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const incident = await IncidentService.getById(
      req.params.id as string,
      getUser(req),
    );
    res.json(apiResponse(true, incident, 'Incident retrieved'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: UpdateIncidentInput = req.body;
    const incident = await IncidentService.update(
      req.params.id as string, user, data,
    );
    res.json(apiResponse(true, incident, 'Incident updated'));
  }

  static async remove(req: Request, res: Response): Promise<void> {
    await IncidentService.softDelete(req.params.id as string, getUser(req));
    res.json(apiResponse(true, undefined, 'Incident deleted'));
  }

  // ─── Follow-up Actions ─────────────────────────────────────────────────

  static async listActions(req: Request, res: Response): Promise<void> {
    const actions = await IncidentService.listActions(
      req.params.id as string,
      getUser(req),
    );
    res.json(apiResponse(true, actions, 'Actions retrieved'));
  }

  static async createAction(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CreateActionInput = req.body;
    const action = await IncidentService.createAction(
      req.params.id as string, user, data,
    );
    res.status(201).json(apiResponse(true, action, 'Action created'));
  }

  static async updateAction(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: UpdateActionInput = req.body;
    const action = await IncidentService.updateAction(
      req.params.id as string, req.params.actionId as string,
      user, data,
    );
    res.json(apiResponse(true, action, 'Action updated'));
  }

  // ─── Confidential Notes ────────────────────────────────────────────────

  static async listNotes(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const notes = await ConfidentialNoteService.list(
      req.params.id as string, schoolId as string,
    );
    res.json(apiResponse(true, notes, 'Confidential notes retrieved'));
  }

  static async createNote(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: CreateNoteInput = req.body;
    const note = await ConfidentialNoteService.create(
      req.params.id as string, user.schoolId as string, user.id, data,
    );
    res.status(201).json(apiResponse(true, note, 'Confidential note created'));
  }

  static async updateNote(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data: UpdateNoteInput = req.body;
    const note = await ConfidentialNoteService.update(
      req.params.id as string, req.params.noteId as string,
      user.schoolId as string, user.id, data,
    );
    res.json(apiResponse(true, note, 'Confidential note updated'));
  }

  // ─── Reports ───────────────────────────────────────────────────────────

  static async reportsSummary(req: Request, res: Response): Promise<void> {
    const { schoolId } = getUser(req);
    const data = await IncidentReportService.getSummary({
      schoolId: schoolId as string,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    });
    res.json(apiResponse(true, data, 'Incident report summary retrieved'));
  }
}
