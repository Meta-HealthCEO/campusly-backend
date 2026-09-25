// src/modules/Readiness/routes.ts
//
// /api/readiness (spec §6). Mounted behind `authenticate`; every route names its roles; no capability keys (ruling RP14).
// This run carries the super-admin blueprint routes only; Task 10 adds the learner routes, Task 12 the teacher routes.
import { Router } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { AdminController } from './controller-admin.js';
import { blueprintListQuery, copyBody, idParams, publishBody, verificationBody } from './validation.js';

const router = Router();
const superAdmin = authorize('super_admin');
router.get('/blueprints', superAdmin, validate({ query: blueprintListQuery }), AdminController.list);
router.post('/blueprints/validate', superAdmin, AdminController.validate);
router.post('/blueprints/import', superAdmin, AdminController.import);
router.get('/blueprints/:id', superAdmin, validate({ params: idParams }), AdminController.one);
router.patch('/blueprints/:id', superAdmin, validate({ params: idParams, body: verificationBody }), AdminController.patch);
router.post('/blueprints/:id/publish', superAdmin, validate({ params: idParams, body: publishBody }), AdminController.publish);
router.post('/blueprints/:id/copy', superAdmin, validate({ params: idParams, body: copyBody }), AdminController.copy);

export default router;
