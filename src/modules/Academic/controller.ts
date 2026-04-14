import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { AcademicService } from './service.js';
import { Timetable } from './model.js';
import { apiResponse } from '../../common/utils.js';
import { ForbiddenError } from '../../common/errors.js';

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

  // ─── Class ─────────────────────────────────────────────────────────────

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
        const existingCount = await Timetable.countDocuments({
          schoolId: populated.schoolId,
          teacherId: user.id,
          day: 'monday',
          isDeleted: false,
        });
        await AcademicService.createTimetable({
          schoolId: populated.schoolId,
          teacherId: user.id as unknown as import('mongoose').Types.ObjectId,
          classId: populated._id as import('mongoose').Types.ObjectId,
          subjectId: data.subjectId as unknown as import('mongoose').Types.ObjectId,
          day: 'monday',
          period: existingCount,
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
    const cls = await AcademicService.updateClass(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, cls, 'Class updated successfully'));
  }

  static async deleteClass(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    if (user.role === 'teacher') {
      const canAccess = await AcademicService.teacherCanAccessClass(user.id, req.params.id as string, schoolId);
      if (!canAccess) throw new ForbiddenError('You can only modify your own classes');
    }
    await AcademicService.deleteClass(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Class deleted successfully'));
  }

  static async getClassJoinCode(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const cls = await AcademicService.getClassById(req.params.id as string, schoolId);
    res.json(apiResponse(true, { classroomCode: (cls as unknown as Record<string, unknown>).classroomCode, className: cls.name }, 'Join code retrieved successfully'));
  }

  static async regenerateClassJoinCode(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const cls = await AcademicService.regenerateClassroomCode(req.params.id as string, schoolId);
    res.json(apiResponse(true, { classroomCode: (cls as unknown as Record<string, unknown>).classroomCode, className: cls.name }, 'Join code regenerated successfully'));
  }

  // ─── Teacher Teaching Load ──────────────────────────────────────────────

  static async getTeacherTeachingLoad(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    let teacherId = (req.query.teacherId as string) ?? user.id;
    if (user.role === 'teacher') teacherId = user.id;
    const load = await AcademicService.getTeacherTeachingLoad(teacherId, user.schoolId!);
    res.json(apiResponse(true, load, 'Teaching load retrieved'));
  }

  // ─── Subject ───────────────────────────────────────────────────────────

  static async createSubject(req: Request, res: Response): Promise<void> {
    const subject = await AcademicService.createSubject(req.body);
    res.status(201).json(apiResponse(true, subject, 'Subject created successfully'));
  }

  static async listSubjects(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = (req.query.schoolId as string) ?? user.schoolId;
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    let teacherId: string | undefined = req.query.teacherId as string | undefined;
    if (teacherId === 'me') teacherId = user.id;
    if (user.role === 'teacher') teacherId = user.id;

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
    };

    const gradeId = req.query.gradeId as string | undefined;

    const result = await AcademicService.listSubjects(schoolId, query, { teacherId, gradeId });
    res.json(apiResponse(true, result, 'Subjects retrieved successfully'));
  }

  static async getSubject(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const subject = await AcademicService.getSubjectById(req.params.id as string, schoolId);
    res.json(apiResponse(true, subject, 'Subject retrieved successfully'));
  }

  static async updateSubject(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const subject = await AcademicService.updateSubject(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, subject, 'Subject updated successfully'));
  }

  static async deleteSubject(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await AcademicService.deleteSubject(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Subject deleted successfully'));
  }

  // ─── Timetable ─────────────────────────────────────────────────────────

  static async createTimetable(req: Request, res: Response): Promise<void> {
    const entry = await AcademicService.createTimetable(req.body);
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
    const entries = await AcademicService.getByClass(req.params.classId as string);
    res.json(apiResponse(true, entries, 'Class timetable retrieved successfully'));
  }

  static async getTimetableByTeacher(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const entries = await AcademicService.getByTeacher(req.params.teacherId as string, schoolId);
    res.json(apiResponse(true, entries, 'Teacher timetable retrieved successfully'));
  }

  static async updateTimetable(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const entry = await AcademicService.updateTimetable(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, entry, 'Timetable entry updated successfully'));
  }

  static async deleteTimetable(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await AcademicService.deleteTimetable(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Timetable entry deleted successfully'));
  }

  static async detectTimetableClashes(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const clashes = await AcademicService.detectTimetableClashes(schoolId);
    res.json(apiResponse(true, clashes, 'Timetable clashes retrieved successfully'));
  }

  // ─── Assessment ────────────────────────────────────────────────────────

  static async createAssessment(req: Request, res: Response): Promise<void> {
    const assessment = await AcademicService.createAssessment(req.body);
    res.status(201).json(apiResponse(true, assessment, 'Assessment created successfully'));
  }

  static async listAssessments(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const filters = {
      schoolId,
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
    const schoolId = req.user!.schoolId!;
    const assessment = await AcademicService.getAssessmentById(req.params.id as string, schoolId);
    res.json(apiResponse(true, assessment, 'Assessment retrieved successfully'));
  }

  static async updateAssessment(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const assessment = await AcademicService.updateAssessment(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, assessment, 'Assessment updated successfully'));
  }

  static async deleteAssessment(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await AcademicService.deleteAssessment(req.params.id as string, schoolId);
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
    const schoolId = req.user!.schoolId!;
    const studentId = req.params.studentId as string;
    const term = req.query.term ? Number(req.query.term) : undefined;
    const academicYear = req.query.academicYear ? Number(req.query.academicYear) : undefined;

    const marks = await AcademicService.getStudentMarks(studentId, schoolId, term, academicYear);
    res.json(apiResponse(true, marks, 'Student marks retrieved successfully'));
  }

  static async getAssessmentMarks(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const marks = await AcademicService.getAssessmentMarks(req.params.assessmentId as string, schoolId);
    res.json(apiResponse(true, marks, 'Assessment marks retrieved successfully'));
  }

  // ─── LURITS Export ────────────────────────────────────────────────────────

  static async exportLurits(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const data = await AcademicService.getLuritsExport(schoolId);

    const headers = [
      'admissionNumber',
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender',
      'grade',
      'luritsNumber',
      'saIdNumber',
      'homeLanguage',
    ];

    function escapeCSV(val: string): string {
      // Prevent CSV formula injection
      if (/^[=+@\-]/.test(val)) return `'${val}`;
      return val;
    }

    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((h) => {
        const raw = String((row as Record<string, unknown>)[h] ?? '');
        const val = escapeCSV(raw);
        // Escape values containing commas, quotes, or newlines
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=lurits-export.csv');
    res.send(csvString);
  }

  // ─── Exams ──────────────────────────────────────────────────────────────────

  static async createExam(req: Request, res: Response): Promise<void> {
    const exam = await AcademicService.createExam(req.body);
    res.status(201).json(apiResponse(true, exam, 'Exam created successfully'));
  }

  static async listExams(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
    };
    const result = await AcademicService.listExams(schoolId, query);
    res.json(apiResponse(true, result, 'Exams retrieved successfully'));
  }

  static async getExam(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const exam = await AcademicService.getExamById(req.params.id as string, schoolId);
    res.json(apiResponse(true, exam, 'Exam retrieved successfully'));
  }

  static async updateExam(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const exam = await AcademicService.updateExam(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, exam, 'Exam updated successfully'));
  }

  static async deleteExam(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await AcademicService.deleteExam(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Exam deleted successfully'));
  }

  // ─── Exam Timetable ─────────────────────────────────────────────────────

  static async createExamTimetable(req: Request, res: Response): Promise<void> {
    const entry = await AcademicService.createExamTimetable(req.body);
    res.status(201).json(apiResponse(true, entry, 'Exam timetable entry created successfully'));
  }

  static async listExamTimetable(req: Request, res: Response): Promise<void> {
    const examId = req.params.examId as string;
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await AcademicService.listExamTimetable(examId, query);
    res.json(apiResponse(true, result, 'Exam timetable retrieved successfully'));
  }

  static async getExamTimetable(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const entry = await AcademicService.getExamTimetableById(req.params.id as string, schoolId);
    res.json(apiResponse(true, entry, 'Exam timetable entry retrieved successfully'));
  }

  static async updateExamTimetable(req: Request, res: Response): Promise<void> {
    const entry = await AcademicService.updateExamTimetable(req.params.id as string, req.body);
    res.json(apiResponse(true, entry, 'Exam timetable entry updated successfully'));
  }

  static async deleteExamTimetable(req: Request, res: Response): Promise<void> {
    await AcademicService.deleteExamTimetable(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Exam timetable entry deleted successfully'));
  }

  // ─── Past Papers ──────────────────────────────────────────────────────────

  static async createPastPaper(req: Request, res: Response): Promise<void> {
    const paper = await AcademicService.createPastPaper(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, paper, 'Past paper uploaded successfully'));
  }

  static async listPastPapers(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const filters = {
      subjectId: req.query.subjectId as string | undefined,
      gradeId: req.query.gradeId as string | undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
    };
    const query = { page: req.query.page ? Number(req.query.page) : undefined, limit: req.query.limit ? Number(req.query.limit) : undefined };
    const result = await AcademicService.listPastPapers(schoolId, filters, query);
    res.json(apiResponse(true, result, 'Past papers retrieved successfully'));
  }

  static async deletePastPaper(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await AcademicService.deletePastPaper(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Past paper deleted successfully'));
  }

  // ─── Subject Weightings ───────────────────────────────────────────────────

  static async createSubjectWeighting(req: Request, res: Response): Promise<void> {
    const weighting = await AcademicService.createSubjectWeighting(req.body);
    res.status(201).json(apiResponse(true, weighting, 'Subject weighting created successfully'));
  }

  static async listSubjectWeightings(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const filters = {
      subjectId: req.query.subjectId as string | undefined,
      gradeId: req.query.gradeId as string | undefined,
      term: req.query.term ? Number(req.query.term) : undefined,
    };
    const result = await AcademicService.listSubjectWeightings(schoolId, filters);
    res.json(apiResponse(true, result, 'Subject weightings retrieved successfully'));
  }

  static async updateSubjectWeighting(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const weighting = await AcademicService.updateSubjectWeighting(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, weighting, 'Subject weighting updated successfully'));
  }

  static async deleteSubjectWeighting(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await AcademicService.deleteSubjectWeighting(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Subject weighting deleted successfully'));
  }

  // ─── Remedial Tracking ────────────────────────────────────────────────────

  static async createRemedial(req: Request, res: Response): Promise<void> {
    const remedial = await AcademicService.createRemedial(req.body);
    res.status(201).json(apiResponse(true, remedial, 'Remedial record created successfully'));
  }

  static async listRemedials(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const filters = {
      studentId: req.query.studentId as string | undefined,
      subjectId: req.query.subjectId as string | undefined,
      status: req.query.status as string | undefined,
    };
    const query = { page: req.query.page ? Number(req.query.page) : undefined, limit: req.query.limit ? Number(req.query.limit) : undefined };
    const result = await AcademicService.listRemedials(schoolId, filters, query);
    res.json(apiResponse(true, result, 'Remedial records retrieved successfully'));
  }

  static async getRemedial(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const remedial = await AcademicService.getRemedialById(req.params.id as string, schoolId);
    res.json(apiResponse(true, remedial, 'Remedial record retrieved successfully'));
  }

  static async updateRemedial(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const remedial = await AcademicService.updateRemedial(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, remedial, 'Remedial record updated successfully'));
  }

  static async deleteRemedial(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await AcademicService.deleteRemedial(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Remedial record deleted successfully'));
  }

  // ─── Promotion ────────────────────────────────────────────────────────────

  static async calculatePromotion(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const year = Number(req.query.year);
    if (!year) { res.status(400).json(apiResponse(false, undefined, undefined, 'year is required')); return; }
    const result = await AcademicService.calculatePromotion(studentId, year);
    res.json(apiResponse(true, result, 'Promotion calculation completed'));
  }

  static async promotionReport(req: Request, res: Response): Promise<void> {
    const gradeId = req.params.gradeId as string;
    const year = Number(req.query.year);
    if (!year) { res.status(400).json(apiResponse(false, undefined, undefined, 'year is required')); return; }
    const result = await AcademicService.promotionReport(gradeId, year);
    res.json(apiResponse(true, result, 'Promotion report generated'));
  }
}
