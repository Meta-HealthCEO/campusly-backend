import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { ClassroomController } from './controller.js';
import {
  createSessionSchema,
  updateSessionSchema,
  endSessionSchema,
  createPollSchema,
  respondToPollSchema,
  createVideoSchema,
  updateVideoSchema,
  updateProgressSchema,
  sessionQuerySchema,
  videoQuerySchema,
} from './validation.js';

const router = Router();

const ADMIN_ROLES = ['super_admin', 'school_admin', 'principal'] as const;
const TEACHER_ROLES = ['super_admin', 'school_admin', 'principal', 'teacher'] as const;
const ALL_ROLES = [
  'super_admin',
  'school_admin',
  'principal',
  'teacher',
  'student',
  'parent',
] as const;

// ─── Sessions ────────────────────────────────────────────────────────────────

router.post(
  '/sessions',
  authorize(...TEACHER_ROLES),
  validate(createSessionSchema),
  ClassroomController.createSession,
);

router.get(
  '/sessions/upcoming',
  authorize(...ALL_ROLES),
  validate({ query: sessionQuerySchema }),
  ClassroomController.listUpcoming,
);

router.get(
  '/sessions/:id',
  authorize(...ALL_ROLES),
  ClassroomController.getSession,
);

router.patch(
  '/sessions/:id',
  authorize(...TEACHER_ROLES),
  validate(updateSessionSchema),
  ClassroomController.updateSession,
);

router.delete(
  '/sessions/:id',
  authorize(...TEACHER_ROLES),
  ClassroomController.deleteSession,
);

router.post(
  '/sessions/:id/start',
  authorize(...TEACHER_ROLES),
  ClassroomController.startSession,
);

router.post(
  '/sessions/:id/end',
  authorize(...TEACHER_ROLES),
  validate(endSessionSchema),
  ClassroomController.endSession,
);

router.get(
  '/sessions/:id/join',
  authorize(...ALL_ROLES),
  ClassroomController.joinSession,
);

router.get(
  '/sessions/:id/attendance',
  authorize(...TEACHER_ROLES),
  ClassroomController.getAttendance,
);

router.post(
  '/sessions/:id/poll',
  authorize(...TEACHER_ROLES),
  validate(createPollSchema),
  ClassroomController.createPoll,
);

router.post(
  '/sessions/:id/poll/:pollId/respond',
  authorize('student', 'teacher'),
  validate(respondToPollSchema),
  ClassroomController.respondToPoll,
);

// ─── Videos ──────────────────────────────────────────────────────────────────

router.get(
  '/videos',
  authorize(...ALL_ROLES),
  validate({ query: videoQuerySchema }),
  ClassroomController.listVideos,
);

router.post(
  '/videos',
  authorize(...TEACHER_ROLES),
  validate(createVideoSchema),
  ClassroomController.createVideo,
);

router.get(
  '/videos/student/:studentId/history',
  authorize('student', 'teacher', 'school_admin', 'principal', 'parent'),
  ClassroomController.getWatchHistory,
);

router.get(
  '/videos/:id',
  authorize(...ALL_ROLES),
  ClassroomController.getVideo,
);

router.put(
  '/videos/:id',
  authorize(...TEACHER_ROLES),
  validate(updateVideoSchema),
  ClassroomController.updateVideo,
);

router.delete(
  '/videos/:id',
  authorize(...TEACHER_ROLES),
  ClassroomController.deleteVideo,
);

router.patch(
  '/videos/:id/progress',
  authorize('student'),
  validate(updateProgressSchema),
  ClassroomController.updateProgress,
);

// ─── Analytics ───────────────────────────────────────────────────────────────

router.get(
  '/analytics/teacher/:teacherId',
  authorize(...TEACHER_ROLES),
  ClassroomController.getTeacherStats,
);

router.get(
  '/analytics/class/:classId',
  authorize(...ADMIN_ROLES, 'teacher'),
  ClassroomController.getClassStats,
);

export default router;
