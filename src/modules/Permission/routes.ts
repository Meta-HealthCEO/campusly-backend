import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { PermissionController } from './controller.js';
import {
  listPermissionsSchema,
  updatePermissionsSchema,
  permissionAuditQuerySchema,
} from './validation.js';

const router = Router();

// ─── List school permissions ─────────────────────────────────────────────────

router.get(
  '/school/:schoolId',
  authorize('super_admin', 'school_admin'),
  validate({ query: listPermissionsSchema }),
  PermissionController.listSchoolPermissions,
);

// ─── Get single user permissions ─────────────────────────────────────────────

router.get(
  '/:userId',
  authorize('super_admin', 'school_admin'),
  PermissionController.getUserPermissions,
);

// ─── Update user permissions ─────────────────────────────────────────────────

router.put(
  '/:userId',
  authorize('super_admin', 'school_admin'),
  validate({ body: updatePermissionsSchema }),
  PermissionController.updateUserPermissions,
);

// ─── Permission audit logs ───────────────────────────────────────────────────

router.get(
  '/audit/:schoolId',
  authorize('super_admin', 'school_admin'),
  validate({ query: permissionAuditQuerySchema }),
  PermissionController.getAuditLogs,
);

export default router;
