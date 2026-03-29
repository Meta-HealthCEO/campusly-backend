import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { FundraisingController } from './controller.js';
import {
  createCampaignSchema,
  updateCampaignSchema,
  createDonationSchema,
} from './validation.js';

const router = Router();

// ─── Campaign Routes ────────────────────────────────────────────────────────

router.post(
  '/campaigns',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createCampaignSchema),
  FundraisingController.createCampaign,
);

router.get(
  '/campaigns',
  authenticate,
  FundraisingController.listCampaigns,
);

router.get(
  '/campaigns/:id',
  authenticate,
  FundraisingController.getCampaign,
);

router.put(
  '/campaigns/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateCampaignSchema),
  FundraisingController.updateCampaign,
);

router.delete(
  '/campaigns/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FundraisingController.deleteCampaign,
);

// ─── Donation Routes ────────────────────────────────────────────────────────

router.post(
  '/donations',
  authenticate,
  validate(createDonationSchema),
  FundraisingController.recordDonation,
);

router.get(
  '/donations',
  authenticate,
  FundraisingController.listDonations,
);

router.get(
  '/donations/:id',
  authenticate,
  FundraisingController.getDonation,
);

router.delete(
  '/donations/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FundraisingController.deleteDonation,
);

export default router;
