import type { Request } from 'express';
import { Response } from 'express';
import { AcademicService } from '../service.js';
import { Timetable } from '../model.js';
import { apiResponse } from '../../../common/utils.js';
import { ConfigService } from '../../TimetableBuilder/services/config.service.js';

export class TimetableController {
  static async createTimetable(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const data = { ...req.body };

    // Teachers can only create entries for themselves
    if (user.role === 'teacher') {
      data.teacherId = user.id;
      data.schoolId = user.schoolId;
    }

    // Validate class belongs to the school
    const schoolId = data.schoolId ?? req.user!.schoolId!;
    try {
      await AcademicService.getClassById(data.classId, schoolId);
    } catch {
      res.status(400).json(apiResponse(false, undefined, undefined, 'Class not found in your school'));
      return;
    }

    // Validate period is within configured range
    try {
      const timetableConfig = await ConfigService.getConfig(schoolId);
      const dayKey = data.day as string;
      const maxPeriods = (timetableConfig.periodsPerDay as unknown as Record<string, number>)?.[dayKey] ?? 0;
      if (maxPeriods > 0 && data.period > maxPeriods) {
        res.status(400).json(apiResponse(false, undefined, undefined, `Period ${data.period} exceeds the configured ${maxPeriods} periods for ${dayKey}`));
        return;
      }
    } catch {
      // No config exists — skip period validation (admin may not have configured yet)
    }

    const entry = await AcademicService.createTimetable(data);
    res.status(201).json(apiResponse(true, entry, 'Timetable entry created successfully'));
  }

  static async listTimetable(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const filters = {
      schoolId,
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
    const schoolId = req.user!.schoolId!;
    const entry = await AcademicService.getTimetableById(req.params.id as string, schoolId);
    res.json(apiResponse(true, entry, 'Timetable entry retrieved successfully'));
  }

  static async getTimetableByClass(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const entries = await AcademicService.getByClass(req.params.classId as string, schoolId);
    res.json(apiResponse(true, entries, 'Class timetable retrieved successfully'));
  }

  static async getTimetableByTeacher(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const schoolId = user.schoolId!;
    // Teachers can only view their own timetable
    const teacherId = user.role === 'teacher' ? user.id : req.params.teacherId as string;
    const entries = await AcademicService.getByTeacher(teacherId, schoolId);
    res.json(apiResponse(true, entries, 'Teacher timetable retrieved successfully'));
  }

  static async updateTimetable(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const schoolId = user.schoolId!;

    // Teachers can only update their own entries
    if (user.role === 'teacher') {
      const existing = await Timetable.findOne({ _id: req.params.id, schoolId, isDeleted: false })
        .select('teacherId')
        .lean();
      if (!existing) {
        res.status(404).json(apiResponse(false, undefined, undefined, 'Timetable entry not found'));
        return;
      }
      if (String(existing.teacherId) !== String(user.id)) {
        res.status(403).json(apiResponse(false, undefined, undefined, 'You can only edit your own timetable entries'));
        return;
      }
    }

    const entry = await AcademicService.updateTimetable(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, entry, 'Timetable entry updated successfully'));
  }

  static async deleteTimetable(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const schoolId = user.schoolId!;

    // Teachers can only delete their own entries
    if (user.role === 'teacher') {
      const existing = await Timetable.findOne({ _id: req.params.id, schoolId, isDeleted: false })
        .select('teacherId')
        .lean();
      if (!existing) {
        res.status(404).json(apiResponse(false, undefined, undefined, 'Timetable entry not found'));
        return;
      }
      if (String(existing.teacherId) !== String(user.id)) {
        res.status(403).json(apiResponse(false, undefined, undefined, 'You can only delete your own timetable entries'));
        return;
      }
    }

    await AcademicService.deleteTimetable(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Timetable entry deleted successfully'));
  }

  static async detectTimetableClashes(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const clashes = await AcademicService.detectTimetableClashes(schoolId);
    res.json(apiResponse(true, clashes, 'Timetable clashes retrieved successfully'));
  }
}
