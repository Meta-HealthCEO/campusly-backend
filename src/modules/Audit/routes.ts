import { Router } from 'express';
import { authenticate } from '../../middleware/index.js';
import { requireCapability } from '../../middleware/capability.js';
import { AuditController } from './controller.js';

const router = Router();

// ─── Audit Logs ─────────────────────────────────────────────────────────────

router.get(
  '/logs',
  authenticate,
  requireCapability('view_audit_log'),
  AuditController.listLogs,
);

router.get(
  '/logs/export',
  authenticate,
  requireCapability('view_audit_log'),
  AuditController.exportLogs,
);

export default router;
