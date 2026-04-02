/**
 * Academic service barrel — re-exports all sub-service methods under the
 * original AcademicService class so existing controller imports are unchanged.
 *
 * Implementation is split across:
 *   - services/grade.service.ts      (Grade + Class CRUD)
 *   - services/subject.service.ts    (Subject CRUD)
 *   - services/assessment.service.ts (Assessment + Mark + Promotion)
 *   - services/exam.service.ts       (Exam + Exam Timetable)
 *   - services/misc.service.ts       (Timetable, PastPapers, Remedials, Weightings, LURITS)
 */
import { GradeService } from './services/grade.service.js';
import { SubjectService } from './services/subject.service.js';
import { AssessmentService } from './services/assessment.service.js';
import { ExamService } from './services/exam.service.js';
import { MiscAcademicService } from './services/misc.service.js';

export class AcademicService {
  // ─── Grade + Class (from grade.service) ───────────────────────────────────
  static createGrade = GradeService.createGrade;
  static listGrades = GradeService.listGrades;
  static getGradeById = GradeService.getGradeById;
  static updateGrade = GradeService.updateGrade;
  static deleteGrade = GradeService.deleteGrade;
  static createClass = GradeService.createClass;
  static listClasses = GradeService.listClasses;
  static getClassById = GradeService.getClassById;
  static updateClass = GradeService.updateClass;
  static deleteClass = GradeService.deleteClass;

  // ─── Subject (from subject.service) ────────────────────────────────────────
  static createSubject = SubjectService.createSubject;
  static listSubjects = SubjectService.listSubjects;
  static getSubjectById = SubjectService.getSubjectById;
  static updateSubject = SubjectService.updateSubject;
  static deleteSubject = SubjectService.deleteSubject;

  // ─── Assessment + Mark + Promotion (from assessment.service) ──────────────
  static createAssessment = AssessmentService.createAssessment;
  static listAssessments = AssessmentService.listAssessments;
  static getAssessmentById = AssessmentService.getAssessmentById;
  static updateAssessment = AssessmentService.updateAssessment;
  static deleteAssessment = AssessmentService.deleteAssessment;
  static captureMark = AssessmentService.captureMark;
  static bulkCaptureMarks = AssessmentService.bulkCaptureMarks;
  static getStudentMarks = AssessmentService.getStudentMarks;
  static getAssessmentMarks = AssessmentService.getAssessmentMarks;
  static calculatePromotion = AssessmentService.calculatePromotion;
  static promotionReport = AssessmentService.promotionReport;

  // ─── Exam + Exam Timetable (from exam.service) ────────────────────────────
  static createExam = ExamService.createExam;
  static listExams = ExamService.listExams;
  static getExamById = ExamService.getExamById;
  static updateExam = ExamService.updateExam;
  static deleteExam = ExamService.deleteExam;
  static createExamTimetable = ExamService.createExamTimetable;
  static listExamTimetable = ExamService.listExamTimetable;
  static getExamTimetableById = ExamService.getExamTimetableById;
  static updateExamTimetable = ExamService.updateExamTimetable;
  static deleteExamTimetable = ExamService.deleteExamTimetable;

  // ─── Timetable, PastPapers, Weightings, Remedials, LURITS (from misc.service) ─
  static createTimetable = MiscAcademicService.createTimetable;
  static listTimetable = MiscAcademicService.listTimetable;
  static getTimetableById = MiscAcademicService.getTimetableById;
  static getByClass = MiscAcademicService.getByClass;
  static getByTeacher = MiscAcademicService.getByTeacher;
  static updateTimetable = MiscAcademicService.updateTimetable;
  static deleteTimetable = MiscAcademicService.deleteTimetable;
  static createPastPaper = MiscAcademicService.createPastPaper;
  static listPastPapers = MiscAcademicService.listPastPapers;
  static deletePastPaper = MiscAcademicService.deletePastPaper;
  static createSubjectWeighting = MiscAcademicService.createSubjectWeighting;
  static listSubjectWeightings = MiscAcademicService.listSubjectWeightings;
  static updateSubjectWeighting = MiscAcademicService.updateSubjectWeighting;
  static deleteSubjectWeighting = MiscAcademicService.deleteSubjectWeighting;
  static createRemedial = MiscAcademicService.createRemedial;
  static listRemedials = MiscAcademicService.listRemedials;
  static getRemedialById = MiscAcademicService.getRemedialById;
  static updateRemedial = MiscAcademicService.updateRemedial;
  static deleteRemedial = MiscAcademicService.deleteRemedial;
  static getLuritsExport = MiscAcademicService.getLuritsExport;
}

// Also export sub-services for direct import
export { GradeService } from './services/grade.service.js';
export { SubjectService } from './services/subject.service.js';
export { AssessmentService } from './services/assessment.service.js';
export { ExamService } from './services/exam.service.js';
export { MiscAcademicService } from './services/misc.service.js';
