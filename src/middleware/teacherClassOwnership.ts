import type { Request, Response, NextFunction } from 'express';
import { Class, Timetable } from '../modules/Academic/model.js';

/**
 * Ensures teachers can only access classes they teach (as homeroom teacher
 * OR through a timetable assignment). Admins and super_admins bypass this check.
 *
 * Extracts classId from req.params (default "classId"), req.query, or req.body.
 */
export function requireTeacherClassOwnership(paramName = 'classId') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (role !== 'teacher') return next();

    const rawParam = req.params[paramName] ?? req.query[paramName] ?? req.body?.[paramName];
    const classId = Array.isArray(rawParam) ? rawParam[0] : rawParam;

    if (!classId) return next();

    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId;

    if (!teacherId || !schoolId) {
      return res.status(403).json({ success: false, error: 'Teacher context missing' });
    }

    const [homeroom, timetableEntry] = await Promise.all([
      Class.findOne({ _id: classId, schoolId, teacherId, isDeleted: false }).lean(),
      Timetable.findOne({ schoolId, teacherId, classId, isDeleted: false }).lean(),
    ]);

    if (!homeroom && !timetableEntry) {
      return res.status(403).json({
        success: false,
        error: 'You can only access classes you teach',
      });
    }

    next();
  };
}
