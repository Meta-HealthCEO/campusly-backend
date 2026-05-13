import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Subscription, Plan } from './model.js';
import { SubscriptionService, SubscriptionStartCheckoutError } from './service.js';
import { checkoutInputSchema } from './validation.js';

function schoolIdFromReq(req: Request): mongoose.Types.ObjectId {
  const raw = req.user!.schoolId;
  if (!raw) throw new Error('Authenticated user has no schoolId');
  return new mongoose.Types.ObjectId(raw);
}

function userIdFromReq(req: Request): mongoose.Types.ObjectId {
  const raw = req.user!.id;
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

  static async checkout(req: Request, res: Response): Promise<void> {
    const parsed = checkoutInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', issues: parsed.error.issues });
      return;
    }
    try {
      const result = await SubscriptionService.startCheckout({
        userId: userIdFromReq(req),
        schoolId: schoolIdFromReq(req),
        planCode: parsed.data.planCode,
      });
      res.json({ data: result });
    } catch (err: unknown) {
      if (err instanceof SubscriptionStartCheckoutError) {
        if (err.code === 'CARD_EXISTS') { res.status(409).json({ error: err.message }); return; }
        if (err.code === 'NOT_PURCHASABLE') { res.status(400).json({ error: err.message }); return; }
        if (err.code === 'PLAN_NOT_FOUND') { res.status(404).json({ error: err.message }); return; }
        if (err.code === 'NO_SUBSCRIPTION') { res.status(404).json({ error: err.message }); return; }
      }
      throw err;
    }
  }
}
