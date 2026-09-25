// src/modules/Evidence/routes.ts
//
// /api/evidence (Phase E §7). Mounted behind `authenticate`; every route names
// its roles. No capability keys (plan ruling P6).
import { Router } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { TaxonomyController } from './controller-taxonomy.js';
import { idParams, mergeTypeBody, renameTypeBody, retireTypeBody, taxonomyListQuery } from './validation.js';

const router = Router();
const superAdmin = authorize('super_admin');

router.get('/taxonomy', superAdmin, validate({ query: taxonomyListQuery }), TaxonomyController.list);
router.patch('/taxonomy/:id', superAdmin, validate({ params: idParams, body: renameTypeBody }), TaxonomyController.rename);
router.post('/taxonomy/:id/approve', superAdmin, validate({ params: idParams }), TaxonomyController.approve);
router.post('/taxonomy/:id/merge', superAdmin, validate({ params: idParams, body: mergeTypeBody }), TaxonomyController.merge);
router.post('/taxonomy/:id/retire', superAdmin, validate({ params: idParams, body: retireTypeBody }), TaxonomyController.retire);

export default router;
