import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { AcademicService } from '../service.js';
import { apiResponse } from '../../../common/utils.js';
import { getTermSummary } from '../services/term-summary.service.js';
import { getSubjectTrend } from '../services/subject-trend.service.js';
import { getStudentTermDetail } from '../services/student-term-detail.service.js';
import {
  getMatrix as getWeightingMatrix,
  setTermBuckets as setWeightingTermBuckets,
} from '../services/subject-weighting.service.js';
import { BadRequestError } from '../../../common/errors.js';
import { resolveSchoolScope, requireSchoolScope } from '../../../common/school-scope.js';

export class MiscController {
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

  // ─── Term Summary (cross-assessment roll-up for a class) ──────────────
  // Powers the gradebook's Term Summary tab. Returns every student in the
  // class × every subject they have a mark for in the given term/year, with
  // the weighted average per cell and per-subject cohort averages. One
  // request, no client-side maths.
  static async getTermSummary(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const classId = req.query.classId as string | undefined;
    // term is optional — when omitted (or set to 'year'), the service
    // aggregates across all four terms in the academic year.
    const termRaw = req.query.term as string | undefined;
    const academicYear = req.query.academicYear
      ? Number(req.query.academicYear)
      : new Date().getFullYear();
    if (!classId) throw new BadRequestError('classId is required');
    let term: number | undefined;
    if (termRaw && termRaw !== 'year' && termRaw !== 'all') {
      term = Number(termRaw);
      if (!Number.isInteger(term) || term < 1 || term > 4) {
        throw new BadRequestError('term must be 1-4 or "year"');
      }
    }
    const summary = await getTermSummary({
      schoolId,
      classId,
      term,
      academicYear,
    });
    res.json(apiResponse(true, summary, 'Term summary retrieved'));
  }

  // ─── Subject Trend (term-by-term cohort trend for one class+subject) ──
  static async getSubjectTrend(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const classId = req.query.classId as string | undefined;
    const subjectId = req.query.subjectId as string | undefined;
    const academicYear = req.query.academicYear
      ? Number(req.query.academicYear)
      : new Date().getFullYear();
    if (!classId) throw new BadRequestError('classId is required');
    if (!subjectId) throw new BadRequestError('subjectId is required');
    const trend = await getSubjectTrend({
      schoolId,
      classId,
      subjectId,
      academicYear,
    });
    res.json(apiResponse(true, trend, 'Subject trend retrieved'));
  }

  // ─── Student Term Detail (per-subject breakdown for one student) ──────
  static async getStudentTermDetail(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const studentId = req.params.studentId as string;
    const termRaw = req.query.term as string | undefined;
    const academicYear = req.query.academicYear
      ? Number(req.query.academicYear)
      : new Date().getFullYear();
    if (!studentId) throw new BadRequestError('studentId is required');
    let term: number | undefined;
    if (termRaw && termRaw !== 'year' && termRaw !== 'all') {
      term = Number(termRaw);
      if (!Number.isInteger(term) || term < 1 || term > 4) {
        throw new BadRequestError('term must be 1-4 or "year"');
      }
    }
    const detail = await getStudentTermDetail({
      schoolId,
      studentId,
      term,
      academicYear,
    });
    res.json(apiResponse(true, detail, 'Student term detail retrieved'));
  }

  // ─── Marks ─────────────────────────────────────────────────────────────

  static async captureMark(req: Request, res: Response): Promise<void> {
    // Tenant comes from the JWT — never from the body, which the client controls.
    const mark = await AcademicService.captureMark({
      ...req.body,
      schoolId: requireSchoolScope(req),
    });
    res.status(201).json(apiResponse(true, mark, 'Mark captured successfully'));
  }

  static async bulkCaptureMarks(req: Request, res: Response): Promise<void> {
    const { assessmentId, marks } = req.body;
    // Ignore any body-supplied schoolId: it previously allowed a teacher to
    // write marks into another school's gradebook.
    const result = await AcademicService.bulkCaptureMarks(
      assessmentId,
      requireSchoolScope(req),
      marks,
    );
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
    const schoolId = resolveSchoolScope(req);

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
    const schoolId = resolveSchoolScope(req);
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
    const schoolId = resolveSchoolScope(req);
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

  // ─── Subject Weighting Matrix (gradebook bulk path) ──────────────────
  // The 4-term × 5-type config for a single (subject, grade), atomic
  // upsert per term. The legacy per-row CRUD below is left in place but
  // the gradebook never touches it.

  static async getSubjectWeightingMatrix(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const subjectId = req.query.subjectId as string | undefined;
    const gradeId = req.query.gradeId as string | undefined;
    if (!subjectId) throw new BadRequestError('subjectId is required');
    if (!gradeId) throw new BadRequestError('gradeId is required');
    const matrix = await getWeightingMatrix({ schoolId, subjectId, gradeId });
    res.json(apiResponse(true, matrix, 'Subject weighting matrix retrieved'));
  }

  static async setSubjectWeightingTermBuckets(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await setWeightingTermBuckets({
      schoolId,
      subjectId: req.body.subjectId,
      gradeId: req.body.gradeId,
      term: req.body.term,
      buckets: req.body.buckets,
    });
    res.json(apiResponse(true, result, 'Subject weighting saved'));
  }

  // ─── Subject Weightings ───────────────────────────────────────────────────

  static async createSubjectWeighting(req: Request, res: Response): Promise<void> {
    const weighting = await AcademicService.createSubjectWeighting(req.body);
    res.status(201).json(apiResponse(true, weighting, 'Subject weighting created successfully'));
  }

  static async listSubjectWeightings(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolScope(req);
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
    const schoolId = resolveSchoolScope(req);
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
