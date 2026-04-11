import { Router, type Request, type Response } from 'express';
import { apiResponse } from '../../common/utils.js';
import { CourseCertificateService } from './service-certificates.js';

const router = Router();

/**
 * PUBLIC — verify a certificate by its verification code. This is the
 * ONLY un-authenticated endpoint in the entire Course module.
 *
 * Returns:
 *   - { valid: true, studentName, courseName, schoolName, issuedAt } on
 *     success
 *   - { valid: false } for unknown / invalid / malformed codes
 *
 * The endpoint deliberately leaks the four snapshotted identity fields
 * on success — that is the entire point of a verification endpoint.
 */
router.get('/verify/:code', async (req: Request, res: Response): Promise<void> => {
  const result = await CourseCertificateService.verifyCertificate(
    req.params.code as string,
  );
  res.json(apiResponse(true, result));
});

export default router;
