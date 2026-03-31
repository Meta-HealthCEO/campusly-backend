import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { StaffController } from './controller.js';

const router = Router();

router.get('/', authenticate, authorize('super_admin', 'school_admin'), StaffController.list);
router.post('/', authenticate, authorize('super_admin', 'school_admin'), StaffController.create);

export default router;
