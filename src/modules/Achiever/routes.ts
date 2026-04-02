import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { AchieverController } from './controller.js';
import { GamificationController } from './gamification.controller.js';
import {
  createAchievementSchema,
  updateAchievementSchema,
  createHousePointsSchema,
  updateHousePointsSchema,
  addHousePointLogSchema,
} from './validation.js';

const router = Router();

// ─── Achievements ───────────────────────────────────────────────────────────

router.post(
  '/achievements',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(createAchievementSchema),
  AchieverController.createAchievement,
);

router.get(
  '/achievements',
  authenticate,
  AchieverController.listAchievements,
);

router.get(
  '/achievements/wall-of-fame',
  authenticate,
  AchieverController.getWallOfFame,
);

router.get(
  '/achievements/top-marks',
  authenticate,
  AchieverController.getTopAchieversFromMarks,
);

router.get(
  '/achievements/:id',
  authenticate,
  AchieverController.getAchievement,
);

router.put(
  '/achievements/:id',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(updateAchievementSchema),
  AchieverController.updateAchievement,
);

router.delete(
  '/achievements/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  AchieverController.deleteAchievement,
);

// ─── Houses ─────────────────────────────────────────────────────────────────

router.post(
  '/houses',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(createHousePointsSchema),
  AchieverController.createHousePoints,
);

router.get(
  '/houses/leaderboard',
  authenticate,
  AchieverController.getHouseLeaderboard,
);

router.get(
  '/houses',
  authenticate,
  AchieverController.listHousePoints,
);

router.put(
  '/houses/:id',
  authenticate,
  authorize('super_admin', 'school_admin'),
  validate(updateHousePointsSchema),
  AchieverController.updateHousePoints,
);

router.post(
  '/houses/points',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  validate(addHousePointLogSchema),
  AchieverController.addHousePointLog,
);

router.get(
  '/houses/:houseId/history',
  authenticate,
  AchieverController.getHousePointHistory,
);

// ─── Gamification ──────────────────────────────────────────────────────────

router.get(
  '/gamification/badges',
  authenticate,
  GamificationController.getBadgeDefinitions,
);

router.get(
  '/gamification/leaderboard',
  authenticate,
  GamificationController.getLeaderboard,
);

router.get(
  '/gamification/level',
  authenticate,
  GamificationController.getStudentLevel,
);

router.get(
  '/gamification/badges/:studentId',
  authenticate,
  GamificationController.getStudentBadges,
);

router.post(
  '/gamification/check-badges',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  GamificationController.checkBadges,
);

router.post(
  '/gamification/award-xp',
  authenticate,
  authorize('super_admin', 'school_admin', 'teacher'),
  GamificationController.awardXP,
);

export default router;
