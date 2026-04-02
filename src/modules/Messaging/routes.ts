import { Router } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { MessagingController } from './controller.js';
import { createThreadSchema, sendMessageSchema } from './validation.js';

const router = Router();

// Create a new thread (or reuse existing)
router.post(
  '/threads',
  authorize('teacher', 'parent', 'school_admin'),
  validate(createThreadSchema),
  MessagingController.createThread,
);

// List all threads for the current user
router.get(
  '/threads',
  authorize('teacher', 'parent', 'school_admin'),
  MessagingController.listThreads,
);

// Get unread count across all threads
router.get(
  '/unread-count',
  authorize('teacher', 'parent', 'school_admin'),
  MessagingController.getUnreadCount,
);

// Get a single thread with messages
router.get(
  '/threads/:id',
  authorize('teacher', 'parent', 'school_admin'),
  MessagingController.getThread,
);

// Send a message within a thread
router.post(
  '/threads/:id/messages',
  authorize('teacher', 'parent', 'school_admin'),
  validate(sendMessageSchema),
  MessagingController.sendMessage,
);

// Mark thread messages as read
router.patch(
  '/threads/:id/read',
  authorize('teacher', 'parent', 'school_admin'),
  MessagingController.markAsRead,
);

// Close a thread (teacher/admin only)
router.patch(
  '/threads/:id/close',
  authorize('teacher', 'school_admin'),
  MessagingController.closeThread,
);

export default router;
