import { Router } from 'express';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { DigestController } from './controller.js';
import { updatePreferencesSchema } from './validation.js';

const router = Router();

// Preferences — parent only
router.get('/preferences', authorize('parent'), DigestController.getPreferences);
router.put('/preferences', authorize('parent'), validate(updatePreferencesSchema), DigestController.updatePreferences);

// Preview digests — parent only
router.get('/preview/morning', authorize('parent'), DigestController.previewMorningDigest);
router.get('/preview/evening', authorize('parent'), DigestController.previewEveningDigest);
router.get('/preview/weekly', authorize('parent'), DigestController.previewWeeklyDigest);

export default router;
