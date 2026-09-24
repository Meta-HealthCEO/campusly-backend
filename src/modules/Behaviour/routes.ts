import { Router } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { BehaviourController } from './controller.js';
import { classBehaviourQuerySchema, logBehaviourSchema, schoolBehaviourQuerySchema } from './validation.js';

// One behaviour log. Staff only: learners and parents never list behaviour here.
const STAFF = ['teacher', 'school_admin', 'super_admin'] as const;
const router = Router();

router.post('/', authorize(...STAFF), validate(logBehaviourSchema), BehaviourController.log);
router.get('/', authorize(...STAFF), validate({ query: classBehaviourQuerySchema }), BehaviourController.forClass);
router.get('/school', authorize(...STAFF), validate({ query: schoolBehaviourQuerySchema }), BehaviourController.forSchool);
router.get('/student/:studentId', authorize(...STAFF), BehaviourController.forLearner);
router.delete('/:id', authorize(...STAFF), BehaviourController.undo);

export default router;
