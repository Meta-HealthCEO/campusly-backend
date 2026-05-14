import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { AIToolsService } from './service.js';
import { apiResponse } from '../../common/utils.js';
import { BadRequestError } from '../../common/errors.js';
import {
  listMarkings,
  getMarkingById,
  updateMarking,
  issueMarking,
} from './service-marking-queries.js';
import { markPaperFromText } from './service-marking-text.js';
import { PaperMarking } from './model-marking.js';
import { AssessmentPaper } from '../QuestionBank/model-papers.js';
import { markingDir } from './service-marking-images.js';
import { buildMarkingPdf } from './service-marking-pdf.js';
import { resolveStudentForUser } from './service-student-ownership.js';

// Paper generation, regeneration, and CRUD handlers have been removed.
// All paper routes (/api/ai-tools/papers/*, /api/ai-tools/generate-paper)
// are 308-redirected in routes.ts to the canonical QuestionBank module.
// Paper PDF / memo PDF downloads also live in QuestionBank now.

export class AIToolsController {
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

  static async listGradingJobs(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const { assignmentId, studentId, status, page, limit } = req.query;
    const result = await AIToolsService.getGradingJobs(
      schoolId,
      {
        assignmentId: assignmentId as string | undefined,
        studentId: studentId as string | undefined,
        status: status as string | undefined,
      },
      page ? parseInt(page as string, 10) : undefined,
      limit ? parseInt(limit as string, 10) : undefined,
    );
    res.json(apiResponse(true, result, 'Grading jobs retrieved'));
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
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) throw new BadRequestError('No images provided');
    const { paperId, paperType, studentName, studentId, classId } = req.body as {
      paperId?: string;
      paperType?: 'generated' | 'assessment';
      studentName?: string;
      studentId?: string;
      classId?: string;
    };
    if (!paperId) throw new BadRequestError('paperId is required');
    if (!studentName) throw new BadRequestError('studentName is required');

    const marking = await AIToolsService.markPaperFromImages(getUser(req).id, schoolId, {
      paperId,
      paperType: paperType ?? 'assessment',
      studentName,
      studentId: studentId ?? null,
      classId: classId ?? null,
      files,
    });
    res.status(201).json(apiResponse(true, marking, 'Paper marked successfully'));
  }

  static async markPaperText(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const { paperId, paperType, studentName, studentId, classId, answers } = req.body as {
      paperId?: string;
      paperType?: 'generated' | 'assessment';
      studentName?: string;
      studentId?: string;
      classId?: string;
      answers?: Array<{ questionNumber?: string; answer?: string }>;
    };
    if (!paperId) throw new BadRequestError('paperId is required');
    if (!studentName) throw new BadRequestError('studentName is required');
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new BadRequestError('answers must be a non-empty array');
    }
    const cleanedAnswers = answers
      .map((a) => ({
        questionNumber: String(a.questionNumber ?? '').trim(),
        answer: String(a.answer ?? ''),
      }))
      .filter((a) => a.questionNumber.length > 0);
    if (cleanedAnswers.length === 0) {
      throw new BadRequestError('answers must include at least one questionNumber');
    }

    const marking = await markPaperFromText(getUser(req).id, schoolId, {
      paperId,
      paperType: paperType ?? 'assessment',
      studentName,
      studentId: studentId ?? null,
      classId: classId ?? null,
      answers: cleanedAnswers,
    });
    res.status(201).json(apiResponse(true, marking, 'Paper marked successfully'));
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

  private static async findCallerAccessibleMarking(req: Request, markingId: string) {
    const role = req.user?.role;
    if (!mongoose.Types.ObjectId.isValid(markingId)) return null;
    const _id = new mongoose.Types.ObjectId(markingId);

    if (role === 'student') {
      const userSchoolId = req.user?.schoolId;
      if (!userSchoolId) return null;
      const { studentId, schoolId } = await resolveStudentForUser(getUser(req).id, userSchoolId);
      return PaperMarking.findOne({
        _id,
        studentId: new mongoose.Types.ObjectId(studentId),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        issuedToStudent: true,
        isDeleted: false,
      });
    }

    // teacher / school_admin / super_admin — scope by schoolId
    const schoolId = req.user?.schoolId;
    if (!schoolId) return null;
    return PaperMarking.findOne({
      _id,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    });
  }

  static async getMarkingPdf(req: Request, res: Response): Promise<void> {
    const marking = await AIToolsController.findCallerAccessibleMarking(req, req.params.id as string);
    if (!marking) {
      res.status(404).json({ success: false, error: 'Marking not found' });
      return;
    }
    if (!marking.images || marking.images.length === 0) {
      res.status(404).json({ success: false, error: 'No marked pages to render' });
      return;
    }
    const paper = await AssessmentPaper.findOne({
      _id: marking.paperId,
      schoolId: marking.schoolId,
      isDeleted: false,
    })
      .select('title')
      .lean();
    const pdf = await buildMarkingPdf(marking, { paperTitle: paper?.title ?? 'Marked paper' });
    if (!pdf) {
      res.status(404).json({ success: false, error: 'No marked pages to render' });
      return;
    }
    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const filename = `${slug(marking.studentName)}-${slug(paper?.title ?? 'paper')}-marked.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(pdf);
  }

  static async getMarkingImage(req: Request, res: Response): Promise<void> {
    const marking = await AIToolsController.findCallerAccessibleMarking(req, req.params.id as string);
    if (!marking) {
      res.status(404).json({ success: false, error: 'Marking not found' });
      return;
    }
    const filename = req.params.filename as string;
    const entry = marking.images.find((img) => img.filename === filename);
    if (!entry) {
      res.status(404).json({ success: false, error: 'Page not found' });
      return;
    }
    const absPath = path.join(markingDir(String(marking._id)), filename);
    if (!fs.existsSync(absPath)) {
      res.status(404).json({ success: false, error: 'Page file missing' });
      return;
    }
    res.setHeader('Content-Type', entry.mimeType);
    res.setHeader('Cache-Control', 'private, max-age=300');
    fs.createReadStream(absPath).pipe(res);
  }

  static async issueMarking(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const teacherUserId = getUser(req).id;
    const { assessmentId, studentId, comment } = req.body as {
      assessmentId?: string;
      studentId?: string;
      comment?: string;
    };
    const marking = await issueMarking(req.params.id as string, schoolId, teacherUserId, assessmentId, studentId, comment);
    res.json(apiResponse(true, marking, 'Marking issued'));
  }

  static async listRubricTemplates(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const templates = await AIToolsService.listRubricTemplates(schoolId, getUser(req).id);
    res.json(apiResponse(true, templates, 'Rubric templates retrieved'));
  }

  static async createRubricTemplate(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const tpl = await AIToolsService.createRubricTemplate(schoolId, getUser(req).id, req.body);
    res.status(201).json(apiResponse(true, tpl, 'Rubric template created'));
  }

  static async deleteRubricTemplate(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    await AIToolsService.deleteRubricTemplate(req.params.id as string, schoolId, getUser(req).id);
    res.json(apiResponse(true, undefined, 'Rubric template deleted'));
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
