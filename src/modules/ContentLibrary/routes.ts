import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { requireCapability } from '../../middleware/capability.js';
import { ContentLibraryController } from './controller.js';
import {
  createResourceSchema,
  updateResourceSchema,
  reviewResourceSchema,
  generateContentSchema,
  refineResourceSchema,
  resourceQuerySchema,
} from './validation.js';

const router = Router();

const ADMIN_ROLES = ['super_admin', 'school_admin', 'principal'] as const;
const HOD_ROLES = ['super_admin', 'school_admin', 'principal', 'hod'] as const;
const READ_ROLES = ['super_admin', 'school_admin', 'principal', 'hod', 'teacher'] as const;

// ─── AI Generation (BEFORE :id to avoid route shadowing) ────────────────────

router.post(
  '/resources/generate',
  authorize(...READ_ROLES),
  validate(generateContentSchema),
  ContentLibraryController.generateContent,
);

// ─── Grade Attempt ──────────────────────────────────────────────────────────
// AI-graded short-answer / quiz response. Routed under the content library
// because that's where the block schemas live. Available to teachers (for
// preview / QA) and students (for real attempts).

router.post(
  '/grade-attempt',
  authorize('super_admin', 'school_admin', 'principal', 'hod', 'teacher', 'student'),
  ContentLibraryController.gradeAttempt,
);

// ─── CRUD ───────────────────────────────────────────────────────────────────

router.get(
  '/resources',
  authorize(...READ_ROLES),
  validate({ query: resourceQuerySchema }),
  ContentLibraryController.listResources,
);

router.get(
  '/resources/:id',
  authorize(...READ_ROLES),
  ContentLibraryController.getResource,
);

router.post(
  '/resources',
  authorize(...READ_ROLES),
  validate(createResourceSchema),
  ContentLibraryController.createResource,
);

router.put(
  '/resources/:id',
  authorize(...READ_ROLES),
  validate(updateResourceSchema),
  ContentLibraryController.updateResource,
);

router.delete(
  '/resources/:id',
  authorize(...READ_ROLES),
  ContentLibraryController.deleteResource,
);

// ─── AI Refinement ─────────────────────────────────────────────────────────

router.post(
  '/resources/:id/refine',
  authorize(...READ_ROLES),
  validate(refineResourceSchema),
  ContentLibraryController.refineResource,
);

// ─── Review Workflow ────────────────────────────────────────────────────────

router.patch(
  '/resources/:id/submit',
  authorize(...READ_ROLES),
  ContentLibraryController.submitForReview,
);

router.patch(
  '/resources/:id/review',
  requireCapability('manage_academic_setup'),
  validate(reviewResourceSchema),
  ContentLibraryController.reviewResource,
);

export default router;
