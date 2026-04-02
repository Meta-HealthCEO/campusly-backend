import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { HomeworkService } from './service.js';
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
    const homeworkId = req.params.id as string;
    const { files } = req.body;
    const studentId = getUser(req).id;
    const schoolId = getUser(req).schoolId ?? '';

    const submission = await HomeworkService.submitHomework(
      homeworkId,
      studentId,
      schoolId,
      files,
    );
    res.status(201).json(apiResponse(true, submission, 'Homework submitted successfully'));
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
    const submissions = await HomeworkService.getSubmissions(req.params.id as string);
    res.json(apiResponse(true, submissions, 'Submissions retrieved successfully'));
  }

  static async getHomeworkForParent(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const studentId = req.params.studentId as string;
    const result = await HomeworkService.getHomeworkForStudent(studentId, schoolId);
    res.json(apiResponse(true, result, 'Parent homework retrieved successfully'));
  }

  static async getStudentSubmissions(req: Request, res: Response): Promise<void> {
    const submissions = await HomeworkService.getStudentSubmissions(req.params.studentId as string);
    res.json(apiResponse(true, submissions, 'Student submissions retrieved successfully'));
  }
}
