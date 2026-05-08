import type { Request, Response } from 'express';
import { z } from 'zod/v4';
import {
  createBatch,
  getBatch,
  cancelBatch,
  confirmBatch,
} from './service-marking-batch.js';
import { apiResponse } from '../../common/utils.js';
import { getUser } from '../../types/authenticated-request.js';
import { BadRequestError } from '../../common/errors.js';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

const createBatchBodySchema = z
  .object({
    paperId: objectIdSchema,
    paperType: z.enum(['generated', 'assessment']).default('assessment'),
    classId: objectIdSchema,
  })
  .strict();

const confirmBodySchema = z
  .object({
    assignments: z
      .array(
        z.object({
          imageFilenames: z.array(z.string()).min(1),
          studentId: objectIdSchema,
          studentName: z.string().min(1).max(200),
        }),
      )
      .min(1),
  })
  .strict();

function requireSchoolId(schoolId: string | undefined): string {
  if (!schoolId) throw new BadRequestError('User must be assigned to a school');
  return schoolId;
}

export async function postCreateBatch(req: Request, res: Response): Promise<void> {
  const user = getUser(req);
  const schoolId = requireSchoolId(user.schoolId);
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new BadRequestError('No images provided');
  const parsed = createBatchBodySchema.parse(req.body);
  const batch = await createBatch({
    teacherId: user.id,
    schoolId,
    paperId: parsed.paperId,
    paperType: parsed.paperType,
    classId: parsed.classId,
    files,
  });
  res.status(201).json(apiResponse(true, batch, 'Batch created'));
}

export async function getBatchHandler(req: Request, res: Response): Promise<void> {
  const user = getUser(req);
  const schoolId = requireSchoolId(user.schoolId);
  const batch = await getBatch(req.params.id as string, schoolId);
  res.status(200).json(apiResponse(true, batch, 'OK'));
}

export async function postConfirmBatch(req: Request, res: Response): Promise<void> {
  const user = getUser(req);
  const schoolId = requireSchoolId(user.schoolId);
  const parsed = confirmBodySchema.parse(req.body);
  const result = await confirmBatch(
    req.params.id as string,
    schoolId,
    user.id,
    parsed.assignments,
  );
  res.status(200).json(apiResponse(true, result, 'Markings spawned'));
}

export async function deleteBatchHandler(req: Request, res: Response): Promise<void> {
  const user = getUser(req);
  const schoolId = requireSchoolId(user.schoolId);
  await cancelBatch(req.params.id as string, schoolId);
  res.status(204).end();
}
