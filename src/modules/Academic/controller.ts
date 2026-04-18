import { GradeController } from './controllers/grade.controller.js';
import { ClassController } from './controllers/class.controller.js';
import { SubjectController } from './controllers/subject.controller.js';
import { TimetableController } from './controllers/timetable.controller.js';
import { MiscController } from './controllers/misc.controller.js';

/**
 * AcademicController — barrel that re-exports all Academic handlers.
 * routes.ts uses `AcademicController.methodName` and needs no changes.
 *
 * Implementation files:
 *   controllers/grade.controller.ts      — Grade CRUD
 *   controllers/class.controller.ts      — Class CRUD + teaching-load
 *   controllers/subject.controller.ts    — Subject CRUD
 *   controllers/timetable.controller.ts  — Timetable CRUD + clash detection
 *   controllers/misc.controller.ts       — Assessment, Marks, LURITS, Exam,
 *                                          ExamTimetable, PastPapers,
 *                                          SubjectWeightings, Remedial, Promotion
 */
export class AcademicController {
  // ─── Grade ─────────────────────────────────────────────────────────────
  static createGrade = GradeController.createGrade;
  static listGrades = GradeController.listGrades;
  static getGrade = GradeController.getGrade;
  static updateGrade = GradeController.updateGrade;
  static deleteGrade = GradeController.deleteGrade;

  // ─── Class ─────────────────────────────────────────────────────────────
  static createClass = ClassController.createClass;
  static listClasses = ClassController.listClasses;
  static getClass = ClassController.getClass;
  static updateClass = ClassController.updateClass;
  static deleteClass = ClassController.deleteClass;
  static getClassJoinCode = ClassController.getClassJoinCode;
  static regenerateClassJoinCode = ClassController.regenerateClassJoinCode;
  static getTeacherTeachingLoad = ClassController.getTeacherTeachingLoad;

  // ─── Subject ───────────────────────────────────────────────────────────
  static createSubject = SubjectController.createSubject;
  static listSubjects = SubjectController.listSubjects;
  static getSubject = SubjectController.getSubject;
  static updateSubject = SubjectController.updateSubject;
  static deleteSubject = SubjectController.deleteSubject;

  // ─── Timetable ─────────────────────────────────────────────────────────
  static createTimetable = TimetableController.createTimetable;
  static listTimetable = TimetableController.listTimetable;
  static getTimetable = TimetableController.getTimetable;
  static getTimetableByClass = TimetableController.getTimetableByClass;
  static getTimetableByTeacher = TimetableController.getTimetableByTeacher;
  static updateTimetable = TimetableController.updateTimetable;
  static deleteTimetable = TimetableController.deleteTimetable;
  static detectTimetableClashes = TimetableController.detectTimetableClashes;

  // ─── Assessment ────────────────────────────────────────────────────────
  static createAssessment = MiscController.createAssessment;
  static listAssessments = MiscController.listAssessments;
  static getAssessment = MiscController.getAssessment;
  static updateAssessment = MiscController.updateAssessment;
  static deleteAssessment = MiscController.deleteAssessment;

  // ─── Marks ─────────────────────────────────────────────────────────────
  static captureMark = MiscController.captureMark;
  static bulkCaptureMarks = MiscController.bulkCaptureMarks;
  static getStudentMarks = MiscController.getStudentMarks;
  static getAssessmentMarks = MiscController.getAssessmentMarks;

  // ─── LURITS ────────────────────────────────────────────────────────────
  static exportLurits = MiscController.exportLurits;

  // ─── Exams ─────────────────────────────────────────────────────────────
  static createExam = MiscController.createExam;
  static listExams = MiscController.listExams;
  static getExam = MiscController.getExam;
  static updateExam = MiscController.updateExam;
  static deleteExam = MiscController.deleteExam;

  // ─── Exam Timetable ────────────────────────────────────────────────────
  static createExamTimetable = MiscController.createExamTimetable;
  static listExamTimetable = MiscController.listExamTimetable;
  static getExamTimetable = MiscController.getExamTimetable;
  static updateExamTimetable = MiscController.updateExamTimetable;
  static deleteExamTimetable = MiscController.deleteExamTimetable;

  // ─── Past Papers ───────────────────────────────────────────────────────
  static createPastPaper = MiscController.createPastPaper;
  static listPastPapers = MiscController.listPastPapers;
  static deletePastPaper = MiscController.deletePastPaper;

  // ─── Subject Weightings ────────────────────────────────────────────────
  static createSubjectWeighting = MiscController.createSubjectWeighting;
  static listSubjectWeightings = MiscController.listSubjectWeightings;
  static updateSubjectWeighting = MiscController.updateSubjectWeighting;
  static deleteSubjectWeighting = MiscController.deleteSubjectWeighting;

  // ─── Remedial ──────────────────────────────────────────────────────────
  static createRemedial = MiscController.createRemedial;
  static listRemedials = MiscController.listRemedials;
  static getRemedial = MiscController.getRemedial;
  static updateRemedial = MiscController.updateRemedial;
  static deleteRemedial = MiscController.deleteRemedial;

  // ─── Promotion ─────────────────────────────────────────────────────────
  static calculatePromotion = MiscController.calculatePromotion;
  static promotionReport = MiscController.promotionReport;
}
