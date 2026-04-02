import express from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { AITutorController } from './controller.js';
import {
  sendMessageSchema,
  generatePracticeSchema,
  submitPracticeSchema,
  generateReportCommentsSchema,
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

// ─── Teacher Routes ──────────────────────────────────────────────────────────

// POST /report-comments — generate AI report comments
router.post(
  '/report-comments',
  authorize('teacher', 'school_admin', 'super_admin'),
  validate(generateReportCommentsSchema),
  AITutorController.generateReportComments,
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

export default router;
