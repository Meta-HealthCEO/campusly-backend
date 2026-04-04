import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { requireParentOwnership } from '../../middleware/parentOwnership.js';
import { AcademicController } from './controller.js';
import {
  gradeSchema,
  updateGradeSchema,
  classSchema,
  updateClassSchema,
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
  remedialCreateSchema,
  remedialUpdateSchema,
} from './validation.js';

const router = Router();

// ─── Grades ──────────────────────────────────────────────────────────────────

router.post(
  '/grades',
  authenticate,
  authorize('super_admin', 'school_admin'),
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
  authorize('super_admin', 'school_admin'),
  validate(updateGradeSchema),
  AcademicController.updateGrade,
);

router.delete(
  '/grades/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AcademicController.deleteGrade,
);

// ─── Classes ─────────────────────────────────────────────────────────────────

router.post(
  '/classes',
  authenticate,
  authorize('super_admin', 'school_admin'),
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
  '/classes/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.getClass,
);

router.put(
  '/classes/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateClassSchema),
  AcademicController.updateClass,
);

router.delete(
  '/classes/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AcademicController.deleteClass,
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
  authorize('super_admin', 'school_admin'),
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
  authorize('super_admin', 'school_admin'),
  validate(updateSubjectSchema),
  AcademicController.updateSubject,
);

router.delete(
  '/subjects/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AcademicController.deleteSubject,
);

// ─── Timetable ───────────────────────────────────────────────────────────────

router.post(
  '/timetable',
  authenticate,
  authorize('super_admin', 'school_admin'),
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
  authorize('super_admin', 'school_admin'),
  validate(updateTimetableSchema),
  AcademicController.updateTimetable,
);

router.delete(
  '/timetable/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AcademicController.deleteTimetable,
);

// ─── Assessments ─────────────────────────────────────────────────────────────

router.post(
  '/assessments',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(assessmentSchema),
  AcademicController.createAssessment,
);

router.get(
  '/assessments',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  AcademicController.listAssessments,
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
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(updateAssessmentSchema),
  AcademicController.updateAssessment,
);

router.delete(
  '/assessments/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
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

router.post('/exams', authenticate, authorize('super_admin', 'school_admin'), validate(examCreateSchema), AcademicController.createExam);
router.get('/exams', authenticate, authorize('super_admin', 'school_admin', 'teacher'), AcademicController.listExams);
router.get('/exams/:id', authenticate, authorize('super_admin', 'school_admin', 'teacher'), AcademicController.getExam);
router.put('/exams/:id', authenticate, authorize('super_admin', 'school_admin'), validate(examUpdateSchema), AcademicController.updateExam);
router.delete('/exams/:id', authenticate, authorize('super_admin', 'school_admin'), AcademicController.deleteExam);

// ─── Exam Timetable ─────────────────────────────────────────────────────────

router.post('/exam-timetable', authenticate, authorize('super_admin', 'school_admin'), validate(examTimetableCreateSchema), AcademicController.createExamTimetable);
router.get('/exam-timetable/exam/:examId', authenticate, authorize('super_admin', 'school_admin', 'teacher', 'parent', 'student'), AcademicController.listExamTimetable);
router.get('/exam-timetable/:id', authenticate, authorize('super_admin', 'school_admin', 'teacher', 'parent', 'student'), AcademicController.getExamTimetable);
router.put('/exam-timetable/:id', authenticate, authorize('super_admin', 'school_admin'), validate(examTimetableUpdateSchema), AcademicController.updateExamTimetable);
router.delete('/exam-timetable/:id', authenticate, authorize('super_admin', 'school_admin'), AcademicController.deleteExamTimetable);

// ─── Past Papers ────────────────────────────────────────────────────────────

router.post('/past-papers', authenticate, authorize('super_admin', 'school_admin', 'teacher'), validate(pastPaperCreateSchema), AcademicController.createPastPaper);
router.get('/past-papers', authenticate, authorize('super_admin', 'school_admin', 'teacher', 'parent', 'student'), AcademicController.listPastPapers);
router.delete('/past-papers/:id', authenticate, authorize('super_admin', 'school_admin'), AcademicController.deletePastPaper);

// ─── Subject Weightings ─────────────────────────────────────────────────────

router.post('/subject-weightings', authenticate, authorize('super_admin', 'school_admin'), validate(subjectWeightingCreateSchema), AcademicController.createSubjectWeighting);
router.get('/subject-weightings', authenticate, authorize('super_admin', 'school_admin', 'teacher'), AcademicController.listSubjectWeightings);
router.put('/subject-weightings/:id', authenticate, authorize('super_admin', 'school_admin'), validate(subjectWeightingUpdateSchema), AcademicController.updateSubjectWeighting);
router.delete('/subject-weightings/:id', authenticate, authorize('super_admin', 'school_admin'), AcademicController.deleteSubjectWeighting);

// ─── Remedial Tracking ──────────────────────────────────────────────────────

router.post('/remedials', authenticate, authorize('super_admin', 'school_admin', 'teacher'), validate(remedialCreateSchema), AcademicController.createRemedial);
router.get('/remedials', authenticate, authorize('super_admin', 'school_admin', 'teacher'), AcademicController.listRemedials);
router.get('/remedials/:id', authenticate, authorize('super_admin', 'school_admin', 'teacher'), AcademicController.getRemedial);
router.put('/remedials/:id', authenticate, authorize('super_admin', 'school_admin', 'teacher'), validate(remedialUpdateSchema), AcademicController.updateRemedial);
router.delete('/remedials/:id', authenticate, authorize('super_admin', 'school_admin'), AcademicController.deleteRemedial);

// ─── Promotion ──────────────────────────────────────────────────────────────

router.get('/promotion/student/:studentId', authenticate, authorize('super_admin', 'school_admin', 'teacher'), AcademicController.calculatePromotion);
router.get('/promotion/grade/:gradeId', authenticate, authorize('super_admin', 'school_admin'), AcademicController.promotionReport);

export default router;
