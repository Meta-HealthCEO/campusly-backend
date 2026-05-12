import { Router } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { StudentLessonController } from './controller-student.js';

const router = Router();

router.use(authorize('student'));

router.get('/', StudentLessonController.list);
router.get('/:id', StudentLessonController.getById);

export default router;
