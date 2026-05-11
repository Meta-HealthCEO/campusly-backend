import { Router } from 'express';
import { TeacherSettingsController } from './controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/teaching-scope', TeacherSettingsController.getTeachingScope);
router.put('/teaching-scope', TeacherSettingsController.updateTeachingScope);

export default router;
