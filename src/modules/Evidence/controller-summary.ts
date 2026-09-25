// src/modules/Evidence/controller-summary.ts
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { apiResponse } from '../../common/utils.js';
import { getUser } from '../../types/authenticated-request.js';
import { classAccess, learnerAccess, meAsLearner } from './access.js';
import { classTopics, learnerRows, learnerTopics } from './service-summary.js';

interface TopicsQuery { subjectId: string; from?: Date; to?: Date }
interface RowsQuery { subjectId?: string; topicNodeId?: string; cursor?: string; limit: number }
const oid = (id: string): mongoose.Types.ObjectId => new mongoose.Types.ObjectId(id);

export const SummaryController = {
  async learnerTopics(req: Request, res: Response): Promise<void> {
    const a = await learnerAccess(getUser(req), req.params.studentId as string);
    const q = req.query as unknown as TopicsQuery;
    res.json(apiResponse(true, await learnerTopics({ ...a, subjectId: oid(q.subjectId), from: q.from, to: q.to })));
  },
  async myTopics(req: Request, res: Response): Promise<void> {
    const me = await meAsLearner(getUser(req));
    const q = req.query as unknown as TopicsQuery;
    res.json(apiResponse(true, await learnerTopics({ ...me, subjectId: oid(q.subjectId), from: q.from, to: q.to, learnerView: true })));
  },
  async classTopics(req: Request, res: Response): Promise<void> {
    const a = await classAccess(getUser(req), req.params.classId as string);
    const q = req.query as unknown as TopicsQuery;
    res.json(apiResponse(true, await classTopics({ ...a, subjectId: oid(q.subjectId) })));
  },
  async learnerRows(req: Request, res: Response): Promise<void> {
    const a = await learnerAccess(getUser(req), req.params.studentId as string);
    res.json(apiResponse(true, await learnerRows({ ...a, ...(req.query as unknown as RowsQuery), learnerView: false })));
  },
  async myRows(req: Request, res: Response): Promise<void> {
    const me = await meAsLearner(getUser(req));
    res.json(apiResponse(true, await learnerRows({ ...me, ...(req.query as unknown as RowsQuery), learnerView: true })));
  },
};
