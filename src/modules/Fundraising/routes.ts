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
  generateTaxCertificateSchema,
  addDonorWallSchema,
  createRecurringDonationSchema,
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

router.get(
  '/raffles',
  authenticate,
  FundraisingController.listRaffles,
);

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

// ─── Campaign Progress Route ──────────────────────────────────────────────

router.get(
  '/campaigns/:campaignId/progress',
  authenticate,
  FundraisingController.getCampaignProgress,
);

// ─── Tax Certificate Routes ───────────────────────────────────────────────

router.post(
  '/tax-certificates',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(generateTaxCertificateSchema),
  FundraisingController.generateTaxCertificate,
);

router.get(
  '/tax-certificates',
  authenticate,
  FundraisingController.listTaxCertificates,
);

router.get(
  '/tax-certificates/:id',
  authenticate,
  FundraisingController.getTaxCertificate,
);

// ─── Donor Wall Routes ────────────────────────────────────────────────────

router.post(
  '/donor-wall',
  authenticate,
  validate(addDonorWallSchema),
  FundraisingController.addDonorWallEntry,
);

router.get(
  '/campaigns/:campaignId/donor-wall',
  authenticate,
  FundraisingController.listDonorWall,
);

// ─── Recurring Donation Routes ────────────────────────────────────────────

router.post(
  '/recurring-donations',
  authenticate,
  validate(createRecurringDonationSchema),
  FundraisingController.createRecurringDonation,
);

router.get(
  '/recurring-donations',
  authenticate,
  FundraisingController.listRecurringDonations,
);

router.get(
  '/recurring-donations/:id',
  authenticate,
  FundraisingController.getRecurringDonation,
);

router.patch(
  '/recurring-donations/:id/cancel',
  authenticate,
  FundraisingController.cancelRecurringDonation,
);

router.post(
  '/recurring-donations/process',
  authenticate,
  authorize('super_admin'),
  FundraisingController.processRecurringDonations,
);

export default router;
