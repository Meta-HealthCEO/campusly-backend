import { Router } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { NoticeBoardController } from './controller.js';
import { createPostSchema, updatePostSchema, myFeedQuerySchema, listPostsQuerySchema } from './validation.js';

const router = Router();

// Feed — accessible by all authenticated users
router.get('/my-feed', validate({ query: myFeedQuerySchema }), NoticeBoardController.getMyFeed);

// List posts — accessible by all authenticated users (query: scope, scopeId)
router.get('/', validate({ query: listPostsQuerySchema }), NoticeBoardController.listPosts);

// Create post — teachers and admins only
router.post(
  '/',
  authorize('teacher', 'school_admin'),
  validate(createPostSchema),
  NoticeBoardController.createPost,
);

// Update post — teachers and admins only
router.put(
  '/:id',
  authorize('teacher', 'school_admin'),
  validate(updatePostSchema),
  NoticeBoardController.updatePost,
);

// Delete post — teachers and admins only
router.delete(
  '/:id',
  authorize('teacher', 'school_admin'),
  NoticeBoardController.deletePost,
);

// Toggle pin — teachers and admins only
router.patch(
  '/:id/pin',
  authorize('teacher', 'school_admin'),
  NoticeBoardController.togglePin,
);

export default router;
