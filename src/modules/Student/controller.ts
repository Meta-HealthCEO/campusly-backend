import { Request, Response } from 'express';
import type { Types } from 'mongoose';
import { StudentService } from './service.js';
import { StudentInviteService } from './invite.service.js';
import { getMyStudentClasses } from './service-classes.js';
import { apiResponse } from '../../common/utils.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors.js';
import { Student } from './model.js';
import { Class } from '../Academic/model.js';

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

async function resolveTeacherTargetClass(req: Request, classId: string): Promise<{
  schoolId: string;
  classId: string;
  gradeId: string;
}> {
  if (req.user?.role !== 'teacher') {
    throw new BadRequestError('Teacher context is required');
  }

  const schoolId = req.user.schoolId;
  if (!schoolId) throw new ForbiddenError('School context is required');

  const cls = await Class.findOne({ _id: classId, schoolId, isDeleted: false })
    .select('_id gradeId')
    .lean();
  if (!cls) throw new NotFoundError('Teaching group not found');

  const { AcademicService } = await import('../Academic/service.js');
  const canAccess = await AcademicService.teacherCanAccessClass(
    req.user.id,
    String(cls._id),
    schoolId,
  );
  if (!canAccess) {
    throw new ForbiddenError('You can only manage learners in your own teaching groups');
  }

  return {
    schoolId,
    classId: String(cls._id),
    gradeId: String(cls.gradeId),
  };
}

export class StudentController {
  static async create(req: Request, res: Response): Promise<void> {
    const data = { ...req.body };

    if (req.user?.role === 'teacher') {
      const target = await resolveTeacherTargetClass(req, data.classId as string);
      data.schoolId = target.schoolId;
      data.classId = target.classId;
      data.gradeId = target.gradeId;
    } else if (!data.schoolId && req.user?.schoolId) {
      // Auto-fill schoolId from the authenticated user if not provided.
      data.schoolId = req.user.schoolId;
    }

    const student = await StudentService.create(data);
    res.status(201).json(apiResponse(true, student, 'Student created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.role === 'teacher'
      ? req.user.schoolId
      : (req.query.schoolId as string) ?? req.user?.schoolId;

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

    let classIds: Types.ObjectId[] | undefined;
    if (req.user?.role === 'teacher') {
      const { AcademicService } = await import('../Academic/service.js');
      classIds = await AcademicService.getTeacherAccessibleClassIds(req.user.id, schoolId);
    }

    const result = await StudentService.list(schoolId, query, { classIds });
    res.json(apiResponse(true, result, 'Students retrieved successfully'));
  }

  static async searchSchoolRoster(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const q = (req.query.q as string | undefined) ?? '';
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const rows = await StudentService.searchSchoolRoster(schoolId, q, limit);
    res.json(apiResponse(true, rows, 'Students retrieved successfully'));
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
    const data = { ...req.body };

    if (req.user?.role === 'teacher') {
      delete data.schoolId;
      if (data.classId) {
        const target = await resolveTeacherTargetClass(req, data.classId as string);
        data.classId = target.classId;
        data.gradeId = target.gradeId;
      } else {
        delete data.gradeId;
      }
    }

    const student = await StudentService.update(req.params.id as string, schoolId, data);
    res.json(apiResponse(true, student, 'Student updated successfully'));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await assertTeacherCanAccessStudent(req, req.params.id as string);
    await StudentService.delete(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Student deleted successfully'));
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

  static async regenerateCredentials(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId ?? '';
    await assertTeacherCanAccessStudent(req, req.params.id as string);
    const result = await StudentService.regenerateCredentials(
      req.params.id as string,
      schoolId,
    );
    res.json(apiResponse(true, result, 'Student credentials regenerated successfully'));
  }

  static async getMyClasses(req: Request, res: Response): Promise<void> {
    const user = req.user;
    if (!user) throw new ForbiddenError('Authentication required');
    if (!user.schoolId) throw new ForbiddenError('School context is required');
    const result = await getMyStudentClasses(user.id, user.schoolId);
    res.json(apiResponse(true, result));
  }
}
