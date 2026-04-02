import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize, validate, requireParentOwnership } from '../../middleware/index.js';
import { CareerController } from './controller.js';
import {
  addExtracurricularSchema,
  addCommunityServiceSchema,
  createSnapshotSchema,
  apsSimulateSchema,
  createUniversitySchema,
  updateUniversitySchema,
  createProgrammeSchema,
  updateProgrammeSchema,
  createApplicationSchema,
  updateApplicationSchema,
  submitAptitudeSchema,
  createBursarySchema,
  updateBursarySchema,
  addDocumentSchema,
} from './validation.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ─── Portfolio ─────────────────────────────────────────────────────────────

router.get(
  '/portfolio/student/:studentId',
  authenticate,
  authorize('student', 'parent', 'teacher', 'school_admin'),
  requireParentOwnership('studentId'),
  CareerController.getPortfolio,
);

router.post(
  '/portfolio/student/:studentId/snapshot',
  authenticate,
  authorize('school_admin'),
  validate(createSnapshotSchema),
  CareerController.createSnapshot,
);

router.post(
  '/portfolio/student/:studentId/extracurricular',
  authenticate,
  authorize('student', 'teacher', 'school_admin'),
  validate(addExtracurricularSchema),
  CareerController.addExtracurricular,
);

router.post(
  '/portfolio/student/:studentId/community-service',
  authenticate,
  authorize('student', 'teacher', 'school_admin'),
  validate(addCommunityServiceSchema),
  CareerController.addCommunityService,
);

router.get(
  '/portfolio/student/:studentId/transcript',
  authenticate,
  authorize('student', 'parent', 'school_admin'),
  requireParentOwnership('studentId'),
  CareerController.getTranscript,
);

// ─── APS ───────────────────────────────────────────────────────────────────

router.get(
  '/aps/student/:studentId',
  authenticate,
  authorize('student', 'parent', 'teacher', 'school_admin'),
  requireParentOwnership('studentId'),
  CareerController.getAPS,
);

router.post(
  '/aps/student/:studentId/simulate',
  authenticate,
  authorize('student', 'parent'),
  requireParentOwnership('studentId'),
  validate(apsSimulateSchema),
  CareerController.simulateAPS,
);

// ─── Universities ──────────────────────────────────────────────────────────

router.get(
  '/universities',
  authenticate,
  CareerController.listUniversities,
);

router.get(
  '/universities/:id',
  authenticate,
  CareerController.getUniversity,
);

router.post(
  '/universities',
  authenticate,
  authorize('school_admin'),
  validate(createUniversitySchema),
  CareerController.createUniversity,
);

router.put(
  '/universities/:id',
  authenticate,
  authorize('school_admin'),
  validate(updateUniversitySchema),
  CareerController.updateUniversity,
);

// ─── Programmes ────────────────────────────────────────────────────────────

router.get(
  '/programmes',
  authenticate,
  CareerController.listProgrammes,
);

router.post(
  '/programmes',
  authenticate,
  authorize('school_admin'),
  validate(createProgrammeSchema),
  CareerController.createProgramme,
);

router.post(
  '/programmes/import',
  authenticate,
  authorize('super_admin'),
  upload.single('file'),
  CareerController.importProgrammes,
);

router.get(
  '/programmes/:id',
  authenticate,
  CareerController.getProgramme,
);

router.put(
  '/programmes/:id',
  authenticate,
  authorize('school_admin'),
  validate(updateProgrammeSchema),
  CareerController.updateProgramme,
);

// ─── Matcher ───────────────────────────────────────────────────────────────

router.get(
  '/match/student/:studentId',
  authenticate,
  authorize('student', 'parent', 'teacher', 'school_admin'),
  requireParentOwnership('studentId'),
  CareerController.matchProgrammes,
);

// ─── Applications ──────────────────────────────────────────────────────────

router.post(
  '/applications',
  authenticate,
  authorize('student'),
  validate(createApplicationSchema),
  CareerController.createApplication,
);

router.get(
  '/applications/student/:studentId',
  authenticate,
  authorize('student', 'parent', 'teacher', 'school_admin'),
  requireParentOwnership('studentId'),
  CareerController.listApplications,
);

router.patch(
  '/applications/:id',
  authenticate,
  authorize('student', 'school_admin'),
  validate(updateApplicationSchema),
  CareerController.updateApplication,
);

router.post(
  '/applications/:id/documents',
  authenticate,
  authorize('student'),
  upload.single('file'),
  validate(addDocumentSchema),
  CareerController.addDocument,
);

router.get(
  '/applications/:id/prefill',
  authenticate,
  authorize('student'),
  CareerController.getApplicationPrefill,
);

router.get(
  '/deadlines/student/:studentId',
  authenticate,
  authorize('student', 'parent'),
  requireParentOwnership('studentId'),
  CareerController.getDeadlines,
);

// ─── Aptitude ──────────────────────────────────────────────────────────────

router.get(
  '/aptitude/questions',
  authenticate,
  authorize('student'),
  CareerController.getAptitudeQuestions,
);

router.post(
  '/aptitude/submit',
  authenticate,
  authorize('student'),
  validate(submitAptitudeSchema),
  CareerController.submitAptitude,
);

router.get(
  '/aptitude/student/:studentId/results',
  authenticate,
  authorize('student', 'parent', 'teacher', 'school_admin'),
  requireParentOwnership('studentId'),
  CareerController.getAptitudeResults,
);

// ─── Career Explorer ───────────────────────────────────────────────────────

router.get(
  '/explorer',
  authenticate,
  CareerController.listCareers,
);

// ─── Subject Advisor ───────────────────────────────────────────────────────

router.get(
  '/subject-advisor/student/:studentId',
  authenticate,
  authorize('student', 'parent', 'teacher'),
  requireParentOwnership('studentId'),
  CareerController.getSubjectAdvice,
);

// ─── Bursaries ─────────────────────────────────────────────────────────────
// NOTE: /bursaries/match/... must come before /bursaries/:id to avoid
// "match" being captured as an :id parameter.

router.get(
  '/bursaries',
  authenticate,
  CareerController.listBursaries,
);

router.get(
  '/bursaries/match/student/:studentId',
  authenticate,
  authorize('student', 'parent'),
  requireParentOwnership('studentId'),
  CareerController.matchBursaries,
);

router.post(
  '/bursaries',
  authenticate,
  authorize('school_admin'),
  validate(createBursarySchema),
  CareerController.createBursary,
);

router.post(
  '/bursaries/import',
  authenticate,
  authorize('super_admin'),
  upload.single('file'),
  CareerController.importBursaries,
);

router.get(
  '/bursaries/:id',
  authenticate,
  CareerController.getBursary,
);

router.put(
  '/bursaries/:id',
  authenticate,
  authorize('school_admin'),
  validate(updateBursarySchema),
  CareerController.updateBursary,
);

export default router;
