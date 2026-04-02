import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { CurriculumService } from '../services/index.js';

export class CurriculumController {
  static async listFrameworks(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const frameworks = await CurriculumService.listFrameworks(schoolId);
    res.json(apiResponse(true, frameworks, 'Frameworks retrieved'));
  }

  static async createFramework(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const framework = await CurriculumService.createFramework(req.body, user.id);
    res.status(201).json(apiResponse(true, framework, 'Framework created'));
  }

  static async listTopics(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const frameworkId = req.query.frameworkId ? String(req.query.frameworkId) : undefined;
    const subjectId = req.query.subjectId ? String(req.query.subjectId) : undefined;
    const gradeLevel = req.query.gradeLevel ? parseInt(String(req.query.gradeLevel), 10) : undefined;
    const term = req.query.term ? parseInt(String(req.query.term), 10) : undefined;
    const topics = await CurriculumService.listTopics(schoolId, { frameworkId, subjectId, gradeLevel, term });
    res.json(apiResponse(true, topics, 'Topics retrieved'));
  }

  static async createTopic(req: Request, res: Response): Promise<void> {
    const topic = await CurriculumService.createTopic(req.body);
    res.status(201).json(apiResponse(true, topic, 'Topic created'));
  }

  static async updateTopic(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const topic = await CurriculumService.updateTopic(req.params.id as string, req.body, schoolId);
    res.json(apiResponse(true, topic, 'Topic updated'));
  }

  static async deleteTopic(req: Request, res: Response): Promise<void> {
    await CurriculumService.deleteTopic(req.params.id as string);
    res.json(apiResponse(true, null, 'Topic deleted'));
  }

  static async bulkImportTopics(req: Request, res: Response): Promise<void> {
    const topics = await CurriculumService.bulkImportTopics(req.body);
    res.status(201).json(apiResponse(true, topics, `${topics.length} topics imported`));
  }

  static async getCoverage(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const teacherId = req.query.teacherId ? String(req.query.teacherId) : undefined;
    const classId = req.query.classId ? String(req.query.classId) : undefined;
    const subjectId = req.query.subjectId ? String(req.query.subjectId) : undefined;
    const coverage = await CurriculumService.getCoverage(schoolId, { teacherId, classId, subjectId });
    res.json(apiResponse(true, coverage, 'Coverage retrieved'));
  }

  static async updateCoverage(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const coverage = await CurriculumService.updateCoverage(user.id, req.params.topicId as string, {
      ...req.body,
      schoolId,
    });
    res.json(apiResponse(true, coverage, 'Coverage updated'));
  }

  static async getCoverageReport(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(req.query.schoolId ?? user.schoolId ?? '');
    const teacherId = req.query.teacherId ? String(req.query.teacherId) : undefined;
    const subjectId = req.query.subjectId ? String(req.query.subjectId) : undefined;
    const classId = req.query.classId ? String(req.query.classId) : undefined;
    const report = await CurriculumService.getCoverageReport(schoolId, { teacherId, subjectId, classId });
    res.json(apiResponse(true, report, 'Coverage report retrieved'));
  }
}
