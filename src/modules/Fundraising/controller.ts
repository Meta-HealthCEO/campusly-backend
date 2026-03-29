import { Request, Response } from 'express';
import { FundraisingService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class FundraisingController {
  // ─── Campaign ─────────────────────────────────────────────────────────────

  static async createCampaign(req: Request, res: Response): Promise<void> {
    const campaign = await FundraisingService.createCampaign(req.body);
    res.status(201).json(apiResponse(true, campaign, 'Campaign created successfully'));
  }

  static async listCampaigns(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
    };

    const result = await FundraisingService.listCampaigns(query);
    res.json(apiResponse(true, result, 'Campaigns retrieved successfully'));
  }

  static async getCampaign(req: Request, res: Response): Promise<void> {
    const campaign = await FundraisingService.getCampaign(req.params.id as string);
    res.json(apiResponse(true, campaign, 'Campaign retrieved successfully'));
  }

  static async updateCampaign(req: Request, res: Response): Promise<void> {
    const campaign = await FundraisingService.updateCampaign(req.params.id as string, req.body);
    res.json(apiResponse(true, campaign, 'Campaign updated successfully'));
  }

  static async deleteCampaign(req: Request, res: Response): Promise<void> {
    await FundraisingService.deleteCampaign(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Campaign deleted successfully'));
  }

  // ─── Donation ─────────────────────────────────────────────────────────────

  static async recordDonation(req: Request, res: Response): Promise<void> {
    const donation = await FundraisingService.recordDonation(req.body);
    res.status(201).json(apiResponse(true, donation, 'Donation recorded successfully'));
  }

  static async listDonations(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      campaignId: req.query.campaignId as string | undefined,
      schoolId: (req.query.schoolId as string) ?? req.user?.schoolId,
    };

    const result = await FundraisingService.listDonations(query);
    res.json(apiResponse(true, result, 'Donations retrieved successfully'));
  }

  static async getDonation(req: Request, res: Response): Promise<void> {
    const donation = await FundraisingService.getDonation(req.params.id as string);
    res.json(apiResponse(true, donation, 'Donation retrieved successfully'));
  }

  static async deleteDonation(req: Request, res: Response): Promise<void> {
    await FundraisingService.deleteDonation(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Donation deleted successfully'));
  }

  // ─── Raffle ─────────────────────────────────────────────────────────────────

  static async createRaffle(req: Request, res: Response): Promise<void> {
    const raffle = await FundraisingService.createRaffle(req.body);
    res.status(201).json(apiResponse(true, raffle, 'Raffle created successfully'));
  }

  static async buyTickets(req: Request, res: Response): Promise<void> {
    const tickets = await FundraisingService.buyTickets(req.body);
    res.status(201).json(apiResponse(true, tickets, 'Tickets purchased successfully'));
  }

  static async drawWinners(req: Request, res: Response): Promise<void> {
    const winners = await FundraisingService.drawWinners(req.params.id as string);
    res.json(apiResponse(true, winners, 'Winners drawn successfully'));
  }

  static async getTicketsByParent(req: Request, res: Response): Promise<void> {
    const parentId = req.params.parentId as string;
    const raffleId = req.query.raffleId as string | undefined;
    const tickets = await FundraisingService.getTicketsByParent(parentId, raffleId);
    res.json(apiResponse(true, tickets, 'Tickets retrieved successfully'));
  }
}
