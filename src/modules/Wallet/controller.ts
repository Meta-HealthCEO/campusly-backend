import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { WalletService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class WalletController {
  static async createWallet(req: Request, res: Response): Promise<void> {
    const wallet = await WalletService.createWallet(req.body);
    res.status(201).json(apiResponse(true, wallet, 'Wallet created successfully'));
  }

  static async getWallet(req: Request, res: Response): Promise<void> {
    const wallet = await WalletService.getWallet(req.params.studentId as string);
    res.json(apiResponse(true, wallet));
  }

  static async loadMoney(req: Request, res: Response): Promise<void> {
    const { amount, description } = req.body;
    const wallet = await WalletService.loadMoney(
      req.params.walletId as string,
      amount,
      description,
      getUser(req).id,
    );
    res.json(apiResponse(true, wallet, 'Money loaded successfully'));
  }

  static async deductMoney(req: Request, res: Response): Promise<void> {
    const { amount, description } = req.body;
    const wallet = await WalletService.deductMoney(
      req.params.walletId as string,
      amount,
      description,
      getUser(req).id,
    );
    res.json(apiResponse(true, wallet, 'Money deducted successfully'));
  }

  static async getTransactions(req: Request, res: Response): Promise<void> {
    const result = await WalletService.getTransactions(req.params.walletId as string, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async linkWristband(req: Request, res: Response): Promise<void> {
    const wristband = await WalletService.linkWristband(req.body);
    res.status(201).json(apiResponse(true, wristband, 'Wristband linked successfully'));
  }

  static async unlinkWristband(req: Request, res: Response): Promise<void> {
    const wristband = await WalletService.unlinkWristband(req.params.wristbandId as string);
    res.json(apiResponse(true, wristband, 'Wristband unlinked successfully'));
  }

  static async updateDailyLimit(req: Request, res: Response): Promise<void> {
    const wallet = await WalletService.updateDailyLimit(
      req.params.walletId as string,
      req.body.dailyLimit,
    );
    res.json(apiResponse(true, wallet, 'Daily limit updated successfully'));
  }
}
