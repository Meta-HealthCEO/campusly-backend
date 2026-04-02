import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { PaymentGatewayService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class PaymentGatewayController {
  static async getConfig(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const config = await PaymentGatewayService.getConfig(schoolId);
    res.json(apiResponse(true, config));
  }

  static async upsertConfig(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const config = await PaymentGatewayService.upsertConfig(schoolId, req.body);
    res.json(apiResponse(true, config, 'Payment gateway configuration saved'));
  }

  static async initiatePayment(req: Request, res: Response): Promise<void> {
    const userId = getUser(req).id;
    const schoolId = req.user!.schoolId!;
    const result = await PaymentGatewayService.initiatePayment(userId, schoolId, req.body);
    res.status(201).json(apiResponse(true, result, 'Payment initiated'));
  }

  static async initiateWalletTopup(req: Request, res: Response): Promise<void> {
    const userId = getUser(req).id;
    const schoolId = req.user!.schoolId!;
    const result = await PaymentGatewayService.initiateWalletTopup(userId, schoolId, req.body);
    res.status(201).json(apiResponse(true, result, 'Wallet top-up initiated'));
  }

  /**
   * PayFast ITN webhook — NO authentication.
   * PayFast sends POST data directly to this endpoint.
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    const data = req.body as Record<string, string>;
    await PaymentGatewayService.handleWebhook(data);
    // PayFast expects a 200 OK with no specific body
    res.status(200).send('OK');
  }

  static async getPaymentStatus(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const payment = await PaymentGatewayService.getPaymentStatus(
      req.params.id as string,
      schoolId,
    );
    res.json(apiResponse(true, payment));
  }

  static async listPayments(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await PaymentGatewayService.listPayments(
      schoolId,
      {
        status: req.query.status as string | undefined,
        parentId: req.query.parentId as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
      },
      req.query.page ? Number(req.query.page) : undefined,
      req.query.limit ? Number(req.query.limit) : undefined,
    );
    res.json(apiResponse(true, result));
  }

  static async refundPayment(req: Request, res: Response): Promise<void> {
    const userId = getUser(req).id;
    const schoolId = req.user!.schoolId!;
    const result = await PaymentGatewayService.refundPayment(userId, schoolId, req.body);
    res.json(apiResponse(true, result, 'Payment refunded'));
  }

  static async getPaymentAnalytics(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const analytics = await PaymentGatewayService.getPaymentAnalytics(schoolId);
    res.json(apiResponse(true, analytics));
  }
}
