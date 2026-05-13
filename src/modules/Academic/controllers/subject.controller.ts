import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { AcademicService } from '../service.js';
import { apiResponse } from '../../../common/utils.js';

export class SubjectController {
  static async createSubject(req: Request, res: Response): Promise<void> {
    const subject = await AcademicService.createSubject(req.body);
    res.status(201).json(apiResponse(true, subject, 'Subject created successfully'));
  }

  static async listSubjects(req: Request, res: Response): Promise<void> {
    const user = getUser(req);

    // Standalone teachers used to get a CurriculumNode-masked response here
    // (because they had no school-side Subject rows). Their teaching scope
    // now materialises real Subject rows via the bridge in
    // services/materialise-from-curriculum.service.ts, so this endpoint
    // returns the same shape for every role.

    const schoolId = (req.query.schoolId as string) ?? user.schoolId;
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    let teacherId: string | undefined = req.query.teacherId as string | undefined;
    if (teacherId === 'me') teacherId = user.id;
    // Regular teachers (non-principal) only see subjects they're timetabled
    // for. Standalone teachers fall through to the same listSubjects query
    // — they see every Subject in their (single-teacher) school.
    if (user.role === 'teacher' && user.isSchoolPrincipal !== true && user.isStandaloneTeacher !== true) {
      teacherId = user.id;
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
    };

    const gradeId = req.query.gradeId as string | undefined;

    const result = await AcademicService.listSubjects(schoolId, query, { teacherId, gradeId });
    res.json(apiResponse(true, result, 'Subjects retrieved successfully'));
  }

  static async getSubject(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const subject = await AcademicService.getSubjectById(req.params.id as string, schoolId);
    res.json(apiResponse(true, subject, 'Subject retrieved successfully'));
  }

  static async updateSubject(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const subject = await AcademicService.updateSubject(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, subject, 'Subject updated successfully'));
  }

  static async deleteSubject(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await AcademicService.deleteSubject(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Subject deleted successfully'));
  }
}
