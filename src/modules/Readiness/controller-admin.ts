// src/modules/Readiness/controller-admin.ts
import type { Request, Response } from 'express';
import { apiResponse } from '../../common/utils.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { getUser } from '../../types/authenticated-request.js';
import { ExamBlueprint } from './model-blueprint.js';
import { blueprintData, copyBlueprint, importDraft, patchVerification, publishBlueprint, reportFor, validateRaw } from './blueprint-service.js';
import { isBlueprintVerified } from './blueprint-validate.js';

/** Super-admin blueprint API (spec §6.3). Publishing will also queue a recompute of the family once Task 9 lands (ledger ruling R4). */
export const AdminController = {
  async list(req: Request, res: Response): Promise<void> {
    const q = req.query as unknown as { status?: string; family?: string; examYear?: number; page: number; limit: number };
    const filter = { isDeleted: false, ...(q.status ? { status: q.status } : {}), ...(q.family ? { family: q.family } : {}), ...(q.examYear ? { examYear: q.examYear } : {}) };
    const [rows, total] = await Promise.all([
      ExamBlueprint.find(filter).sort({ examYear: -1, family: 1, version: -1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
      ExamBlueprint.countDocuments(filter),
    ]);
    res.json(apiResponse(true, { rows, total, page: q.page, limit: q.limit }));
  },
  async one(req: Request, res: Response): Promise<void> {
    const doc = await ExamBlueprint.findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) throw new NotFoundError('Blueprint not found');
    res.json(apiResponse(true, { blueprint: doc, report: await reportFor(doc), verified: isBlueprintVerified(blueprintData(doc)) }));
  },
  async validate(req: Request, res: Response): Promise<void> {
    res.json(apiResponse(true, await validateRaw(req.body)));
  },
  async import(req: Request, res: Response): Promise<void> {
    const { report, blueprint, changed } = await importDraft(req.body);
    if (!blueprint) throw new BadRequestError([...report.parseErrors, ...report.errors].join('; '));
    res.status(201).json(apiResponse(true, { blueprint, report, changed }));
  },
  async patch(req: Request, res: Response): Promise<void> {
    const doc = await patchVerification(req.params.id as string, req.body);
    res.json(apiResponse(true, doc));
  },
  async publish(req: Request, res: Response): Promise<void> {
    const doc = await publishBlueprint(req.params.id as string, getUser(req).id, (req.body as { acknowledgeWarnings: boolean }).acknowledgeWarnings);
    res.json(apiResponse(true, doc));
  },
  async copy(req: Request, res: Response): Promise<void> {
    res.status(201).json(apiResponse(true, await copyBlueprint(req.params.id as string, (req.body as { examYear: number }).examYear)));
  },
};
