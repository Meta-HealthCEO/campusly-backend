import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import {
  HomeworkService,
  getStudentDashboardCounts,
  getParentDashboardCounts,
} from './service.js';
import { generateComprehensionQuestions } from './service-homework-comprehension.js';
import { apiResponse } from '../../common/utils.js';

export class HomeworkController {
  static async create(req: Request, res: Response): Promise<void> {
    const homework = await HomeworkService.create(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, homework, 'Homework created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
      classId: req.query.classId as string | undefined,
      subjectId: req.query.subjectId as string | undefined,
    };

    const result = await HomeworkService.list(schoolId, query);
    res.json(apiResponse(true, result, 'Homework list retrieved successfully'));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const homework = await HomeworkService.getById(req.params.id as string, schoolId);
    res.json(apiResponse(true, homework, 'Homework retrieved successfully'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const homework = await HomeworkService.update(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, homework, 'Homework updated successfully'));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await HomeworkService.delete(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Homework deleted successfully'));
  }

  static async submit(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { Student } = await import('../Student/model.js');
    const student = await Student.findOne({ userId: req.user!.id, schoolId, isDeleted: false }).lean();
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }
    const submission = await HomeworkService.submitHomework(
      req.params.id as string,
      student._id.toString(),
      schoolId,
      req.body, // already Zod-validated
    );
    res.json({ data: submission });
  }

  static async grade(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const submissionId = req.params.submissionId as string;
    const { mark, feedback } = req.body;
    const gradedBy = getUser(req).id;

    const submission = await HomeworkService.gradeSubmission(
      submissionId,
      schoolId,
      mark,
      feedback,
      gradedBy,
    );
    res.json(apiResponse(true, submission, 'Submission graded successfully'));
  }

  static async getSubmissions(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const submissions = await HomeworkService.getSubmissions(req.params.id as string, schoolId);
    res.json(apiResponse(true, submissions, 'Submissions retrieved successfully'));
  }

  static async getHomeworkForParent(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const studentId = req.params.studentId as string;
    const result = await HomeworkService.getHomeworkForStudent(studentId, schoolId);
    res.json(apiResponse(true, result, 'Parent homework retrieved successfully'));
  }

  static async getStudentSubmissions(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    const submissions = await HomeworkService.getStudentSubmissions(
      req.params.studentId as string,
      schoolId,
    );
    res.json(apiResponse(true, submissions, 'Student submissions retrieved successfully'));
  }

  static async getSubmissionById(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const submission = await HomeworkService.getSubmissionById(req.params.id as string, schoolId);
    res.json({ data: submission });
  }

  static async regradeSubmission(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await HomeworkService.regrade(req.params.id as string, schoolId);
    res.json({ data: result });
  }

  static async generateComprehension(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const teacherId = req.user!.id;
    const { contentResourceId, count } = req.body as { contentResourceId: string; count: number };
    const { subjectId, gradeId, curriculumNodeId } = req.query as Record<string, string>;
    if (!subjectId || !gradeId || !curriculumNodeId) {
      res.status(400).json({ error: 'subjectId, gradeId, curriculumNodeId required as query params' });
      return;
    }
    const ids = await generateComprehensionQuestions(
      contentResourceId,
      schoolId,
      teacherId,
      subjectId,
      gradeId,
      curriculumNodeId,
      count,
    );
    res.json({ data: { questionIds: ids } });
  }

  static async studentDashboard(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { Student } = await import('../Student/model.js');
    const student = await Student.findOne({ userId: req.user!.id, schoolId, isDeleted: false }).lean();
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }
    const counts = await getStudentDashboardCounts(student._id.toString(), schoolId);
    res.json({ data: counts });
  }

  static async parentDashboard(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { Parent } = await import('../Parent/model.js');
    const parent = await Parent.findOne({ userId: req.user!.id, schoolId, isDeleted: false }).lean();
    if (!parent) {
      res.status(404).json({ error: 'Parent profile not found' });
      return;
    }
    const data = await getParentDashboardCounts(parent._id.toString(), schoolId);
    res.json({ data });
  }
}
