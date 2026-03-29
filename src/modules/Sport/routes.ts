import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { SportController } from './controller.js';
import {
  createTeamSchema,
  updateTeamSchema,
  createFixtureSchema,
  updateFixtureSchema,
} from './validation.js';

const router = Router();

// ─── Team Routes ────────────────────────────────────────────────────────────

router.post(
  '/teams',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createTeamSchema),
  SportController.createTeam,
);

router.get(
  '/teams',
  authenticate,
  SportController.listTeams,
);

router.get(
  '/teams/:id',
  authenticate,
  SportController.getTeam,
);

router.put(
  '/teams/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateTeamSchema),
  SportController.updateTeam,
);

router.delete(
  '/teams/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  SportController.deleteTeam,
);

// ─── Fixture Routes ─────────────────────────────────────────────────────────

router.post(
  '/fixtures',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createFixtureSchema),
  SportController.createFixture,
);

router.get(
  '/fixtures',
  authenticate,
  SportController.listFixtures,
);

router.get(
  '/fixtures/:id',
  authenticate,
  SportController.getFixture,
);

router.put(
  '/fixtures/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateFixtureSchema),
  SportController.updateFixture,
);

router.delete(
  '/fixtures/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  SportController.deleteFixture,
);

export default router;
