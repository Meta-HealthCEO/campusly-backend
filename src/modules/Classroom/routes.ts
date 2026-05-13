import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { requireEntitlement } from '../subscription/entitlements.js';
import { ClassroomController } from './controller.js';
import { RecordingController } from './controller-recording.js';
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

router.patch(
  '/sessions/:id/cancel',
  authorize(...TEACHER_ROLES),
  ClassroomController.deleteSession,
);

router.post(
  '/sessions/:id/start',
  authorize(...TEACHER_ROLES),
  ClassroomController.startSession,
);

router.patch(
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

router.patch(
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

router.get(
  '/sessions/:id/chat',
  authorize(...ALL_ROLES),
  ClassroomController.getChatHistory,
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

// ─── Recording & Lesson Notes ────────────────────────────────────────────────

router.post(
  '/sessions/:id/recording/start',
  authorize(...TEACHER_ROLES),
  RecordingController.startRecording,
);

router.post(
  '/sessions/:id/recording/stop',
  authorize(...TEACHER_ROLES),
  RecordingController.stopRecording,
);

router.get(
  '/sessions/:id/notes',
  authorize(...ALL_ROLES),
  RecordingController.getLessonNotes,
);

router.get(
  '/notes/class/:classId',
  authorize(...ALL_ROLES),
  RecordingController.getClassLessonNotes,
);

router.post(
  '/sessions/:id/notes/retry',
  authorize(...TEACHER_ROLES),
  RecordingController.retryLessonNotes,
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

router.patch(
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
  requireEntitlement('advancedAnalytics'),
  ClassroomController.getTeacherStats,
);

router.get(
  '/analytics/class/:classId',
  authorize(...ADMIN_ROLES, 'teacher'),
  requireEntitlement('advancedAnalytics'),
  ClassroomController.getClassStats,
);

export default router;
