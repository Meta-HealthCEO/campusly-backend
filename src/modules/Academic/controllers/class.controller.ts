import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { AcademicService } from '../service.js';
import { apiResponse } from '../../../common/utils.js';
import { ForbiddenError, ConflictError } from '../../../common/errors.js';

export class ClassController {
  static async createClass(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data = { ...req.body };

    // If teacher is creating the class, auto-set themselves as the teacher
    if (user.role === 'teacher' && !data.teacherId) {
      data.teacherId = user.id;
    }
    if (!data.schoolId && user.schoolId) {
      data.schoolId = user.schoolId;
    }

    const cls = await AcademicService.createClass(data);
    // Re-fetch populated so frontend gets grade/teacher objects
    const populated = await AcademicService.getClassById(String(cls._id), String(cls.schoolId));

    // If a subjectId was provided, auto-create a timetable entry linking
    // this teacher to this class + subject. This makes the class appear
    // in the teacher's teaching-load under "subject classes".
    if (data.subjectId && user.role === 'teacher') {
      try {
        // Find next available period to avoid clashes
        const existingCount = await AcademicService.countTimetableEntries(
          String(populated.schoolId), user.id, 'monday',
        );
        await AcademicService.createTimetable({
          schoolId: populated.schoolId,
          teacherId: user.id as unknown as import('mongoose').Types.ObjectId,
          classId: populated._id as import('mongoose').Types.ObjectId,
          subjectId: data.subjectId as unknown as import('mongoose').Types.ObjectId,
          day: 'monday',
          period: existingCount + 1,
          startTime: '08:00',
          endTime: '08:30',
        });
      } catch (err: unknown) {
        // Non-fatal — class was created, timetable linkage is a convenience
        console.error('Failed to auto-create timetable entry', err);
      }
    }

    res.status(201).json(apiResponse(true, populated, 'Class created successfully'));
  }

  static async listClasses(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;

    let teacherId: string | undefined = req.query.teacherId as string | undefined;
    if (teacherId === 'me') teacherId = user.id;
    if (user.role === 'teacher') teacherId = user.id;

    const includeSubjectClasses = teacherId
      ? (req.query.includeSubjectClasses !== 'false')
      : undefined;

    const filters = {
      schoolId,
      gradeId: req.query.gradeId as string | undefined,
      teacherId,
      includeSubjectClasses,
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
    const schoolId = req.user!.schoolId!;
    const cls = await AcademicService.getClassById(req.params.id as string, schoolId);
    res.json(apiResponse(true, cls, 'Class retrieved successfully'));
  }

  static async updateClass(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    if (user.role === 'teacher') {
      const canAccess = await AcademicService.teacherCanAccessClass(user.id, req.params.id as string, schoolId);
      if (!canAccess) throw new ForbiddenError('You can only modify your own classes');
    }

    // Class schema has no subjectId field — strip from payload before update so
    // Mongoose strict mode doesn't have to silently drop it. We persist the
    // subject linkage via Timetable below.
    const { subjectId, ...rest } = req.body as Record<string, unknown>;
    const cls = await AcademicService.updateClass(req.params.id as string, schoolId, rest);

    if (subjectId && user.role === 'teacher') {
      try {
        await AcademicService.syncTeachingGroupSubject({
          schoolId,
          teacherId: user.id,
          classId: req.params.id as string,
          subjectId: subjectId as string,
        });
      } catch (err: unknown) {
        // Non-fatal — class still updated; surface in logs
        console.error('Failed to sync teaching-group subject', err);
      }
    }

    res.json(apiResponse(true, cls, 'Class updated successfully'));
  }

  static async deleteClass(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    if (user.role === 'teacher') {
      const canAccess = await AcademicService.teacherCanAccessClass(user.id, req.params.id as string, schoolId);
      if (!canAccess) throw new ForbiddenError('You can only modify your own classes');
    }

    // Check if class has students — prevent deletion if so
    const studentCount = await AcademicService.countClassStudents(
      req.params.id as string, schoolId,
    );
    if (studentCount > 0) {
      throw new ConflictError(
        `Cannot delete class with ${studentCount} student${studentCount > 1 ? 's' : ''}. Remove or reassign students first.`,
      );
    }

    await AcademicService.deleteClass(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Class deleted successfully'));
  }

  static async getClassJoinCode(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const cls = await AcademicService.getClassById(req.params.id as string, schoolId);
    res.json(apiResponse(true, { classroomCode: cls.classroomCode, className: cls.name }, 'Join code retrieved successfully'));
  }

  static async regenerateClassJoinCode(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const cls = await AcademicService.regenerateClassroomCode(req.params.id as string, schoolId);
    res.json(apiResponse(true, { classroomCode: cls.classroomCode, className: cls.name }, 'Join code regenerated successfully'));
  }

  static async getTeacherTeachingLoad(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    let teacherId = (req.query.teacherId as string) ?? user.id;
    if (user.role === 'teacher') teacherId = user.id;
    const load = await AcademicService.getTeacherTeachingLoad(
      teacherId,
      user.schoolId!,
      { isStandaloneTeacher: user.isStandaloneTeacher === true },
    );
    res.json(apiResponse(true, load, 'Teaching load retrieved'));
  }
}
