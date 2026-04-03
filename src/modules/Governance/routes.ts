import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { GovernanceController } from './controller.js';
import {
  createSIPPlanSchema,
  updateSIPPlanSchema,
  createSIPGoalSchema,
  updateSIPGoalSchema,
  addEvidenceSchema,
  addReviewSchema,
  createPolicySchema,
  updatePolicySchema,
  sipQuerySchema,
  policyQuerySchema,
} from './validation.js';

const router = Router();

const WRITE_ROLES = ['super_admin', 'school_admin', 'principal'] as const;
const READ_ROLES = ['super_admin', 'school_admin', 'principal', 'teacher'] as const;

// ─── SIP Dashboard ──────────────────────────────────────────────────────────

router.get(
  '/sip/dashboard',
  authorize(...READ_ROLES),
  GovernanceController.getDashboard,
);

// ─── SIP Plans ──────────────────────────────────────────────────────────────

router.post(
  '/sip',
  authorize(...WRITE_ROLES),
  validate(createSIPPlanSchema),
  GovernanceController.createPlan,
);

router.get(
  '/sip',
  authorize(...READ_ROLES),
  validate({ query: sipQuerySchema }),
  GovernanceController.listPlans,
);

router.get(
  '/sip/:id',
  authorize(...READ_ROLES),
  GovernanceController.getPlan,
);

router.put(
  '/sip/:id',
  authorize(...WRITE_ROLES),
  validate(updateSIPPlanSchema),
  GovernanceController.updatePlan,
);

router.delete(
  '/sip/:id',
  authorize(...WRITE_ROLES),
  GovernanceController.deletePlan,
);

// ─── SIP Goals ──────────────────────────────────────────────────────────────

router.post(
  '/sip/:id/goals',
  authorize(...WRITE_ROLES),
  validate(createSIPGoalSchema),
  GovernanceController.createGoal,
);

router.put(
  '/sip/goals/:id',
  authorize(...WRITE_ROLES),
  validate(updateSIPGoalSchema),
  GovernanceController.updateGoal,
);

// ─── SIP Evidence ───────────────────────────────────────────────────────────

router.post(
  '/sip/goals/:id/evidence',
  authorize(...READ_ROLES),
  validate(addEvidenceSchema),
  GovernanceController.addEvidence,
);

router.get(
  '/sip/goals/:id/evidence',
  authorize(...READ_ROLES),
  GovernanceController.listEvidence,
);

// ─── SIP Reviews ────────────────────────────────────────────────────────────

router.post(
  '/sip/goals/:id/reviews',
  authorize(...WRITE_ROLES),
  validate(addReviewSchema),
  GovernanceController.addReview,
);

router.get(
  '/sip/goals/:id/reviews',
  authorize(...READ_ROLES),
  GovernanceController.listReviews,
);

// ─── Policies ───────────────────────────────────────────────────────────────

router.post(
  '/policies',
  authorize(...WRITE_ROLES),
  validate(createPolicySchema),
  GovernanceController.createPolicy,
);

router.get(
  '/policies',
  authorize(...READ_ROLES),
  validate({ query: policyQuerySchema }),
  GovernanceController.listPolicies,
);

router.get(
  '/policies/pending-acknowledgements',
  authorize(...READ_ROLES),
  GovernanceController.getPendingAcknowledgements,
);

router.get(
  '/policies/:id',
  authorize(...READ_ROLES),
  GovernanceController.getPolicy,
);

router.put(
  '/policies/:id',
  authorize(...WRITE_ROLES),
  validate(updatePolicySchema),
  GovernanceController.updatePolicy,
);

router.delete(
  '/policies/:id',
  authorize(...WRITE_ROLES),
  GovernanceController.deletePolicy,
);

// ─── Acknowledgements ───────────────────────────────────────────────────────

router.post(
  '/policies/:id/acknowledge',
  authorize(...READ_ROLES),
  GovernanceController.acknowledgePolicy,
);

router.get(
  '/policies/:id/acknowledgements',
  authorize(...WRITE_ROLES),
  GovernanceController.getAcknowledgements,
);

export default router;
