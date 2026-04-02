import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { ConsentController } from './controller.js';
import { ConsentStatsController } from './stats.controller.js';
import { createConsentFormSchema, updateConsentFormSchema, recordConsentResponseSchema } from './validation.js';

const router = Router();

// ─── Consent Form Routes ──────────────────────────────────────────────────────

router.post(
  '/forms',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createConsentFormSchema),
  ConsentController.createForm,
);

router.get(
  '/forms',
  authenticate,
  ConsentController.listForms,
);

router.get(
  '/forms/:id',
  authenticate,
  ConsentController.getForm,
);

router.put(
  '/forms/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateConsentFormSchema),
  ConsentController.updateForm,
);

router.delete(
  '/forms/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  ConsentController.deleteForm,
);

// ─── Consent Form Stats Routes ───────────────────────────────────────────────

router.get(
  '/forms/:id/stats',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  ConsentStatsController.getCompletionStats,
);

router.get(
  '/forms/:id/pending',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  ConsentStatsController.getPendingParents,
);

// ─── Consent Response Routes ──────────────────────────────────────────────────

router.post(
  '/responses',
  authenticate,
  authorize('parent'),
  validate(recordConsentResponseSchema),
  ConsentController.recordResponse,
);

router.get(
  '/responses/form/:formId',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  ConsentController.getResponsesByForm,
);

router.get(
  '/responses/:id/export',
  authenticate,
  authorize('super_admin', 'school_admin'),
  ConsentStatsController.exportSignedForm,
);

router.get(
  '/responses/outstanding/:studentId',
  authenticate,
  ConsentController.getOutstandingConsents,
);

export default router;
