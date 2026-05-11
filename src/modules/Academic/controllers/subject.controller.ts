import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { AcademicService } from '../service.js';
import { TeacherSettingsService } from '../../TeacherSettings/service.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { apiResponse } from '../../../common/utils.js';

export class SubjectController {
  static async createSubject(req: Request, res: Response): Promise<void> {
    const subject = await AcademicService.createSubject(req.body);
    res.status(201).json(apiResponse(true, subject, 'Subject created successfully'));
  }

  static async listSubjects(req: Request, res: Response): Promise<void> {
    const user = getUser(req);

    if (user.isStandaloneTeacher) {
      const scope = await TeacherSettingsService.getTeachingScope(user.id);
      const requestedGradeId = req.query.gradeId as string | undefined;
      let subjectIds: string[] = [];

      if (requestedGradeId) {
        const entry = (scope.subjectsByGrade ?? []).find(
          (e) => String(e.gradeId) === requestedGradeId,
        );
        subjectIds = entry?.subjectIds.map((id) => String(id)) ?? [];
      } else {
        // No grade filter — flatten all subjects from all grades
        subjectIds = (scope.subjectsByGrade ?? []).flatMap(
          (e) => e.subjectIds.map((id) => String(id)),
        );
      }

      if (subjectIds.length === 0) {
        res.json(apiResponse(true, { data: [], total: 0, page: 1, limit: 0, totalPages: 0 }, 'Subjects retrieved successfully'));
        return;
      }

      const nodes = await CurriculumNode.find({
        _id: { $in: subjectIds },
        type: 'subject',
        isDeleted: false,
      }).select('_id title code gradeId').sort({ title: 1 }).lean();

      const data = nodes.map((n) => ({
        id: String(n._id),
        name: n.title,
        code: n.code,
        gradeIds: n.gradeId ? [String(n.gradeId)] : [],
      }));
      res.json(apiResponse(true, { data, total: data.length, page: 1, limit: data.length, totalPages: 1 }, 'Subjects retrieved successfully'));
      return;
    }

    const schoolId = (req.query.schoolId as string) ?? user.schoolId;
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    let teacherId: string | undefined = req.query.teacherId as string | undefined;
    if (teacherId === 'me') teacherId = user.id;
    if (
      user.role === 'teacher' &&
      user.isStandaloneTeacher !== true &&
      user.isSchoolPrincipal !== true
    ) {
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
