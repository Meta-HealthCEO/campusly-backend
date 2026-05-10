import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { LessonController } from './controller.js';

const router = Router();

router.use(authenticate, authorize('teacher', 'school_admin', 'super_admin'));

router.get('/', LessonController.list);
router.post('/scaffold', LessonController.scaffold);
router.post('/', LessonController.create);
router.get('/:id', LessonController.getById);
router.put('/:id', LessonController.update);
router.patch('/:id/status', LessonController.patchStatus);
router.delete('/:id', LessonController.delete);

router.post('/:id/materials', LessonController.addMaterial);
router.patch('/:id/materials/:mid', LessonController.updateMaterial);
router.patch('/:id/materials/:mid/move', LessonController.moveMaterial);
router.post('/:id/materials/:mid/regenerate', LessonController.regenerateMaterial);
router.delete('/:id/materials/:mid', LessonController.deleteMaterial);

router.get('/:id/export/teacher', LessonController.exportTeacher);
router.get('/:id/export/student', LessonController.exportStudent);

export default router;
