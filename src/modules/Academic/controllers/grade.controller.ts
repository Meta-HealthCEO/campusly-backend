import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { AcademicService } from '../service.js';
import { TeacherSettingsService } from '../../TeacherSettings/service.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { apiResponse } from '../../../common/utils.js';

function parseGradeLevel(title: string): number {
  const match = title.match(/Grade\s+(\d+|R)/i);
  if (!match) return 0;
  return match[1].toUpperCase() === 'R' ? 0 : Number(match[1]);
}

export class GradeController {
  static async createGrade(req: Request, res: Response): Promise<void> {
    const grade = await AcademicService.createGrade(req.body);
    res.status(201).json(apiResponse(true, grade, 'Grade created successfully'));
  }

  static async listGrades(req: Request, res: Response): Promise<void> {
    const user = getUser(req);

    if (user.isStandaloneTeacher) {
      const scope = await TeacherSettingsService.getTeachingScope(user.id);
      const gradeIds = scope.grades ?? [];
      if (gradeIds.length === 0) {
        res.json(apiResponse(true, { data: [], total: 0, page: 1, limit: 0, totalPages: 0 }, 'Grades retrieved successfully'));
        return;
      }
      const nodes = await CurriculumNode.find({
        _id: { $in: gradeIds },
        type: 'grade',
        isDeleted: false,
      }).select('_id title code').sort({ title: 1 }).lean();

      const data = nodes.map((n) => ({
        id: String(n._id),
        name: n.title,
        level: parseGradeLevel(n.title),
      }));
      res.json(apiResponse(true, { data, total: data.length, page: 1, limit: data.length, totalPages: 1 }, 'Grades retrieved successfully'));
      return;
    }

    const schoolId = (req.query.schoolId as string) ?? user.schoolId;
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: (req.query.sort as string) ?? 'orderIndex',
      search: req.query.search as string | undefined,
    };

    const result = await AcademicService.listGrades(schoolId, query);
    res.json(apiResponse(true, result, 'Grades retrieved successfully'));
  }

  static async getGrade(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const grade = await AcademicService.getGradeById(req.params.id as string, schoolId);
    res.json(apiResponse(true, grade, 'Grade retrieved successfully'));
  }

  static async updateGrade(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const grade = await AcademicService.updateGrade(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, grade, 'Grade updated successfully'));
  }

  static async deleteGrade(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await AcademicService.deleteGrade(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Grade deleted successfully'));
  }
}
