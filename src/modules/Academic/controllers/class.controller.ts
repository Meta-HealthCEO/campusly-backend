import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { AcademicService } from '../service.js';
import { apiResponse } from '../../../common/utils.js';
import { ForbiddenError, ConflictError } from '../../../common/errors.js';

async function assertTeacherCanAccessClass(
  user: ReturnType<typeof getUser>,
  classId: string,
  schoolId: string,
): Promise<void> {
  if (user.role !== 'teacher') return;
  const canAccess = await AcademicService.teacherCanAccessClass(user.id, classId, schoolId);
  if (!canAccess) throw new ForbiddenError('You can only access your own teaching groups');
}

export class ClassController {
  static async createClass(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const data = { ...req.body };

    // Scope teacher-created classes to the authenticated teacher, regardless
    // of any client-supplied IDs.
    if (user.role === 'teacher') {
      data.teacherId = user.id;
      data.schoolId = user.schoolId;
    }
    if (!data.schoolId && user.schoolId) {
      data.schoolId = user.schoolId;
    }

    if (user.role === 'teacher') {
      await AcademicService.validateTeachingGroupGrade({
        schoolId: data.schoolId,
        teacherId: user.id,
        gradeId: data.gradeId,
      });
      if (data.subjectId) {
        await AcademicService.validateTeachingGroupSubjectChoice({
          schoolId: data.schoolId,
          teacherId: user.id,
          gradeId: data.gradeId,
          subjectId: String(data.subjectId),
        });
      }
    }

    const cls = await AcademicService.createClass(data);
    const populated = await AcademicService.getClassById(String(cls._id), String(cls.schoolId));

    if (data.subjectId && user.role === 'teacher') {
      try {
        await AcademicService.syncTeachingGroupSubject({
          schoolId: String(populated.schoolId),
          teacherId: user.id,
          classId: String(populated._id),
          subjectId: String(data.subjectId),
          gradeId: String(cls.gradeId),
        });
      } catch (err: unknown) {
        // Roll back the group if its subject linkage cannot be created.
        await AcademicService.deleteClass(String(populated._id), String(populated.schoolId));
        throw err;
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
    const user = getUser(req);
    const schoolId = user.schoolId!;
    await assertTeacherCanAccessClass(user, req.params.id as string, schoolId);
    const cls = await AcademicService.getClassById(req.params.id as string, schoolId);
    res.json(apiResponse(true, cls, 'Class retrieved successfully'));
  }

  static async updateClass(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    await assertTeacherCanAccessClass(user, req.params.id as string, schoolId);

    const body = req.body as Record<string, unknown>;
    const hasSubjectId = Object.prototype.hasOwnProperty.call(body, 'subjectId');
    const { subjectId, ...rest } = body;
    const targetGradeId = rest.gradeId as string | undefined;

    if (targetGradeId && user.role === 'teacher') {
      await AcademicService.validateTeachingGroupGrade({
        schoolId,
        teacherId: user.id,
        gradeId: targetGradeId,
      });
    }

    if (hasSubjectId && subjectId && user.role === 'teacher') {
      await AcademicService.validateTeachingGroupSubject({
        schoolId,
        teacherId: user.id,
        classId: req.params.id as string,
        subjectId: subjectId as string,
        gradeId: targetGradeId,
      });
    }

    if (!hasSubjectId && targetGradeId && user.role === 'teacher') {
      await AcademicService.validateTeachingGroupCurrentSubjectForGrade({
        schoolId,
        teacherId: user.id,
        classId: req.params.id as string,
        gradeId: targetGradeId,
      });
    }

    // Class has no subjectId column; for standalone teaching groups the
    // single subject link is represented by the teacher's Timetable row.
    const cls = await AcademicService.updateClass(req.params.id as string, schoolId, rest);

    if (hasSubjectId && user.role === 'teacher') {
      try {
        if (subjectId) {
          await AcademicService.syncTeachingGroupSubject({
            schoolId,
            teacherId: user.id,
            classId: req.params.id as string,
            subjectId: subjectId as string,
          });
        } else {
          await AcademicService.clearTeachingGroupSubject({
            schoolId,
            teacherId: user.id,
            classId: req.params.id as string,
          });
        }
      } catch (err: unknown) {
        // Surface subject-link failures so the UI does not show a saved state
        // that the teacher cannot actually use.
        throw err;
      }
    }

    res.json(apiResponse(true, cls, 'Class updated successfully'));
  }

  static async deleteClass(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    await assertTeacherCanAccessClass(user, req.params.id as string, schoolId);

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
    const user = getUser(req);
    const schoolId = user.schoolId!;
    await assertTeacherCanAccessClass(user, req.params.id as string, schoolId);
    const cls = await AcademicService.getClassById(req.params.id as string, schoolId);
    res.json(apiResponse(true, { classroomCode: cls.classroomCode, className: cls.name }, 'Join code retrieved successfully'));
  }

  static async regenerateClassJoinCode(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    await assertTeacherCanAccessClass(user, req.params.id as string, schoolId);
    const cls = await AcademicService.regenerateClassroomCode(req.params.id as string, schoolId);
    res.json(apiResponse(true, { classroomCode: cls.classroomCode, className: cls.name }, 'Join code regenerated successfully'));
  }

  static async joinClassByCode(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const code = String((req.body as { code?: string }).code ?? '');
    const result = await AcademicService.joinClassByCode(user.id, schoolId, code);
    res.json(apiResponse(true, result, 'Joined class successfully'));
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
