import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { LessonController } from './controller.js';
import { refuseStandalone } from '../../middleware/refuse-standalone.js';

const router = Router();

router.use(authenticate, authorize('teacher', 'school_admin', 'super_admin'));

router.get('/', LessonController.list);
router.get('/recent-topics', LessonController.recentTopics);
// The lesson-plan tool is not part of the standalone teacher portal; its AI
// routes refuse standalone teachers so they can't bypass the AI allowance.
const notStandalone = refuseStandalone();

router.post('/scaffold', notStandalone, LessonController.scaffold);
router.post('/', LessonController.create);
router.get('/:id', LessonController.getById);
router.put('/:id', LessonController.update);
router.post('/:id/publish', LessonController.publish);
router.post('/:id/unpublish', LessonController.unpublish);
router.delete('/:id', LessonController.delete);
router.post('/:id/clone', LessonController.clone);

router.post('/:id/materials', notStandalone, LessonController.addMaterial);
router.post('/:id/materials/generate-all', notStandalone, LessonController.generateAllPlaceholders);
router.patch('/:id/materials/:mid', LessonController.updateMaterial);
router.patch('/:id/materials/:mid/move', LessonController.moveMaterial);
router.post('/:id/materials/:mid/regenerate', notStandalone, LessonController.regenerateMaterial);
router.delete('/:id/materials/:mid', LessonController.deleteMaterial);

router.post('/:id/assignments', LessonController.assignClass);
router.patch('/:id/assignments/:classId', LessonController.updateAssignment);
router.delete('/:id/assignments/:classId', LessonController.unassignClass);

router.get('/:id/export/teacher', LessonController.exportTeacher);
router.get('/:id/export/student', LessonController.exportStudent);
router.get('/:id/export/slides', LessonController.exportSlides);

router.post('/:id/chat', notStandalone, LessonController.chat);

export default router;
