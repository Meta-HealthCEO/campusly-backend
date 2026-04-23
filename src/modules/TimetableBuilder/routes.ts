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

const adminOrTeacher = authorize('school_admin', 'super_admin', 'teacher');

// ─── Config ─────────────────────────────────────────────────────────────────

router.get('/config', adminOrTeacher, TimetableBuilderController.getConfig);
router.put('/config', requireCapability('manage_school_config'), validate(configSchema), TimetableBuilderController.updateConfig);

// ─── Requirements ───────────────────────────────────────────────────────────

router.get('/requirements', adminOrTeacher, TimetableBuilderController.listRequirements);
router.post('/requirements', requireCapability('manage_academic_setup'), validate(requirementSchema), TimetableBuilderController.upsertRequirement);
router.put('/requirements/:id', requireCapability('manage_academic_setup'), validate(requirementSchema), TimetableBuilderController.upsertRequirement);
router.delete('/requirements/:id', requireCapability('manage_academic_setup'), TimetableBuilderController.deleteRequirement);

// ─── Teacher Availability ───────────────────────────────────────────────────

router.get('/availability', adminOrTeacher, TimetableBuilderController.listAvailability);
router.get('/availability/:teacherId', adminOrTeacher, TimetableBuilderController.getTeacherAvailability);
router.put('/availability/:teacherId', requireCapability('manage_academic_setup'), validate(availabilitySchema), TimetableBuilderController.updateAvailability);

// ─── Subject Lines (FET) ────────────────────────────────────────────────────

router.get('/lines', adminOrTeacher, TimetableBuilderController.listLines);
router.post('/lines', requireCapability('manage_academic_setup'), validate(lineSchema), TimetableBuilderController.upsertLine);
router.post('/lines/suggest', requireCapability('manage_academic_setup'), validate(lineSuggestSchema), TimetableBuilderController.suggestLines);
router.put('/lines/:id', requireCapability('manage_academic_setup'), validate(lineSchema), TimetableBuilderController.updateLine);
router.delete('/lines/:id', requireCapability('manage_academic_setup'), TimetableBuilderController.deleteLine);

// ─── Generate ───────────────────────────────────────────────────────────────

router.post('/generate', requireCapability('manage_academic_setup'), validate(generateSchema), TimetableBuilderController.generate);
router.get('/generation/:id', adminOrTeacher, TimetableBuilderController.getGeneration);
router.post('/generation/:id/commit', requireCapability('manage_academic_setup'), TimetableBuilderController.commitGeneration);

export default router;
