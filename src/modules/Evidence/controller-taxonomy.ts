// src/modules/Evidence/controller-taxonomy.ts
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { apiResponse } from '../../common/utils.js';
import { getUser } from '../../types/authenticated-request.js';
import { approveType, listTypes, mergeType, renameType, retireType } from './taxonomy-admin.js';
import type { TypeStatus } from './model-taxonomy.js';

const oid = (id: string): mongoose.Types.ObjectId => new mongoose.Types.ObjectId(id);
const me = (req: Request): mongoose.Types.ObjectId => oid(getUser(req).id);

export const TaxonomyController = {
  async list(req: Request, res: Response): Promise<void> {
    const q = req.query as { status?: TypeStatus; topicNodeId?: string; limit?: number };
    res.json(apiResponse(true, await listTypes(q)));
  },
  async approve(req: Request, res: Response): Promise<void> {
    await approveType(oid(req.params.id as string), me(req));
    res.status(204).end();
  },
  async rename(req: Request, res: Response): Promise<void> {
    await renameType(oid(req.params.id as string), req.body as { label?: string; learnerLabel?: string; description?: string }, me(req));
    res.status(204).end();
  },
  async merge(req: Request, res: Response): Promise<void> {
    await mergeType(oid(req.params.id as string), oid((req.body as { intoId: string }).intoId), me(req));
    res.status(204).end();
  },
  async retire(req: Request, res: Response): Promise<void> {
    const { replacementId } = req.body as { replacementId?: string };
    await retireType(oid(req.params.id as string), replacementId ? oid(replacementId) : null, me(req));
    res.status(204).end();
  },
};
