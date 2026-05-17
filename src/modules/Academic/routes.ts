import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { requireCapability } from '../../middleware/capability.js';
import { validate } from '../../middleware/validate.js';
import { requireParentOwnership } from '../../middleware/parentOwnership.js';
import { AcademicController } from './controller.js';
import {
  gradeSchema,
  updateGradeSchema,
  classSchema,
  updateClassSchema,
  joinClassByCodeSchema,
  subjectSchema,
  updateSubjectSchema,
  timetableSchema,
  updateTimetableSchema,
  assessmentSchema,
  updateAssessmentSchema,
  markSchema,
  bulkMarkSchema,
  examCreateSchema,
  examUpdateSchema,
  examTimetableCreateSchema,
  examTimetableUpdateSchema,
  pastPaperCreateSchema,
  subjectWeightingCreateSchema,
  subjectWeightingUpdateSchema,
  subjectWeightingBulkSetSchema,
  remedialCreateSchema,
  remedialUpdateSchema,
} from './validation.js';

const router = Router();

// ─── Grades ──────────────────────────────────────────────────────────────────

router.post(
  '/grades',
  authenticate,
  requireCapability('manage_academic_setup'),
  validate(gradeSchema),
  AcademicController.createGrade,
);

router.get(
  '/grades',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'student', 'parent'),
  AcademicController.listGrades,
);

router.get(
  '/grades/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.getGrade,
);

router.put(
  '/grades/:id',
  authenticate,
  requireCapability('manage_academic_setup'),
  validate(updateGradeSchema),
  AcademicController.updateGrade,
);

router.delete(
  '/grades/:id',
  authenticate,
  requireCapability('manage_academic_setup'),
  AcademicController.deleteGrade,
);

// ─── Classes ─────────────────────────────────────────────────────────────────

router.post(
  '/classes',
  authenticate,
  requireCapability('manage_academic_setup'),
  validate(classSchema),
  AcademicController.createClass,
);

router.get(
  '/classes',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'student', 'parent'),
  AcademicController.listClasses,
);

router.get(
  '/teacher/me/teaching-load',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.getTeacherTeachingLoad,
);

router.get(
  '/classes/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.getClass,
);

router.put(
  '/classes/:id',
  authenticate,
  requireCapability('manage_academic_setup'),
  validate(updateClassSchema),
  AcademicController.updateClass,
);

router.delete(
  '/classes/:id',
  authenticate,
  requireCapability('manage_academic_setup'),
  AcademicController.deleteClass,
);

router.post(
  '/classes/join',
  authenticate,
  authorize('student'),
  validate(joinClassByCodeSchema),
  AcademicController.joinClassByCode,
);

router.get(
  '/classes/:id/join-code',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.getClassJoinCode,
);

router.post(
  '/classes/:id/regenerate-code',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.regenerateClassJoinCode,
);

// ─── Subjects ────────────────────────────────────────────────────────────────

router.post(
  '/subjects',
  authenticate,
  requireCapability('manage_academic_setup'),
  validate(subjectSchema),
  AcademicController.createSubject,
);

router.get(
  '/subjects',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'student', 'parent'),
  AcademicController.listSubjects,
);

router.get(
  '/subjects/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.getSubject,
);

router.put(
  '/subjects/:id',
  authenticate,
  requireCapability('manage_academic_setup'),
  validate(updateSubjectSchema),
  AcademicController.updateSubject,
);

router.delete(
  '/subjects/:id',
  authenticate,
  requireCapability('manage_academic_setup'),
  AcademicController.deleteSubject,
);

// ─── Timetable ───────────────────────────────────────────────────────────────

router.post(
  '/timetable',
  authenticate,
  requireCapability('manage_academic_setup'),
  validate(timetableSchema),
  AcademicController.createTimetable,
);

router.get(
  '/timetable',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'parent', 'student'),
  AcademicController.listTimetable,
);

router.get(
  '/timetable/clashes',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.detectTimetableClashes,
);

router.get(
  '/timetable/class/:classId',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'student', 'parent'),
  AcademicController.getTimetableByClass,
);

router.get(
  '/timetable/teacher/:teacherId',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.getTimetableByTeacher,
);

router.get(
  '/timetable/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'parent', 'student'),
  AcademicController.getTimetable,
);

router.put(
  '/timetable/:id',
  authenticate,
  requireCapability('manage_academic_setup'),
  validate(updateTimetableSchema),
  AcademicController.updateTimetable,
);

router.delete(
  '/timetable/:id',
  authenticate,
  requireCapability('manage_academic_setup'),
  AcademicController.deleteTimetable,
);

// ─── Assessments ─────────────────────────────────────────────────────────────

router.post(
  '/assessments',
  authenticate,
  requireCapability('manage_academic_setup'),
  validate(assessmentSchema),
  AcademicController.createAssessment,
);

router.get(
  '/assessments',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.listAssessments,
);

// Term Summary — class × subject roll-up for a term. Static path sits above
// /assessments/:id so the param doesn't swallow it.
router.get(
  '/term-summary',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.getTermSummary,
);

// Subject trend — term-by-term cohort averages for a single class+subject.
router.get(
  '/subject-trend',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.getSubjectTrend,
);

// Student term detail — every mark for one student in a given term, grouped
// by subject. Drives the gradebook drilldown panel.
router.get(
  '/students/:studentId/term-detail',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.getStudentTermDetail,
);

router.get(
  '/assessments/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.getAssessment,
);

router.put(
  '/assessments/:id',
  authenticate,
  requireCapability('manage_academic_setup'),
  validate(updateAssessmentSchema),
  AcademicController.updateAssessment,
);

router.delete(
  '/assessments/:id',
  authenticate,
  requireCapability('manage_academic_setup'),
  AcademicController.deleteAssessment,
);

// ─── Marks ───────────────────────────────────────────────────────────────────

router.post(
  '/marks',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(markSchema),
  AcademicController.captureMark,
);

router.post(
  '/marks/bulk-capture',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(bulkMarkSchema),
  AcademicController.bulkCaptureMarks,
);

router.get(
  '/marks/student/:studentId',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'parent', 'student'),
  requireParentOwnership('studentId'),
  AcademicController.getStudentMarks,
);

router.get(
  '/marks/assessment/:assessmentId',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.getAssessmentMarks,
);

// ─── LURITS Export ──────────────────────────────────────────────────────────

router.get(
  '/lurits-export',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AcademicController.exportLurits,
);

// ─── Exams ──────────────────────────────────────────────────────────────────

router.post('/exams', authenticate, requireCapability('manage_academic_setup'), validate(examCreateSchema), AcademicController.createExam);
router.get('/exams', authenticate, authorize('super_admin', 'school_admin', 'teacher'), AcademicController.listExams);
router.get('/exams/:id', authenticate, authorize('super_admin', 'school_admin', 'teacher'), AcademicController.getExam);
router.put('/exams/:id', authenticate, requireCapability('manage_academic_setup'), validate(examUpdateSchema), AcademicController.updateExam);
router.delete('/exams/:id', authenticate, requireCapability('manage_academic_setup'), AcademicController.deleteExam);

// ─── Exam Timetable ─────────────────────────────────────────────────────────

router.post('/exam-timetable', authenticate, requireCapability('manage_academic_setup'), validate(examTimetableCreateSchema), AcademicController.createExamTimetable);
router.get('/exam-timetable/exam/:examId', authenticate, authorize('super_admin', 'school_admin', 'teacher', 'parent', 'student'), AcademicController.listExamTimetable);
router.get('/exam-timetable/:id', authenticate, authorize('super_admin', 'school_admin', 'teacher', 'parent', 'student'), AcademicController.getExamTimetable);
router.put('/exam-timetable/:id', authenticate, requireCapability('manage_academic_setup'), validate(examTimetableUpdateSchema), AcademicController.updateExamTimetable);
router.delete('/exam-timetable/:id', authenticate, requireCapability('manage_academic_setup'), AcademicController.deleteExamTimetable);

// ─── Past Papers ────────────────────────────────────────────────────────────

router.post('/past-papers', authenticate, requireCapability('manage_academic_setup'), validate(pastPaperCreateSchema), AcademicController.createPastPaper);
router.get('/past-papers', authenticate, authorize('super_admin', 'school_admin', 'teacher', 'parent', 'student'), AcademicController.listPastPapers);
router.delete('/past-papers/:id', authenticate, requireCapability('manage_academic_setup'), AcademicController.deletePastPaper);

// ─── Subject Weightings ─────────────────────────────────────────────────────
//
// /subject-weightings/matrix is the gradebook bulk path: GET pulls the
// 4-term × 5-type config for one (subject, grade); PUT atomically replaces
// every bucket in a single term (sum-to-100 enforced server-side). The
// per-row CRUD endpoints below are kept for legacy/admin scripts but
// nothing in the app touches them — prefer the matrix path.

router.get(
  '/subject-weightings/matrix',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.getSubjectWeightingMatrix,
);

router.put(
  '/subject-weightings/matrix',
  authenticate,
  requireCapability('manage_academic_setup'),
  validate(subjectWeightingBulkSetSchema),
  AcademicController.setSubjectWeightingTermBuckets,
);

router.post('/subject-weightings', authenticate, requireCapability('manage_academic_setup'), validate(subjectWeightingCreateSchema), AcademicController.createSubjectWeighting);
router.get('/subject-weightings', authenticate, authorize('super_admin', 'school_admin', 'teacher'), AcademicController.listSubjectWeightings);
router.put('/subject-weightings/:id', authenticate, requireCapability('manage_academic_setup'), validate(subjectWeightingUpdateSchema), AcademicController.updateSubjectWeighting);
router.delete('/subject-weightings/:id', authenticate, requireCapability('manage_academic_setup'), AcademicController.deleteSubjectWeighting);

// ─── Remedial Tracking ──────────────────────────────────────────────────────

router.post('/remedials', authenticate, requireCapability('manage_academic_setup'), validate(remedialCreateSchema), AcademicController.createRemedial);
router.get('/remedials', authenticate, authorize('super_admin', 'school_admin', 'teacher'), AcademicController.listRemedials);
router.get('/remedials/:id', authenticate, authorize('super_admin', 'school_admin', 'teacher'), AcademicController.getRemedial);
router.put('/remedials/:id', authenticate, requireCapability('manage_academic_setup'), validate(remedialUpdateSchema), AcademicController.updateRemedial);
router.delete('/remedials/:id', authenticate, requireCapability('manage_academic_setup'), AcademicController.deleteRemedial);

// ─── Promotion ──────────────────────────────────────────────────────────────

router.get('/promotion/student/:studentId', authenticate, authorize('super_admin', 'school_admin', 'teacher'), AcademicController.calculatePromotion);
router.get('/promotion/grade/:gradeId', authenticate, authorize('super_admin', 'school_admin'), AcademicController.promotionReport);

export default router;
