import { Router } from 'express';
import { authorize, validate } from '../../middleware/index.js';
import { QuestionBankController } from './controller.js';
import {
  createQuestionSchema,
  updateQuestionSchema,
  reviewQuestionSchema,
  generateQuestionsSchema,
  questionQuerySchema,
  createPaperSchema,
  updatePaperSchema,
  addQuestionSchema,
  paperQuerySchema,
  generatePaperSchema,
} from './validation.js';

const router = Router();

const ADMIN_ROLES = ['super_admin', 'school_admin', 'principal'] as const;
const HOD_ROLES = ['super_admin', 'school_admin', 'principal', 'hod'] as const;
const READ_ROLES = ['super_admin', 'school_admin', 'principal', 'hod', 'teacher'] as const;

// ─── AI Generation (BEFORE :id to avoid route shadowing) ──────────────────

router.post(
  '/questions/generate',
  authorize(...READ_ROLES),
  validate(generateQuestionsSchema),
  QuestionBankController.generateQuestions,
);

// ─── Questions CRUD ────────────────────────────────────────────────────────

router.get(
  '/questions',
  authorize(...READ_ROLES),
  validate({ query: questionQuerySchema }),
  QuestionBankController.listQuestions,
);

router.post(
  '/questions',
  authorize(...READ_ROLES),
  validate(createQuestionSchema),
  QuestionBankController.createQuestion,
);

router.get(
  '/questions/:id',
  authorize(...READ_ROLES),
  QuestionBankController.getQuestion,
);

router.put(
  '/questions/:id',
  authorize(...READ_ROLES),
  validate(updateQuestionSchema),
  QuestionBankController.updateQuestion,
);

router.delete(
  '/questions/:id',
  authorize(...READ_ROLES),
  QuestionBankController.deleteQuestion,
);

// ─── Question Review ───────────────────────────────────────────────────────

router.patch(
  '/questions/:id/submit',
  authorize(...READ_ROLES),
  QuestionBankController.submitForReview,
);

router.patch(
  '/questions/:id/review',
  authorize(...HOD_ROLES),
  validate(reviewQuestionSchema),
  QuestionBankController.reviewQuestion,
);

// ─── AI Paper Generation (BEFORE :id to avoid route shadowing) ────────────

router.post(
  '/papers/generate',
  authorize(...READ_ROLES),
  validate(generatePaperSchema),
  QuestionBankController.generatePaper,
);

router.get(
  '/papers/:id/pdf',
  authorize(...READ_ROLES),
  QuestionBankController.downloadPaperPdf,
);

router.get(
  '/papers/:id/memo-pdf',
  authorize(...READ_ROLES),
  QuestionBankController.downloadMemoPdf,
);

// ─── Paper Operations (BEFORE generic :id) ─────────────────────────────────

router.post(
  '/papers/:id/finalise',
  authorize(...READ_ROLES),
  QuestionBankController.finalisePaper,
);

router.get(
  '/papers/:id/compliance',
  authorize(...READ_ROLES),
  QuestionBankController.checkCompliance,
);

router.post(
  '/papers/:id/clone',
  authorize(...READ_ROLES),
  QuestionBankController.clonePaper,
);

router.post(
  '/papers/:id/questions',
  authorize(...READ_ROLES),
  validate(addQuestionSchema),
  QuestionBankController.addQuestion,
);

router.delete(
  '/papers/:id/questions/:sectionIndex/:questionIndex',
  authorize(...READ_ROLES),
  QuestionBankController.removeQuestion,
);

// ─── Papers CRUD ───────────────────────────────────────────────────────────

router.get(
  '/papers',
  authorize(...READ_ROLES),
  validate({ query: paperQuerySchema }),
  QuestionBankController.listPapers,
);

router.post(
  '/papers',
  authorize(...READ_ROLES),
  validate(createPaperSchema),
  QuestionBankController.createPaper,
);

router.get(
  '/papers/:id',
  authorize(...READ_ROLES),
  QuestionBankController.getPaper,
);

router.put(
  '/papers/:id',
  authorize(...READ_ROLES),
  validate(updatePaperSchema),
  QuestionBankController.updatePaper,
);

router.delete(
  '/papers/:id',
  authorize(...ADMIN_ROLES),
  QuestionBankController.deletePaper,
);

export default router;
