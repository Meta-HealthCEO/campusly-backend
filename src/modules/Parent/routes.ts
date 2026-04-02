import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { ParentController } from './controller.js';
import {
  createParentSchema,
  updateParentSchema,
  linkChildSchema,
} from './validation.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createParentSchema),
  ParentController.create,
);

router.get(
  '/',
  authenticate,
  authorize('super_admin', 'school_admin'),
  ParentController.list,
);

router.get(
  '/me',
  authenticate,
  authorize('parent', 'super_admin', 'school_admin'),
  ParentController.getMe,
);

router.get(
  '/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  ParentController.getById,
);

router.put(
  '/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateParentSchema),
  ParentController.update,
);

router.delete(
  '/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  ParentController.delete,
);

router.post(
  '/:id/link-child',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(linkChildSchema),
  ParentController.linkChild,
);

router.post(
  '/:id/unlink-child',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(linkChildSchema),
  ParentController.unlinkChild,
);

export default router;
