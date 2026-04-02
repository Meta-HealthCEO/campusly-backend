import { Router } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { SchoolNewsController } from './controller.js';
import { createArticleSchema, updateArticleSchema, generateArticleSchema } from './validation.js';

const router = Router();

// Public-ish feeds (all authenticated users)
router.get('/feed', SchoolNewsController.getNewsFeed);
router.get('/featured', SchoolNewsController.getFeaturedArticles);

// List all articles (admin view with filters)
router.get('/', SchoolNewsController.listArticles);

// Single article
router.get('/:id', SchoolNewsController.getArticle);

// Create manually — teachers and admins
router.post(
  '/',
  authorize('teacher', 'school_admin'),
  validate(createArticleSchema),
  SchoolNewsController.createArticle,
);

// Generate via AI — teachers and admins
router.post(
  '/generate',
  authorize('teacher', 'school_admin'),
  validate(generateArticleSchema),
  SchoolNewsController.generateArticle,
);

// Update article — teachers and admins
router.put(
  '/:id',
  authorize('teacher', 'school_admin'),
  validate(updateArticleSchema),
  SchoolNewsController.updateArticle,
);

// Publish — school_admin only
router.patch(
  '/:id/publish',
  authorize('school_admin'),
  SchoolNewsController.publishArticle,
);

// Archive — school_admin only
router.patch(
  '/:id/archive',
  authorize('school_admin'),
  SchoolNewsController.archiveArticle,
);

// Delete — school_admin only
router.delete(
  '/:id',
  authorize('school_admin'),
  SchoolNewsController.deleteArticle,
);

export default router;
