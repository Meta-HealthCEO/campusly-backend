import { Router } from 'express';
import { authenticate, authorize, validate, requireParentOwnership, requireParentWalletOwnership } from '../../middleware/index.js';
import { WalletController } from './controller.js';
import {
  createWalletSchema,
  loadMoneySchema,
  deductMoneySchema,
  linkWristbandSchema,
  updateDailyLimitSchema,
} from './validation.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  validate(createWalletSchema),
  WalletController.createWallet,
);

router.get(
  '/student/:studentId',
  authenticate,
  requireParentOwnership('studentId'),
  WalletController.getWallet,
);

router.post(
  '/:walletId/load',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  requireParentWalletOwnership('walletId'),
  validate(loadMoneySchema),
  WalletController.loadMoney,
);

router.post(
  '/:walletId/deduct',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(deductMoneySchema),
  WalletController.deductMoney,
);

router.get(
  '/:walletId/transactions',
  authenticate,
  requireParentWalletOwnership('walletId'),
  WalletController.getTransactions,
);

router.post(
  '/wristband/link',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(linkWristbandSchema),
  WalletController.linkWristband,
);

router.post(
  '/wristband/:wristbandId/unlink',
  authenticate,
  authorize('super_admin', 'school_admin'),
  WalletController.unlinkWristband,
);

router.patch(
  '/:walletId/daily-limit',
  authenticate,
  authorize('super_admin', 'school_admin', 'parent'),
  requireParentWalletOwnership('walletId'),
  validate(updateDailyLimitSchema),
  WalletController.updateDailyLimit,
);

export default router;
