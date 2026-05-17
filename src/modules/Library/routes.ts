import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { requireCapability } from '../../middleware/capability.js';
import { requireParentOwnership } from '../../middleware/parentOwnership.js';
import { validate } from '../../middleware/validate.js';
import { LibraryController } from './controller.js';
import {
  createBookSchema,
  updateBookSchema,
  issueBookSchema,
  returnBookSchema,
  createChallengeSchema,
  updateChallengeSchema,
  createReadingLogSchema,
  updateFineConfigSchema,
  generateFineInvoicesSchema,
} from './validation.js';

const router = Router();

// ─── Book Routes ────────────────────────────────────────────────────────────

router.post('/books', authenticate, requireCapability('manage_library'), validate(createBookSchema), LibraryController.createBook);
router.get('/books', authenticate, LibraryController.listBooks);
router.get('/books/:id', authenticate, LibraryController.getBook);
router.put('/books/:id', authenticate, requireCapability('manage_library'), validate(updateBookSchema), LibraryController.updateBook);
router.delete('/books/:id', authenticate, requireCapability('manage_library'), LibraryController.deleteBook);

// ─── Book Loan Routes ───────────────────────────────────────────────────────

router.post('/loans/issue', authenticate, authorize('school_admin', 'super_admin', 'teacher'), validate(issueBookSchema), LibraryController.issueBook);
router.patch('/loans/:id/return', authenticate, authorize('school_admin', 'super_admin', 'teacher'), validate(returnBookSchema), LibraryController.returnBook);
router.patch('/loans/:id/lost', authenticate, requireCapability('manage_library'), LibraryController.markLost);
router.get('/loans/overdue', authenticate, authorize('school_admin', 'super_admin', 'teacher'), LibraryController.getOverdueLoans);
router.get(
  '/loans/student/:studentId',
  authenticate,
  authorize('student', 'parent', 'teacher', 'school_admin', 'super_admin'),
  requireParentOwnership('studentId'),
  LibraryController.getStudentLoans,
);

// ─── Reading Challenge Routes ───────────────────────────────────────────────

router.post('/challenges', authenticate, authorize('school_admin', 'super_admin', 'teacher'), validate(createChallengeSchema), LibraryController.createChallenge);
router.get('/challenges', authenticate, LibraryController.listChallenges);
router.get('/challenges/:id', authenticate, LibraryController.getChallenge);
router.put('/challenges/:id', authenticate, authorize('school_admin', 'super_admin', 'teacher'), validate(updateChallengeSchema), LibraryController.updateChallenge);
router.post('/challenges/:id/join', authenticate, LibraryController.joinChallenge);
router.delete('/challenges/:id', authenticate, requireCapability('manage_library'), LibraryController.deleteChallenge);

// ─── Reading Log Routes ─────────────────────────────────────────────────────

router.post('/reading-logs', authenticate, validate(createReadingLogSchema), LibraryController.createReadingLog);
router.get(
  '/reading-logs/student/:studentId',
  authenticate,
  authorize('student', 'parent', 'teacher', 'school_admin', 'super_admin'),
  requireParentOwnership('studentId'),
  LibraryController.getStudentReadingLogs,
);

// ─── Leaderboard ────────────────────────────────────────────────────────────

router.get('/leaderboard/:challengeId', authenticate, LibraryController.getLeaderboard);

// ─── Library Fines ──────────────────────────────────────────────────────────

router.get('/fines', authenticate, authorize('school_admin', 'super_admin'), LibraryController.calculateFines);
router.post('/fines/generate-invoices', authenticate, requireCapability('manage_library'), validate(generateFineInvoicesSchema), LibraryController.generateFineInvoices);
router.get('/fine-config', authenticate, authorize('school_admin', 'super_admin'), LibraryController.getFineConfig);
router.put('/fine-config', authenticate, requireCapability('manage_library'), validate(updateFineConfigSchema), LibraryController.updateFineConfig);

export default router;
