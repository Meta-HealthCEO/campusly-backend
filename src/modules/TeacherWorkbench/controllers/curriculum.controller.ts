import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { CurriculumService } from '../services/index.js';
import { resolveSchoolScope } from '../../../common/school-scope.js';

export class CurriculumController {
  static async listFrameworks(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(resolveSchoolScope(req) ?? '');
    const frameworks = await CurriculumService.listFrameworks(schoolId);
    res.json(apiResponse(true, frameworks, 'Frameworks retrieved'));
  }

  static async createFramework(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const framework = await CurriculumService.createFramework({ ...req.body, schoolId }, user.id);
    res.status(201).json(apiResponse(true, framework, 'Framework created'));
  }

  static async listTopics(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(resolveSchoolScope(req) ?? '');
    const frameworkId = req.query.frameworkId ? String(req.query.frameworkId) : undefined;
    const subjectId = req.query.subjectId ? String(req.query.subjectId) : undefined;
    const gradeLevel = req.query.gradeLevel ? parseInt(String(req.query.gradeLevel), 10) : undefined;
    const term = req.query.term ? parseInt(String(req.query.term), 10) : undefined;
    const topics = await CurriculumService.listTopics(schoolId, { frameworkId, subjectId, gradeLevel, term });
    res.json(apiResponse(true, topics, 'Topics retrieved'));
  }

  static async createTopic(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(resolveSchoolScope(req) ?? '');
    const topic = await CurriculumService.createTopic({ ...req.body, schoolId });
    res.status(201).json(apiResponse(true, topic, 'Topic created'));
  }

  static async updateTopic(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(resolveSchoolScope(req) ?? '');
    const topic = await CurriculumService.updateTopic(req.params.id as string, req.body, schoolId);
    res.json(apiResponse(true, topic, 'Topic updated'));
  }

  static async deleteTopic(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(resolveSchoolScope(req) ?? '');
    await CurriculumService.deleteTopic(req.params.id as string, schoolId);
    res.json(apiResponse(true, null, 'Topic deleted'));
  }

  static async bulkImportTopics(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(resolveSchoolScope(req) ?? '');
    const topics = await CurriculumService.bulkImportTopics({ ...req.body, schoolId });
    res.status(201).json(apiResponse(true, topics, `${topics.length} topics imported`));
  }

  static async getCoverage(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(resolveSchoolScope(req) ?? '');
    const teacherId = req.query.teacherId ? String(req.query.teacherId) : undefined;
    const classId = req.query.classId ? String(req.query.classId) : undefined;
    const subjectId = req.query.subjectId ? String(req.query.subjectId) : undefined;
    const coverage = await CurriculumService.getCoverage(schoolId, { teacherId, classId, subjectId });
    res.json(apiResponse(true, coverage, 'Coverage retrieved'));
  }

  static async updateCoverage(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(resolveSchoolScope(req) ?? '');
    const coverage = await CurriculumService.updateCoverage(user.id, req.params.topicId as string, {
      ...req.body,
      schoolId,
    });
    res.json(apiResponse(true, coverage, 'Coverage updated'));
  }

  static async getCoverageReport(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = String(resolveSchoolScope(req) ?? '');
    const teacherId = req.query.teacherId ? String(req.query.teacherId) : undefined;
    const subjectId = req.query.subjectId ? String(req.query.subjectId) : undefined;
    const classId = req.query.classId ? String(req.query.classId) : undefined;
    const report = await CurriculumService.getCoverageReport(schoolId, { teacherId, subjectId, classId });
    res.json(apiResponse(true, report, 'Coverage report retrieved'));
  }
}
