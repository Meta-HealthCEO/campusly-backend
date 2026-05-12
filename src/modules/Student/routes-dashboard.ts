import { Router } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { StudentDashboardController } from './controller-dashboard.js';

const router = Router();

router.use(authorize('student'));

router.get('/', StudentDashboardController.get);

export default router;
