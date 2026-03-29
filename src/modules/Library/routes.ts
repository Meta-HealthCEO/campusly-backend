import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
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
} from './validation.js';

const router = Router();

// ─── Book Routes ────────────────────────────────────────────────────────────

router.post('/books', authenticate, authorize('school_admin', 'super_admin'), validate(createBookSchema), LibraryController.createBook);
router.get('/books', authenticate, LibraryController.listBooks);
router.get('/books/:id', authenticate, LibraryController.getBook);
router.put('/books/:id', authenticate, authorize('school_admin', 'super_admin'), validate(updateBookSchema), LibraryController.updateBook);
router.delete('/books/:id', authenticate, authorize('school_admin', 'super_admin'), LibraryController.deleteBook);

// ─── Book Loan Routes ───────────────────────────────────────────────────────

router.post('/loans/issue', authenticate, authorize('school_admin', 'super_admin', 'teacher'), validate(issueBookSchema), LibraryController.issueBook);
router.patch('/loans/:id/return', authenticate, authorize('school_admin', 'super_admin', 'teacher'), validate(returnBookSchema), LibraryController.returnBook);
router.patch('/loans/:id/lost', authenticate, authorize('school_admin', 'super_admin'), LibraryController.markLost);
router.get('/loans/overdue', authenticate, authorize('school_admin', 'super_admin', 'teacher'), LibraryController.getOverdueLoans);
router.get('/loans/student/:studentId', authenticate, LibraryController.getStudentLoans);

// ─── Reading Challenge Routes ───────────────────────────────────────────────

router.post('/challenges', authenticate, authorize('school_admin', 'super_admin', 'teacher'), validate(createChallengeSchema), LibraryController.createChallenge);
router.get('/challenges', authenticate, LibraryController.listChallenges);
router.get('/challenges/:id', authenticate, LibraryController.getChallenge);
router.put('/challenges/:id', authenticate, authorize('school_admin', 'super_admin', 'teacher'), validate(updateChallengeSchema), LibraryController.updateChallenge);
router.post('/challenges/:id/join', authenticate, LibraryController.joinChallenge);
router.delete('/challenges/:id', authenticate, authorize('school_admin', 'super_admin'), LibraryController.deleteChallenge);

// ─── Reading Log Routes ─────────────────────────────────────────────────────

router.post('/reading-logs', authenticate, validate(createReadingLogSchema), LibraryController.createReadingLog);
router.get('/reading-logs/student/:studentId', authenticate, LibraryController.getStudentReadingLogs);

// ─── Leaderboard ────────────────────────────────────────────────────────────

router.get('/leaderboard/:challengeId', authenticate, LibraryController.getLeaderboard);

export default router;
