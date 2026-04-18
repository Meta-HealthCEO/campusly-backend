import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { SportController } from './controller.js';
import { StatsController } from './controller-stats.js';
import { AISportsController } from './controller-ai-sports.js';
import { TrainingController } from './controller-training.js';
import { InjuryController } from './controller-injury.js';
import { FitnessController } from './controller-fitness.js';
import { AnnouncementController } from './controller-announcement.js';
import { CoachAssignmentController } from './controller-coach-assignment.js';
import { BenchmarkController } from './controller-benchmark.js';
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
import {
  createTrainingSessionSchema,
  updateTrainingSessionSchema,
  recordAttendanceSchema,
  createDrillTemplateSchema,
  updateDrillTemplateSchema,
} from './validation-training.js';
import {
  createInjurySchema,
  updateInjurySchema,
  createRecoveryLogSchema,
} from './validation-injury.js';
import {
  createFitnessTestSchema,
  updateFitnessTestSchema,
  createBiometricSchema,
  updateBiometricSchema,
} from './validation-fitness.js';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from './validation-announcement.js';
import {
  createCoachAssignmentSchema,
  updateCoachAssignmentSchema,
} from './validation-coach-assignment.js';

const router = Router();

// ─── Team Routes ────────────────────────────────────────────────────────────

router.post(
  '/teams',
  authenticate,
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
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
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
  validate(updateTeamSchema),
  SportController.updateTeam,
);

router.delete(
  '/teams/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
  SportController.deleteTeam,
);

// ─── Fixture Routes ─────────────────────────────────────────────────────────

router.post(
  '/fixtures',
  authenticate,
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
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
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
  validate(updateFixtureSchema),
  SportController.updateFixture,
);

router.delete(
  '/fixtures/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
  SportController.deleteFixture,
);

// ─── Season Routes ──────────────────────────────────────────────────────────

router.post(
  '/seasons',
  authenticate,
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
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
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
  validate(updateSeasonSchema),
  SportController.updateSeason,
);

router.delete(
  '/seasons/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
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
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
  validate(createMatchResultSchema),
  SportController.createMatchResult,
);

router.put(
  '/fixtures/:fixtureId/result',
  authenticate,
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
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
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
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
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(recordPersonalBestSchema),
  StatsController.recordPersonalBest,
);

router.post(
  '/players/:studentId/recalculate-card',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  StatsController.recalculatePlayerCard,
);

// ─── Player Card Listings ──────────────────────────────────────────────────

router.get(
  '/cards',
  authenticate,
  StatsController.listPlayerCards,
);

// ─── AI Sports Analytics Routes ────────────────────────────────────────────

router.post(
  '/ai/player/:studentId/analysis',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  AISportsController.generatePlayerAnalysis,
);

router.post(
  '/ai/player/:studentId/development-plan',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  AISportsController.generateDevelopmentPlan,
);

router.post(
  '/ai/player/:studentId/scouting-report',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  AISportsController.generateScoutingReport,
);

router.post(
  '/ai/player/:studentId/parent-report',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'parent', 'coach', 'sports_manager'),
  AISportsController.generateParentReport,
);

router.post(
  '/ai/match/:fixtureId/report',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  AISportsController.generateMatchReport,
);

router.post(
  '/ai/team/:teamId/analysis',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  AISportsController.generateTeamAnalysis,
);

router.post(
  '/ai/talent-identification',
  authenticate,
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
  AISportsController.identifyTalent,
);

router.get(
  '/ai/talent-flags',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  AISportsController.listTalentFlags,
);

router.patch(
  '/ai/talent-flags/:id/review',
  authenticate,
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
  AISportsController.reviewTalentFlag,
);

router.get(
  '/ai/reports/:id',
  authenticate,
  AISportsController.getReport,
);

router.get(
  '/ai/reports',
  authenticate,
  AISportsController.listReports,
);

// ─── Training Sessions ──────────────────────────────────────────────────────

router.post(
  '/training/sessions',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(createTrainingSessionSchema),
  TrainingController.createSession,
);

router.get(
  '/training/sessions',
  authenticate,
  TrainingController.listSessions,
);

router.get(
  '/training/sessions/:id',
  authenticate,
  TrainingController.getSession,
);

router.put(
  '/training/sessions/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(updateTrainingSessionSchema),
  TrainingController.updateSession,
);

router.delete(
  '/training/sessions/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  TrainingController.deleteSession,
);

router.post(
  '/training/sessions/:sessionId/attendance',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(recordAttendanceSchema),
  TrainingController.recordAttendance,
);

router.get(
  '/training/sessions/:sessionId/attendance',
  authenticate,
  TrainingController.getAttendance,
);

router.get(
  '/training/players/:studentId/attendance-summary',
  authenticate,
  TrainingController.getPlayerAttendanceSummary,
);

router.post(
  '/training/drills',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(createDrillTemplateSchema),
  TrainingController.createDrill,
);

router.get(
  '/training/drills',
  authenticate,
  TrainingController.listDrills,
);

router.put(
  '/training/drills/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(updateDrillTemplateSchema),
  TrainingController.updateDrill,
);

router.delete(
  '/training/drills/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  TrainingController.deleteDrill,
);

// ─── Injuries & Recovery ────────────────────────────────────────────────────

router.post(
  '/injuries',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(createInjurySchema),
  InjuryController.createInjury,
);

router.get(
  '/injuries',
  authenticate,
  InjuryController.listInjuries,
);

router.get(
  '/injuries/:id',
  authenticate,
  InjuryController.getInjury,
);

router.put(
  '/injuries/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(updateInjurySchema),
  InjuryController.updateInjury,
);

router.delete(
  '/injuries/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  InjuryController.deleteInjury,
);

router.post(
  '/injuries/:id/recovery-logs',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(createRecoveryLogSchema),
  InjuryController.addRecoveryLog,
);

router.get(
  '/injuries/:id/recovery-logs',
  authenticate,
  InjuryController.listRecoveryLogs,
);

router.get(
  '/players/:studentId/injuries',
  authenticate,
  InjuryController.getPlayerInjuries,
);

// ─── Fitness Tests & Biometrics ─────────────────────────────────────────────

router.post(
  '/fitness/tests',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(createFitnessTestSchema),
  FitnessController.createTest,
);

router.get(
  '/fitness/tests',
  authenticate,
  FitnessController.listTests,
);

router.put(
  '/fitness/tests/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(updateFitnessTestSchema),
  FitnessController.updateTest,
);

router.delete(
  '/fitness/tests/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  FitnessController.deleteTest,
);

router.get(
  '/fitness/players/:studentId/progression',
  authenticate,
  FitnessController.playerProgression,
);

router.post(
  '/fitness/biometrics',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(createBiometricSchema),
  FitnessController.createBiometric,
);

router.get(
  '/fitness/biometrics',
  authenticate,
  FitnessController.listBiometrics,
);

router.put(
  '/fitness/biometrics/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(updateBiometricSchema),
  FitnessController.updateBiometric,
);

router.delete(
  '/fitness/biometrics/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  FitnessController.deleteBiometric,
);

// ─── Team Announcements ─────────────────────────────────────────────────────

router.post(
  '/announcements',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(createAnnouncementSchema),
  AnnouncementController.create,
);

router.get(
  '/announcements',
  authenticate,
  AnnouncementController.list,
);

router.get(
  '/announcements/:id',
  authenticate,
  AnnouncementController.get,
);

router.put(
  '/announcements/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  validate(updateAnnouncementSchema),
  AnnouncementController.update,
);

router.delete(
  '/announcements/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  AnnouncementController.remove,
);

router.post(
  '/fixtures/:fixtureId/team-sheet',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher', 'coach', 'sports_manager'),
  AnnouncementController.generateTeamSheet,
);

// ─── Coach Assignments ─────────────────────────────────────────────────────

router.post(
  '/coach-assignments',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createCoachAssignmentSchema),
  CoachAssignmentController.create,
);

router.get(
  '/coach-assignments',
  authenticate,
  CoachAssignmentController.list,
);

router.get(
  '/coach-assignments/me',
  authenticate,
  CoachAssignmentController.listMyAssignments,
);

router.put(
  '/coach-assignments/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateCoachAssignmentSchema),
  CoachAssignmentController.update,
);

router.delete(
  '/coach-assignments/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  CoachAssignmentController.remove,
);

// ─── Benchmarks & player fitness snapshot ──────────────────────────────────

router.get(
  '/benchmarks',
  authenticate,
  BenchmarkController.list,
);

router.post(
  '/benchmarks',
  authenticate,
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
  BenchmarkController.upsert,
);

router.delete(
  '/benchmarks/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'coach', 'sports_manager'),
  BenchmarkController.remove,
);

router.get(
  '/players/:studentId/fitness-snapshot',
  authenticate,
  BenchmarkController.snapshot,
);

export default router;
