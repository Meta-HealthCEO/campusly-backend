import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { SgbController } from './controller.js';
import {
  inviteSgbMemberSchema,
  updateSgbMemberSchema,
  createMeetingSchema,
  updateMeetingSchema,
  recordMinutesSchema,
  createResolutionSchema,
  castVoteSchema,
  proposePolicySchema,
  upsertSipSchema,
} from './validation.js';

const router = Router();

// File upload config for SGB documents
const storage = multer.diskStorage({
  destination: 'uploads/sgb/',
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.ms-excel',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and XLSX files are allowed'));
    }
  },
});

const sgbRead = authorize('sgb_member', 'school_admin', 'super_admin');
const adminWrite = authorize('school_admin', 'super_admin');

// ─── Members ────────────────────────────────────────────────────────────────
router.post('/members/invite', adminWrite, validate(inviteSgbMemberSchema), SgbController.inviteMember);
router.get('/members', sgbRead, SgbController.listMembers);
router.put('/members/:id', adminWrite, validate(updateSgbMemberSchema), SgbController.updateMember);
router.delete('/members/:id', adminWrite, SgbController.deleteMember);

// ─── Finance ────────────────────────────────────────────────────────────────
router.get('/finance/summary', sgbRead, SgbController.getFinanceSummary);
router.get('/finance/trends', sgbRead, SgbController.getFinanceTrends);

// ─── Enrollment ─────────────────────────────────────────────────────────────
router.get('/enrollment/summary', sgbRead, SgbController.getEnrollmentSummary);

// ─── Meetings ───────────────────────────────────────────────────────────────
router.post('/meetings', adminWrite, validate(createMeetingSchema), SgbController.createMeeting);
router.get('/meetings', sgbRead, SgbController.listMeetings);
router.get('/meetings/:id', sgbRead, SgbController.getMeeting);
router.put('/meetings/:id', adminWrite, validate(updateMeetingSchema), SgbController.updateMeeting);
router.delete('/meetings/:id', adminWrite, SgbController.deleteMeeting);
router.put('/meetings/:id/minutes', adminWrite, validate(recordMinutesSchema), SgbController.recordMinutes);

// ─── Resolutions ────────────────────────────────────────────────────────────
router.post('/meetings/:meetingId/resolutions', adminWrite, validate(createResolutionSchema), SgbController.createResolution);
router.get('/resolutions', sgbRead, SgbController.listResolutions);
router.post('/resolutions/:id/vote', sgbRead, validate(castVoteSchema), SgbController.castVote);

// ─── Documents ──────────────────────────────────────────────────────────────
router.post('/documents', adminWrite, upload.single('file'), SgbController.uploadDocument);
router.get('/documents', sgbRead, SgbController.listDocuments);
router.get('/documents/:id/download', sgbRead, SgbController.downloadDocument);
router.delete('/documents/:id', adminWrite, SgbController.deleteDocument);

// ─── Policies ───────────────────────────────────────────────────────────────
router.post('/policies/propose', adminWrite, validate(proposePolicySchema), SgbController.proposePolicy);
router.get('/policies/compliance', sgbRead, SgbController.getCompliance);

// ─── School Improvement Plan ────────────────────────────────────────────────
router.get('/sip', sgbRead, SgbController.getSip);
router.put('/sip', adminWrite, validate(upsertSipSchema), SgbController.upsertSip);

export default router;
