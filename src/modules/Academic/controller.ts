import { Request, Response } from 'express';
import { AcademicService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class AcademicController {
  // ─── Grade ─────────────────────────────────────────────────────────────

  static async createGrade(req: Request, res: Response): Promise<void> {
    const grade = await AcademicService.createGrade(req.body);
    res.status(201).json(apiResponse(true, grade, 'Grade created successfully'));
  }

  static async listGrades(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
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
    const grade = await AcademicService.getGradeById(req.params.id as string);
    res.json(apiResponse(true, grade, 'Grade retrieved successfully'));
  }

  static async updateGrade(req: Request, res: Response): Promise<void> {
    const grade = await AcademicService.updateGrade(req.params.id as string, req.body);
    res.json(apiResponse(true, grade, 'Grade updated successfully'));
  }

  static async deleteGrade(req: Request, res: Response): Promise<void> {
    await AcademicService.deleteGrade(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Grade deleted successfully'));
  }

  // ─── Class ─────────────────────────────────────────────────────────────

  static async createClass(req: Request, res: Response): Promise<void> {
    const cls = await AcademicService.createClass(req.body);
    res.status(201).json(apiResponse(true, cls, 'Class created successfully'));
  }

  static async listClasses(req: Request, res: Response): Promise<void> {
    const filters = {
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      gradeId: req.query.gradeId as string | undefined,
    };

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
    };

    const result = await AcademicService.listClasses(filters, query);
    res.json(apiResponse(true, result, 'Classes retrieved successfully'));
  }

  static async getClass(req: Request, res: Response): Promise<void> {
    const cls = await AcademicService.getClassById(req.params.id as string);
    res.json(apiResponse(true, cls, 'Class retrieved successfully'));
  }

  static async updateClass(req: Request, res: Response): Promise<void> {
    const cls = await AcademicService.updateClass(req.params.id as string, req.body);
    res.json(apiResponse(true, cls, 'Class updated successfully'));
  }

  static async deleteClass(req: Request, res: Response): Promise<void> {
    await AcademicService.deleteClass(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Class deleted successfully'));
  }

  // ─── Subject ───────────────────────────────────────────────────────────

  static async createSubject(req: Request, res: Response): Promise<void> {
    const subject = await AcademicService.createSubject(req.body);
    res.status(201).json(apiResponse(true, subject, 'Subject created successfully'));
  }

  static async listSubjects(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
    };

    const result = await AcademicService.listSubjects(schoolId, query);
    res.json(apiResponse(true, result, 'Subjects retrieved successfully'));
  }

  static async getSubject(req: Request, res: Response): Promise<void> {
    const subject = await AcademicService.getSubjectById(req.params.id as string);
    res.json(apiResponse(true, subject, 'Subject retrieved successfully'));
  }

  static async updateSubject(req: Request, res: Response): Promise<void> {
    const subject = await AcademicService.updateSubject(req.params.id as string, req.body);
    res.json(apiResponse(true, subject, 'Subject updated successfully'));
  }

  static async deleteSubject(req: Request, res: Response): Promise<void> {
    await AcademicService.deleteSubject(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Subject deleted successfully'));
  }

  // ─── Timetable ─────────────────────────────────────────────────────────

  static async createTimetable(req: Request, res: Response): Promise<void> {
    const entry = await AcademicService.createTimetable(req.body);
    res.status(201).json(apiResponse(true, entry, 'Timetable entry created successfully'));
  }

  static async listTimetable(req: Request, res: Response): Promise<void> {
    const filters = {
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      classId: req.query.classId as string | undefined,
    };

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
    };

    const result = await AcademicService.listTimetable(filters, query);
    res.json(apiResponse(true, result, 'Timetable retrieved successfully'));
  }

  static async getTimetable(req: Request, res: Response): Promise<void> {
    const entry = await AcademicService.getTimetableById(req.params.id as string);
    res.json(apiResponse(true, entry, 'Timetable entry retrieved successfully'));
  }

  static async getTimetableByClass(req: Request, res: Response): Promise<void> {
    const entries = await AcademicService.getByClass(req.params.classId as string);
    res.json(apiResponse(true, entries, 'Class timetable retrieved successfully'));
  }

  static async getTimetableByTeacher(req: Request, res: Response): Promise<void> {
    const entries = await AcademicService.getByTeacher(req.params.teacherId as string);
    res.json(apiResponse(true, entries, 'Teacher timetable retrieved successfully'));
  }

  static async updateTimetable(req: Request, res: Response): Promise<void> {
    const entry = await AcademicService.updateTimetable(req.params.id as string, req.body);
    res.json(apiResponse(true, entry, 'Timetable entry updated successfully'));
  }

  static async deleteTimetable(req: Request, res: Response): Promise<void> {
    await AcademicService.deleteTimetable(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Timetable entry deleted successfully'));
  }

  // ─── Assessment ────────────────────────────────────────────────────────

  static async createAssessment(req: Request, res: Response): Promise<void> {
    const assessment = await AcademicService.createAssessment(req.body);
    res.status(201).json(apiResponse(true, assessment, 'Assessment created successfully'));
  }

  static async listAssessments(req: Request, res: Response): Promise<void> {
    const filters = {
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
      classId: req.query.classId as string | undefined,
      subjectId: req.query.subjectId as string | undefined,
      term: req.query.term ? Number(req.query.term) : undefined,
      academicYear: req.query.academicYear ? Number(req.query.academicYear) : undefined,
    };

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
    };

    const result = await AcademicService.listAssessments(filters, query);
    res.json(apiResponse(true, result, 'Assessments retrieved successfully'));
  }

  static async getAssessment(req: Request, res: Response): Promise<void> {
    const assessment = await AcademicService.getAssessmentById(req.params.id as string);
    res.json(apiResponse(true, assessment, 'Assessment retrieved successfully'));
  }

  static async updateAssessment(req: Request, res: Response): Promise<void> {
    const assessment = await AcademicService.updateAssessment(req.params.id as string, req.body);
    res.json(apiResponse(true, assessment, 'Assessment updated successfully'));
  }

  static async deleteAssessment(req: Request, res: Response): Promise<void> {
    await AcademicService.deleteAssessment(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Assessment deleted successfully'));
  }

  // ─── Marks ─────────────────────────────────────────────────────────────

  static async captureMark(req: Request, res: Response): Promise<void> {
    const mark = await AcademicService.captureMark(req.body);
    res.status(201).json(apiResponse(true, mark, 'Mark captured successfully'));
  }

  static async bulkCaptureMarks(req: Request, res: Response): Promise<void> {
    const { assessmentId, schoolId, marks } = req.body;
    const result = await AcademicService.bulkCaptureMarks(assessmentId, schoolId, marks);
    res.status(201).json(apiResponse(true, result, 'Marks captured successfully'));
  }

  static async getStudentMarks(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const term = req.query.term ? Number(req.query.term) : undefined;
    const academicYear = req.query.academicYear ? Number(req.query.academicYear) : undefined;

    const marks = await AcademicService.getStudentMarks(studentId, term, academicYear);
    res.json(apiResponse(true, marks, 'Student marks retrieved successfully'));
  }

  static async getAssessmentMarks(req: Request, res: Response): Promise<void> {
    const marks = await AcademicService.getAssessmentMarks(req.params.assessmentId as string);
    res.json(apiResponse(true, marks, 'Assessment marks retrieved successfully'));
  }
}
