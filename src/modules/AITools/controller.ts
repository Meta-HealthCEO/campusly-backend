import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { AIToolsService } from './service.js';
import { AIPdfService } from './service-pdf.js';
import { apiResponse } from '../../common/utils.js';
import {
  listMarkings,
  getMarkingById,
  updateMarking,
  publishMarking,
} from './service-marking-queries.js';

export class AIToolsController {
  static async generatePaper(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const paper = await AIToolsService.generatePaper(
      getUser(req).id,
      schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, paper, 'Paper generated successfully'));
  }

  static async getPapers(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const { subject, grade, status, page, limit } = req.query;

    const result = await AIToolsService.getPapers(
      schoolId,
      {
        subject: subject as string | undefined,
        grade: grade ? parseInt(grade as string, 10) : undefined,
        status: status as string | undefined,
      },
      page ? parseInt(page as string, 10) : undefined,
      limit ? parseInt(limit as string, 10) : undefined,
    );

    res.json(apiResponse(true, result, 'Papers retrieved successfully'));
  }

  static async getPaperById(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const paper = await AIToolsService.getPaperById(req.params.id as string, schoolId);
    res.json(apiResponse(true, paper, 'Paper retrieved successfully'));
  }

  static async updatePaper(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const paper = await AIToolsService.updatePaper(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, paper, 'Paper updated successfully'));
  }

  static async regenerateQuestion(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const { sectionIndex, questionIndex } = req.body;
    const paper = await AIToolsService.regenerateQuestion(
      req.params.id as string,
      sectionIndex,
      questionIndex,
      getUser(req).id,
      schoolId,
    );
    res.json(apiResponse(true, paper, 'Question regenerated successfully'));
  }

  static async gradeSubmission(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const job = await AIToolsService.gradeSubmission(
      getUser(req).id,
      schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, job, 'Grading job queued successfully'));
  }

  static async bulkGrade(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const jobs = await AIToolsService.bulkGrade(
      getUser(req).id,
      schoolId,
      req.body,
    );
    res.status(201).json(apiResponse(true, jobs, `${jobs.length} grading jobs queued`));
  }

  static async getGradingJob(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const job = await AIToolsService.getGradingJobById(req.params.jobId as string, schoolId);
    res.json(apiResponse(true, job, 'Grading job retrieved successfully'));
  }

  static async reviewGrade(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const job = await AIToolsService.reviewGrade(req.params.jobId as string, schoolId, req.body);
    res.json(apiResponse(true, job, 'Grade reviewed successfully'));
  }

  static async publishGrade(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const { assessmentId, comment } = req.body as { assessmentId: string; comment?: string };
    const job = await AIToolsService.publishGrade(req.params.jobId as string, schoolId, assessmentId, comment);
    res.json(apiResponse(true, job, 'Grade published to gradebook'));
  }

  static async retryGrade(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const job = await AIToolsService.retryGrade(req.params.jobId as string, schoolId);
    res.json(apiResponse(true, job, 'Grade re-queued'));
  }

  static async markPaper(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const marking = await AIToolsService.markPaperFromImages(getUser(req).id, schoolId, req.body);
    res.json(apiResponse(true, marking, 'Paper marked successfully'));
  }

  static async listMarkings(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const { paperId, studentId, status, page, limit } = req.query;
    const result = await listMarkings(
      schoolId,
      {
        paperId: paperId as string | undefined,
        studentId: studentId as string | undefined,
        status: status as string | undefined,
      },
      page ? parseInt(page as string, 10) : undefined,
      limit ? parseInt(limit as string, 10) : undefined,
    );
    res.json(apiResponse(true, result, 'Markings retrieved successfully'));
  }

  static async getMarkingById(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const marking = await getMarkingById(req.params.id as string, schoolId);
    res.json(apiResponse(true, marking, 'Marking retrieved successfully'));
  }

  static async updateMarking(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const marking = await updateMarking(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, marking, 'Marking updated successfully'));
  }

  static async publishMarking(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const { assessmentId, studentId, comment } = req.body as {
      assessmentId: string;
      studentId?: string;
      comment?: string;
    };
    const marking = await publishMarking(req.params.id as string, schoolId, assessmentId, studentId, comment);
    res.json(apiResponse(true, marking, 'Marking published to gradebook'));
  }

  static async downloadPaperPdf(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const buf = await AIPdfService.generatePaperPdf(req.params.id as string, schoolId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="paper-${req.params.id}.pdf"`);
    res.send(buf);
  }

  static async downloadMemoPdf(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const buf = await AIPdfService.generateMemoPdf(req.params.id as string, schoolId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="memo-${req.params.id}.pdf"`);
    res.send(buf);
  }

  static async getUsage(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const { startDate, endDate } = req.query;

    const stats = await AIToolsService.getUsageStats(schoolId, {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    res.json(apiResponse(true, stats, 'Usage stats retrieved successfully'));
  }
}
