import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  CurriculumController,
  QuestionController,
  MemoController,
  ModerationController,
  PlannerController,
  AggregationController,
} from './controllers/index.js';
import {
  createFrameworkSchema,
  createTopicSchema,
  updateTopicSchema,
  bulkImportTopicsSchema,
  updateCoverageSchema,
  createQuestionSchema,
  updateQuestionSchema,
  updateMemoSchema,
  reviewPaperSchema,
  createPlanSchema,
} from './validation.js';

const router = express.Router();

const allRoles = authorize('teacher', 'school_admin', 'super_admin');
const teacherOnly = authorize('teacher');

// ─── Dashboard ────────────────────────────────────────────────────────────────

// GET /dashboard — teacher workbench dashboard
router.get('/dashboard', authenticate, allRoles, AggregationController.getDashboard);

// ─── Curriculum ───────────────────────────────────────────────────────────────

// GET /curriculum/frameworks — list curriculum frameworks
router.get('/curriculum/frameworks', authenticate, allRoles, CurriculumController.listFrameworks);

// POST /curriculum/frameworks — create framework
router.post(
  '/curriculum/frameworks',
  authenticate,
  allRoles,
  validate(createFrameworkSchema),
  CurriculumController.createFramework,
);

// GET /curriculum/coverage/report — coverage aggregate report (before :topicId route)
router.get(
  '/curriculum/coverage/report',
  authenticate,
  allRoles,
  CurriculumController.getCoverageReport,
);

// GET /curriculum/topics — list topics
router.get('/curriculum/topics', authenticate, allRoles, CurriculumController.listTopics);

// POST /curriculum/topics/bulk — bulk import topics (before /:id routes)
router.post(
  '/curriculum/topics/bulk',
  authenticate,
  allRoles,
  validate(bulkImportTopicsSchema),
  CurriculumController.bulkImportTopics,
);

// POST /curriculum/topics — create topic
router.post(
  '/curriculum/topics',
  authenticate,
  allRoles,
  validate(createTopicSchema),
  CurriculumController.createTopic,
);

// PUT /curriculum/topics/:id — update topic
router.put(
  '/curriculum/topics/:id',
  authenticate,
  allRoles,
  validate(updateTopicSchema),
  CurriculumController.updateTopic,
);

// DELETE /curriculum/topics/:id — delete topic
router.delete('/curriculum/topics/:id', authenticate, allRoles, CurriculumController.deleteTopic);

// GET /curriculum/coverage — get coverage records
router.get('/curriculum/coverage', authenticate, allRoles, CurriculumController.getCoverage);

// PATCH /curriculum/coverage/:topicId — update coverage for a topic
router.patch(
  '/curriculum/coverage/:topicId',
  authenticate,
  teacherOnly,
  validate(updateCoverageSchema),
  CurriculumController.updateCoverage,
);

// ─── Questions ────────────────────────────────────────────────────────────────

// GET /questions — list questions
router.get('/questions', authenticate, allRoles, QuestionController.listQuestions);

// POST /questions/import-from-paper/:paperId — import from AI paper (before /:id routes)
router.post(
  '/questions/import-from-paper/:paperId',
  authenticate,
  allRoles,
  QuestionController.importFromPaper,
);

// POST /questions — create question
router.post(
  '/questions',
  authenticate,
  allRoles,
  validate(createQuestionSchema),
  QuestionController.createQuestion,
);

// GET /questions/:id — get question
router.get('/questions/:id', authenticate, allRoles, QuestionController.getQuestion);

// PUT /questions/:id — update question
router.put(
  '/questions/:id',
  authenticate,
  allRoles,
  validate(updateQuestionSchema),
  QuestionController.updateQuestion,
);

// DELETE /questions/:id — delete question
router.delete('/questions/:id', authenticate, allRoles, QuestionController.deleteQuestion);

// ─── Memos ────────────────────────────────────────────────────────────────────

// POST /memos/generate/:paperId — generate memo from paper
router.post(
  '/memos/generate/:paperId',
  authenticate,
  allRoles,
  MemoController.generateMemo,
);

// GET /memos/paper/:paperId — get memo by paper id
router.get('/memos/paper/:paperId', authenticate, allRoles, MemoController.getMemoByPaper);

// PUT /memos/:id — update memo
router.put(
  '/memos/:id',
  authenticate,
  allRoles,
  validate(updateMemoSchema),
  MemoController.updateMemo,
);

// ─── Moderation ───────────────────────────────────────────────────────────────

// POST /moderation/submit/:paperId — submit paper for moderation
router.post(
  '/moderation/submit/:paperId',
  authenticate,
  teacherOnly,
  ModerationController.submitForModeration,
);

// GET /moderation/queue — get moderation queue
router.get('/moderation/queue', authenticate, allRoles, ModerationController.getModerationQueue);

// GET /moderation/:paperId — get moderation status for a paper
router.get('/moderation/:paperId', authenticate, allRoles, ModerationController.getModerationStatus);

// POST /moderation/:paperId/review — review a paper
router.post(
  '/moderation/:paperId/review',
  authenticate,
  allRoles,
  validate(reviewPaperSchema),
  ModerationController.reviewPaper,
);

// ─── Marking Hub ─────────────────────────────────────────────────────────────

// GET /marking-hub/pending — pending marking items
router.get(
  '/marking-hub/pending',
  authenticate,
  teacherOnly,
  AggregationController.getPendingMarking,
);

// ─── Planner ─────────────────────────────────────────────────────────────────

// GET /planner/clashes/:classId/:date — check for assessment clashes (before /:classId/:term/:year)
router.get(
  '/planner/clashes/:classId/:date',
  authenticate,
  allRoles,
  PlannerController.checkClashes,
);

// GET /planner/weightings/:subjectId — get weightings for a subject
router.get(
  '/planner/weightings/:subjectId',
  authenticate,
  allRoles,
  PlannerController.getWeightings,
);

// GET /planner/:classId/:term/:year — get plan
router.get(
  '/planner/:classId/:term/:year',
  authenticate,
  allRoles,
  PlannerController.getPlan,
);

// POST /planner — create or update plan
router.post(
  '/planner',
  authenticate,
  allRoles,
  validate(createPlanSchema),
  PlannerController.createOrUpdatePlan,
);

// ─── Student 360 ─────────────────────────────────────────────────────────────

// GET /student-360/:studentId — aggregated student data
router.get(
  '/student-360/:studentId',
  authenticate,
  allRoles,
  AggregationController.getStudent360,
);

export default router;
