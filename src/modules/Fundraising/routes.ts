import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { FundraisingController } from './controller.js';
import {
  createCampaignSchema,
  updateCampaignSchema,
  createDonationSchema,
  createRaffleSchema,
  buyRaffleTicketsSchema,
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

// ─── Raffle Routes ─────────────────────────────────────────────────────────

router.post(
  '/raffles',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createRaffleSchema),
  FundraisingController.createRaffle,
);

router.post(
  '/raffles/buy-tickets',
  authenticate,
  validate(buyRaffleTicketsSchema),
  FundraisingController.buyTickets,
);

router.post(
  '/raffles/:id/draw',
  authenticate,
  authorize('super_admin', 'school_admin'),
  FundraisingController.drawWinners,
);

router.get(
  '/raffles/tickets/parent/:parentId',
  authenticate,
  FundraisingController.getTicketsByParent,
);

export default router;
