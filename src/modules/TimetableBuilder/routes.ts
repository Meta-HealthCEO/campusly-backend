import express from 'express';
import { authorize } from '../../middleware/rbac.js';
import { requireCapability } from '../../middleware/capability.js';
import { validate } from '../../middleware/validate.js';
import { TimetableBuilderController } from './controller.js';
import {
  configSchema,
  requirementSchema,
  availabilitySchema,
  lineSchema,
  generateSchema,
  lineSuggestSchema,
} from './validation.js';

const router = express.Router();

const adminOnly = authorize('school_admin', 'super_admin');
const adminOrTeacher = authorize('school_admin', 'super_admin', 'teacher');

// ─── Config ─────────────────────────────────────────────────────────────────

router.get('/config', adminOrTeacher, TimetableBuilderController.getConfig);
router.put('/config', requireCapability('manage_school_config'), validate(configSchema), TimetableBuilderController.updateConfig);

// ─── Requirements ───────────────────────────────────────────────────────────

router.get('/requirements', adminOnly, TimetableBuilderController.listRequirements);
router.post('/requirements', adminOnly, validate(requirementSchema), TimetableBuilderController.upsertRequirement);
router.put('/requirements/:id', adminOnly, validate(requirementSchema), TimetableBuilderController.upsertRequirement);
router.delete('/requirements/:id', adminOnly, TimetableBuilderController.deleteRequirement);

// ─── Teacher Availability ───────────────────────────────────────────────────

router.get('/availability', adminOnly, TimetableBuilderController.listAvailability);
router.get('/availability/:teacherId', adminOnly, TimetableBuilderController.getTeacherAvailability);
router.put('/availability/:teacherId', adminOnly, validate(availabilitySchema), TimetableBuilderController.updateAvailability);

// ─── Subject Lines (FET) ────────────────────────────────────────────────────

router.get('/lines', adminOnly, TimetableBuilderController.listLines);
router.post('/lines', adminOnly, validate(lineSchema), TimetableBuilderController.upsertLine);
router.post('/lines/suggest', adminOnly, validate(lineSuggestSchema), TimetableBuilderController.suggestLines);
router.put('/lines/:id', adminOnly, validate(lineSchema), TimetableBuilderController.updateLine);
router.delete('/lines/:id', adminOnly, TimetableBuilderController.deleteLine);

// ─── Generate ───────────────────────────────────────────────────────────────

router.post('/generate', adminOnly, validate(generateSchema), TimetableBuilderController.generate);
router.get('/generation/:id', adminOnly, TimetableBuilderController.getGeneration);
router.post('/generation/:id/commit', adminOnly, TimetableBuilderController.commitGeneration);

export default router;
