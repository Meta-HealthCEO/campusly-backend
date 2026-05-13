import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Subscription, Plan } from './model.js';
import { SubscriptionService } from './service.js';

function schoolIdFromReq(req: Request): mongoose.Types.ObjectId {
  const raw = req.user!.schoolId;
  if (!raw) throw new Error('Authenticated user has no schoolId');
  return new mongoose.Types.ObjectId(raw);
}

export class SubscriptionController {
  static async listPlans(_req: Request, res: Response): Promise<void> {
    const plans = await Plan.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({ data: plans });
  }

  static async getMine(req: Request, res: Response): Promise<void> {
    const schoolId = schoolIdFromReq(req);
    const existing = await Subscription.findOne({ schoolId });
    if (!existing) {
      await SubscriptionService.createInitialFreeSubscription(schoolId);
    }
    const sub = await Subscription.findOne({ schoolId });
    if (!sub) throw new Error('Subscription creation failed');
    const plan = await Plan.findOne({ code: sub.planCode });
    res.json({ data: { subscription: sub, plan } });
  }
}
