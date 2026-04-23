import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { requireCapability } from '../../middleware/capability.js';
import { validate } from '../../middleware/validate.js';
import { StaffController } from './controller.js';
import { createStaffSchema } from './validation.js';

const router = Router();

router.get('/', authenticate, authorize('super_admin', 'school_admin'), StaffController.list);
router.post('/', authenticate, requireCapability('manage_users'), validate(createStaffSchema), StaffController.create);

export default router;
