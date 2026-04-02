import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { AITutorService } from './service.js';
import { PracticeService } from './practice.service.js';
import { ReportService } from './report.service.js';
import { ParentService } from './parent.service.js';
import { apiResponse } from '../../common/utils.js';

export class AITutorController {
  static async sendMessage(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const conversation = await AITutorService.sendMessage(
      getUser(req).id,
      schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, conversation, 'Message sent successfully'));
  }

  static async listConversations(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { page, limit } = req.query;
    const result = await AITutorService.listConversations(
      getUser(req).id,
      schoolId,
      page ? parseInt(page as string, 10) : undefined,
      limit ? parseInt(limit as string, 10) : undefined,
    );
    res.json(apiResponse(true, result, 'Conversations retrieved successfully'));
  }

  static async getConversation(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const conversation = await AITutorService.getConversation(
      req.params.id as string,
      getUser(req).id,
      schoolId,
    );
    res.json(apiResponse(true, conversation, 'Conversation retrieved successfully'));
  }

  static async generatePractice(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const attempt = await PracticeService.generatePractice(
      getUser(req).id,
      schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, attempt, 'Practice generated successfully'));
  }

  static async submitPractice(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const attempt = await PracticeService.submitPractice(
      getUser(req).id,
      schoolId,
      req.body,
    );
    res.json(apiResponse(true, attempt, 'Practice submitted successfully'));
  }

  static async getWeakAreas(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const areas = await AITutorService.getWeakAreas(
      getUser(req).id,
      schoolId,
    );
    res.json(apiResponse(true, areas, 'Weak areas retrieved successfully'));
  }

  static async generateReportComments(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const comments = await ReportService.generateReportComments(
      getUser(req).id,
      schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, comments, 'Report comments generated successfully'));
  }

  static async parentChat(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const conversation = await ParentService.parentChat(
      getUser(req).id,
      schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, conversation, 'Message sent successfully'));
  }

  static async listParentConversations(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { page, limit } = req.query;
    const result = await ParentService.listParentConversations(
      getUser(req).id,
      schoolId,
      page ? parseInt(page as string, 10) : undefined,
      limit ? parseInt(limit as string, 10) : undefined,
    );
    res.json(apiResponse(true, result, 'Conversations retrieved successfully'));
  }
}
