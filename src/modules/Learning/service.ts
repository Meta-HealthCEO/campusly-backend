import { QuizService } from './services/quiz.service.js';
import { MaterialService } from './services/material.service.js';
import { SubmissionService } from './services/submission.service.js';

export { QuizService } from './services/quiz.service.js';
export { MaterialService } from './services/material.service.js';
export { SubmissionService } from './services/submission.service.js';

/**
 * Unified facade so existing consumers (`import { LearningService }`)
 * continue to work without changes.
 */
export const LearningService = {
  // Quiz
  createQuiz: QuizService.createQuiz,
  getQuiz: QuizService.getQuiz,
  listQuizzes: QuizService.listQuizzes,
  updateQuiz: QuizService.updateQuiz,
  publishQuiz: QuizService.publishQuiz,
  deleteQuiz: QuizService.deleteQuiz,
  startQuizAttempt: QuizService.startQuizAttempt,
  submitQuizAttempt: QuizService.submitQuizAttempt,
  getQuizResults: QuizService.getQuizResults,
  getQuizLeaderboard: QuizService.getQuizLeaderboard,
  flagStrugglingStudents: QuizService.flagStrugglingStudents,

  // Material & Rubric
  uploadStudyMaterial: MaterialService.uploadStudyMaterial,
  getStudyMaterials: MaterialService.getStudyMaterials,
  getStudyMaterial: MaterialService.getStudyMaterial,
  updateStudyMaterial: MaterialService.updateStudyMaterial,
  deleteStudyMaterial: MaterialService.deleteStudyMaterial,
  incrementDownloads: MaterialService.incrementDownloads,
  createRubric: MaterialService.createRubric,
  getRubric: MaterialService.getRubric,
  listRubrics: MaterialService.listRubrics,
  updateRubric: MaterialService.updateRubric,
  deleteRubric: MaterialService.deleteRubric,

  // Submission & Progress
  submitDraft: SubmissionService.submitDraft,
  submitFinal: SubmissionService.submitFinal,
  gradeWithRubric: SubmissionService.gradeWithRubric,
  enablePeerReview: SubmissionService.enablePeerReview,
  submitPeerReview: SubmissionService.submitPeerReview,
  requestRevision: SubmissionService.requestRevision,
  getSubmission: SubmissionService.getSubmission,
  getSubmissionsForHomework: SubmissionService.getSubmissionsForHomework,
  getStudentProgress: SubmissionService.getStudentProgress,
  calculateMasteryLevel: SubmissionService.calculateMasteryLevel,
  getAssignmentAnalytics: SubmissionService.getAssignmentAnalytics,
} as const;
