import { Request, Response } from 'express';
import { StudentService } from './service.js';
import { StudentInviteService } from './invite.service.js';
import { apiResponse } from '../../common/utils.js';
import { ForbiddenError, NotFoundError } from '../../common/errors.js';
import { Student } from './model.js';

async function assertTeacherCanAccessStudent(req: Request, studentId: string): Promise<void> {
  if (req.user?.role !== 'teacher') return;

  const schoolId = req.user.schoolId;
  if (!schoolId) throw new ForbiddenError('School context is required');

  const student = await Student.findOne({ _id: studentId, schoolId, isDeleted: false })
    .select('classId')
    .lean();
  if (!student) throw new NotFoundError('Student not found');

  const { AcademicService } = await import('../Academic/service.js');
  const canAccess = await AcademicService.teacherCanAccessClass(
    req.user.id,
    String(student.classId),
    schoolId,
  );
  if (!canAccess) {
    throw new ForbiddenError('You can only manage learners in your own teaching groups');
  }
}

export class StudentController {
  static async create(req: Request, res: Response): Promise<void> {
    const data = { ...req.body };
    // Auto-fill schoolId from the authenticated user if not provided
    if (!data.schoolId && req.user?.schoolId) {
      data.schoolId = req.user.schoolId;
    }
    const schoolId = data.schoolId as string;
    // Verify teacher can access the target class
    if (req.user?.role === 'teacher' && data.classId) {
      const { AcademicService } = await import('../Academic/service.js');
      const canAccess = await AcademicService.teacherCanAccessClass(
        req.user.id, data.classId as string, schoolId,
      );
      if (!canAccess) {
        throw new ForbiddenError('You can only add students to your own classes');
      }
    }
    const student = await StudentService.create(data);
    res.status(201).json(apiResponse(true, student, 'Student created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    if (req.user?.role === 'student') {
      const student = await StudentService.getByUserId(req.user.id, schoolId);
      res.json(apiResponse(true, {
        students: [student],
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      }, 'Students retrieved successfully'));
      return;
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
    };

    const result = await StudentService.list(schoolId, query);
    res.json(apiResponse(true, result, 'Students retrieved successfully'));
  }

  static async me(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const student = await StudentService.getByUserId(req.user!.id, schoolId);
    res.json(apiResponse(true, student, 'Student retrieved successfully'));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await assertTeacherCanAccessStudent(req, req.params.id as string);
    const student = await StudentService.getById(req.params.id as string, schoolId);
    res.json(apiResponse(true, student, 'Student retrieved successfully'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await assertTeacherCanAccessStudent(req, req.params.id as string);
    // Verify teacher can access the target class when reassigning
    if (req.user?.role === 'teacher' && req.body.classId) {
      const { AcademicService } = await import('../Academic/service.js');
      const canAccess = await AcademicService.teacherCanAccessClass(
        req.user.id, req.body.classId as string, schoolId,
      );
      if (!canAccess) {
        throw new ForbiddenError('You can only move students to your own classes');
      }
    }
    const student = await StudentService.update(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, student, 'Student updated successfully'));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await assertTeacherCanAccessStudent(req, req.params.id as string);
    await StudentService.delete(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Student deleted successfully'));
  }

  static async updateMedicalProfile(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await assertTeacherCanAccessStudent(req, req.params.id as string);
    const student = await StudentService.updateMedicalProfile(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, student, 'Medical profile updated successfully'));
  }

  static async inviteStudent(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId ?? '';
    await assertTeacherCanAccessStudent(req, req.params.id as string);
    const result = await StudentInviteService.inviteStudent(
      req.params.id as string,
      schoolId,
      req.body,
    );
    res.json(apiResponse(true, result, 'Student invited successfully'));
  }
}
