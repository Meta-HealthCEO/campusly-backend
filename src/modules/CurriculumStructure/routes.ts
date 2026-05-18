import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { CurriculumStructureController } from './controller.js';
import {
  createFrameworkSchema,
  createNodeSchema,
  updateNodeSchema,
  bulkImportSchema,
  nodeQuerySchema,
} from './validation.js';

const router = Router();

const ADMIN_ROLES = ['super_admin', 'school_admin', 'principal'] as const;
const READ_ROLES = ['super_admin', 'school_admin', 'principal', 'hod', 'teacher', 'student'] as const;

// ─── Frameworks ──────────────────────────────────────────────────────────────

router.get(
  '/frameworks',
  authorize(...READ_ROLES),
  CurriculumStructureController.listFrameworks,
);

router.post(
  '/frameworks',
  authorize(...ADMIN_ROLES),
  validate(createFrameworkSchema),
  CurriculumStructureController.createFramework,
);

// ─── Nodes ───────────────────────────────────────────────────────────────────

router.get(
  '/nodes',
  authorize(...READ_ROLES),
  validate({ query: nodeQuerySchema }),
  CurriculumStructureController.listNodes,
);

router.get(
  '/nodes/:id',
  authorize(...READ_ROLES),
  CurriculumStructureController.getNode,
);

router.get(
  '/nodes/:id/tree',
  authorize(...READ_ROLES),
  CurriculumStructureController.getSubtree,
);

router.post(
  '/nodes',
  authorize(...ADMIN_ROLES),
  validate(createNodeSchema),
  CurriculumStructureController.createNode,
);

router.post(
  '/nodes/bulk',
  authorize(...ADMIN_ROLES),
  validate(bulkImportSchema),
  CurriculumStructureController.bulkImport,
);

router.put(
  '/nodes/:id',
  authorize(...ADMIN_ROLES),
  validate(updateNodeSchema),
  CurriculumStructureController.updateNode,
);

router.delete(
  '/nodes/:id',
  authorize(...ADMIN_ROLES),
  CurriculumStructureController.deleteNode,
);

export default router;
