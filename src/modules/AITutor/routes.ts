import express from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { AITutorController } from './controller.js';
import {
  sendMessageSchema,
  generatePracticeSchema,
  submitPracticeSchema,
  generateReportCommentsSchema,
  updateReportCommentSchema,
  listReportCommentsQuerySchema,
  parentChatSchema,
} from './validation.js';

const router = express.Router();

// ─── Student Routes ──────────────────────────────────────────────────────────

// POST /chat — send a message in a tutor conversation
router.post(
  '/chat',
  authorize('student'),
  validate(sendMessageSchema),
  AITutorController.sendMessage,
);

// POST /chat/stream — same as /chat but streams the reply via SSE
router.post(
  '/chat/stream',
  authorize('student'),
  validate(sendMessageSchema),
  AITutorController.streamMessage,
);

// GET /conversations — list student's conversations
router.get(
  '/conversations',
  authorize('student'),
  AITutorController.listConversations,
);

// GET /conversations/:id — get a single conversation
router.get(
  '/conversations/:id',
  authorize('student'),
  AITutorController.getConversation,
);

// POST /practice — generate practice questions
router.post(
  '/practice',
  authorize('student'),
  validate(generatePracticeSchema),
  AITutorController.generatePractice,
);

// POST /practice/submit — submit practice answers
router.post(
  '/practice/submit',
  authorize('student'),
  validate(submitPracticeSchema),
  AITutorController.submitPractice,
);

// GET /weak-areas — get student's weak areas
router.get(
  '/weak-areas',
  authorize('student'),
  AITutorController.getWeakAreas,
);

// GET /practice/history — list past practice attempts (paginated)
router.get(
  '/practice/history',
  authorize('student'),
  AITutorController.getPracticeHistory,
);

// GET /mastery — per-subject + per-topic mastery snapshot
router.get(
  '/mastery',
  authorize('student'),
  AITutorController.getMastery,
);

// GET /recommendations — adaptive "what to work on next" suggestions
router.get(
  '/recommendations',
  authorize('student'),
  AITutorController.getRecommendations,
);

// ─── Teacher Routes ──────────────────────────────────────────────────────────

// POST /report-comments — generate AI report comments
router.post(
  '/report-comments',
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(generateReportCommentsSchema),
  AITutorController.generateReportComments,
);

// GET /report-comments — list saved report comments
router.get(
  '/report-comments',
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(listReportCommentsQuerySchema),
  AITutorController.listReportComments,
);

// PUT /report-comments/:id — update final text
router.put(
  '/report-comments/:id',
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(updateReportCommentSchema),
  AITutorController.updateReportComment,
);

// POST /report-comments/:id/regenerate — regenerate a single comment
router.post(
  '/report-comments/:id/regenerate',
  authorize('teacher', 'school_admin', 'super_admin'),
  AITutorController.regenerateReportComment,
);

// DELETE /report-comments/:id — soft-delete a comment
router.delete(
  '/report-comments/:id',
  authorize('teacher', 'school_admin', 'super_admin'),
  AITutorController.deleteReportComment,
);

// ─── Parent Routes ───────────────────────────────────────────────────────────

// POST /parent/chat — parent chat with AI about their child
router.post(
  '/parent/chat',
  authorize('parent'),
  validate(parentChatSchema),
  AITutorController.parentChat,
);

// GET /parent/conversations — list parent's conversations
router.get(
  '/parent/conversations',
  authorize('parent'),
  AITutorController.listParentConversations,
);

// GET /parent/child/:studentId/insights — privacy-safe mastery snapshot
router.get(
  '/parent/child/:studentId/insights',
  authorize('parent'),
  AITutorController.getChildInsights,
);

export default router;
