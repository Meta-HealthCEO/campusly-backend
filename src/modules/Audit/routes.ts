import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/index.js';
import { AuditController } from './controller.js';

const router = Router();

// ─── Audit Logs ─────────────────────────────────────────────────────────────

router.get(
  '/logs',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AuditController.listLogs,
);

router.get(
  '/logs/export',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AuditController.exportLogs,
);

export default router;
