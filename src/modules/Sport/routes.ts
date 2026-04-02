import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { SportController } from './controller.js';
import { StatsController } from './controller-stats.js';
import {
  createTeamSchema,
  updateTeamSchema,
  createFixtureSchema,
  updateFixtureSchema,
  createSeasonSchema,
  updateSeasonSchema,
  createPlayerAvailabilitySchema,
  createMatchResultSchema,
  updateMatchResultSchema,
  createMvpVoteSchema,
} from './validation.js';
import {
  recordMatchStatsSchema,
  recordPersonalBestSchema,
} from './validation-stats.js';

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

// ─── Season Routes ──────────────────────────────────────────────────────────

router.post(
  '/seasons',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createSeasonSchema),
  SportController.createSeason,
);

router.get(
  '/seasons',
  authenticate,
  SportController.listSeasons,
);

router.get(
  '/seasons/:id',
  authenticate,
  SportController.getSeason,
);

router.put(
  '/seasons/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateSeasonSchema),
  SportController.updateSeason,
);

router.delete(
  '/seasons/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  SportController.deleteSeason,
);

// ─── Player Availability Routes ─────────────────────────────────────────────

router.post(
  '/fixtures/:fixtureId/availability',
  authenticate,
  validate(createPlayerAvailabilitySchema),
  SportController.createPlayerAvailability,
);

router.get(
  '/fixtures/:fixtureId/availability',
  authenticate,
  SportController.getFixtureAvailability,
);

// ─── Match Result Routes ────────────────────────────────────────────────────

router.post(
  '/fixtures/:fixtureId/result',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createMatchResultSchema),
  SportController.createMatchResult,
);

router.put(
  '/fixtures/:fixtureId/result',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateMatchResultSchema),
  SportController.updateMatchResult,
);

router.get(
  '/fixtures/:fixtureId/result',
  authenticate,
  SportController.getMatchResult,
);

// ─── Season Standings Routes ────────────────────────────────────────────────

router.get(
  '/seasons/:seasonId/standings',
  authenticate,
  SportController.getSeasonStandings,
);

// ─── MVP Vote Routes ────────────────────────────────────────────────────────

router.post(
  '/fixtures/:fixtureId/mvp',
  authenticate,
  validate(createMvpVoteSchema),
  SportController.castMvpVote,
);

router.get(
  '/fixtures/:fixtureId/mvp',
  authenticate,
  SportController.getMvpResults,
);

// ─── Sport Configs ─────────────────────────────────────────────────────────

router.get(
  '/configs',
  authenticate,
  StatsController.listSportConfigs,
);

router.get(
  '/configs/:code',
  authenticate,
  StatsController.getSportConfig,
);

// ─── Match Stats Routes ────────────────────────────────────────────────────

router.post(
  '/fixtures/:fixtureId/stats',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(recordMatchStatsSchema),
  StatsController.recordMatchStats,
);

router.get(
  '/fixtures/:fixtureId/stats',
  authenticate,
  StatsController.getMatchStats,
);

// ─── Player Stats & Cards Routes ───────────────────────────────────────────

router.get(
  '/players/:studentId/stats',
  authenticate,
  StatsController.getPlayerCareerStats,
);

router.get(
  '/players/:studentId/card',
  authenticate,
  StatsController.getPlayerCard,
);

router.get(
  '/players/:studentId/personal-bests',
  authenticate,
  StatsController.getPersonalBests,
);

router.post(
  '/players/:studentId/personal-best',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(recordPersonalBestSchema),
  StatsController.recordPersonalBest,
);

router.post(
  '/players/:studentId/recalculate-card',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  StatsController.recalculatePlayerCard,
);

// ─── Player Card Listings ──────────────────────────────────────────────────

router.get(
  '/cards',
  authenticate,
  StatsController.listPlayerCards,
);

export default router;
