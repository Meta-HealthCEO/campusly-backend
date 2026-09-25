// src/modules/Evidence/routes.ts
//
// /api/evidence (Phase E §7). Mounted behind `authenticate`; every route names
// its roles. No capability keys (plan ruling P6).
import { Router } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { TaxonomyController } from './controller-taxonomy.js';
import { ReasonsController } from './controller.js';
import { SummaryController } from './controller-summary.js';
import { STAFF_ROLES } from './access.js';
import {
  classMisconceptionsQuery, classParams, idParams, mergeTypeBody, reasonsQuery, renameTypeBody, retireTypeBody, rowsQuery,
  studentParams, taxonomyListQuery, topicsQuery,
} from './validation.js';

const router = Router();
const superAdmin = authorize('super_admin');
const staff = authorize(...STAFF_ROLES);

router.get('/reasons', authorize(...STAFF_ROLES, 'student'), validate({ query: reasonsQuery }), ReasonsController.reasons);
router.post('/rows/:id/dismiss', staff, validate({ params: idParams }), ReasonsController.dismiss);
router.post('/rows/:id/restore', staff, validate({ params: idParams }), ReasonsController.restore);
router.get('/class-misconceptions', staff, validate({ query: classMisconceptionsQuery }), ReasonsController.classMisconceptions);

// The evidence summary contract for Phase R (spec §7.2).
const learner = authorize('student');
router.get('/learners/:studentId/topics', staff, validate({ params: studentParams, query: topicsQuery }), SummaryController.learnerTopics);
router.get('/me/topics', learner, validate({ query: topicsQuery }), SummaryController.myTopics);
router.get('/classes/:classId/topics', staff, validate({ params: classParams, query: topicsQuery }), SummaryController.classTopics);
router.get('/learners/:studentId/rows', staff, validate({ params: studentParams, query: rowsQuery }), SummaryController.learnerRows);
router.get('/me/rows', learner, validate({ query: rowsQuery }), SummaryController.myRows);

router.get('/taxonomy', superAdmin, validate({ query: taxonomyListQuery }), TaxonomyController.list);
router.patch('/taxonomy/:id', superAdmin, validate({ params: idParams, body: renameTypeBody }), TaxonomyController.rename);
router.post('/taxonomy/:id/approve', superAdmin, validate({ params: idParams }), TaxonomyController.approve);
router.post('/taxonomy/:id/merge', superAdmin, validate({ params: idParams, body: mergeTypeBody }), TaxonomyController.merge);
router.post('/taxonomy/:id/retire', superAdmin, validate({ params: idParams, body: retireTypeBody }), TaxonomyController.retire);

export default router;
