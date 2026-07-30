import { Request, Response } from 'express';
import { FundraisingService } from './service.js';
import { apiResponse } from '../../common/utils.js';
import { resolveSchoolScope, requireSchoolScope } from '../../common/school-scope.js';

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
      schoolId: resolveSchoolScope(req),
    };

    const result = await FundraisingService.listCampaigns(query);
    res.json(apiResponse(true, result, 'Campaigns retrieved successfully'));
  }

  static async getCampaign(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const campaign = await FundraisingService.getCampaign(req.params.id as string, schoolId);
    res.json(apiResponse(true, campaign, 'Campaign retrieved successfully'));
  }

  static async updateCampaign(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const campaign = await FundraisingService.updateCampaign(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, campaign, 'Campaign updated successfully'));
  }

  static async deleteCampaign(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await FundraisingService.deleteCampaign(req.params.id as string, schoolId);
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
      schoolId: resolveSchoolScope(req),
    };

    const result = await FundraisingService.listDonations(query);
    res.json(apiResponse(true, result, 'Donations retrieved successfully'));
  }

  static async getDonation(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const donation = await FundraisingService.getDonation(req.params.id as string, schoolId);
    res.json(apiResponse(true, donation, 'Donation retrieved successfully'));
  }

  static async deleteDonation(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await FundraisingService.deleteDonation(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Donation deleted successfully'));
  }

  // ─── Raffle ─────────────────────────────────────────────────────────────────

  static async listRaffles(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      campaignId: req.query.campaignId as string | undefined,
      schoolId: resolveSchoolScope(req),
    };

    const result = await FundraisingService.listRaffles(query);
    res.json(apiResponse(true, result, 'Raffles retrieved successfully'));
  }

  static async createRaffle(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const raffle = await FundraisingService.createRaffle(req.body, schoolId);
    res.status(201).json(apiResponse(true, raffle, 'Raffle created successfully'));
  }

  static async buyTickets(req: Request, res: Response): Promise<void> {
    const tickets = await FundraisingService.buyTickets(req.body);
    res.status(201).json(apiResponse(true, tickets, 'Tickets purchased successfully'));
  }

  static async drawWinners(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const winners = await FundraisingService.drawWinners(req.params.id as string, schoolId);
    res.json(apiResponse(true, winners, 'Winners drawn successfully'));
  }

  static async getTicketsByParent(req: Request, res: Response): Promise<void> {
    const parentId = req.params.parentId as string;
    const raffleId = req.query.raffleId as string | undefined;
    const tickets = await FundraisingService.getTicketsByParent(parentId, raffleId);
    res.json(apiResponse(true, tickets, 'Tickets retrieved successfully'));
  }

  // ─── Campaign Progress ──────────────────────────────────────────────────

  static async getCampaignProgress(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await FundraisingService.getCampaignProgress(req.params.campaignId as string, schoolId);
    res.json(apiResponse(true, result, 'Campaign progress retrieved successfully'));
  }

  // ─── Tax Certificate ────────────────────────────────────────────────────

  static async generateTaxCertificate(req: Request, res: Response): Promise<void> {
    const certificate = await FundraisingService.generateTaxCertificate(req.body);
    res.status(201).json(apiResponse(true, certificate, 'Tax certificate generated successfully'));
  }

  static async getTaxCertificate(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const certificate = await FundraisingService.getTaxCertificateById(req.params.id as string, schoolId);
    res.json(apiResponse(true, certificate, 'Tax certificate retrieved successfully'));
  }

  static async listTaxCertificates(req: Request, res: Response): Promise<void> {
    const schoolId = requireSchoolScope(req);
    const donorName = req.query.donorName as string | undefined;

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    if (donorName) {
      const result = await FundraisingService.listTaxCertificatesByDonor(donorName, schoolId, query);
      res.json(apiResponse(true, result, 'Tax certificates retrieved successfully'));
      return;
    }

    const result = await FundraisingService.listTaxCertificatesBySchool(schoolId, query);
    res.json(apiResponse(true, result, 'Tax certificates retrieved successfully'));
  }

  // ─── Donor Wall ─────────────────────────────────────────────────────────

  static async addDonorWallEntry(req: Request, res: Response): Promise<void> {
    const entry = await FundraisingService.addDonorWallEntry(req.body);
    res.status(201).json(apiResponse(true, entry, 'Donor wall entry added successfully'));
  }

  static async listDonorWall(req: Request, res: Response): Promise<void> {
    const campaignId = req.params.campaignId as string;
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await FundraisingService.listDonorWallByCampaign(campaignId, query);
    res.json(apiResponse(true, result, 'Donor wall retrieved successfully'));
  }

  // ─── Recurring Donation ─────────────────────────────────────────────────

  static async createRecurringDonation(req: Request, res: Response): Promise<void> {
    const recurring = await FundraisingService.createRecurringDonation(req.body);
    res.status(201).json(apiResponse(true, recurring, 'Recurring donation created successfully'));
  }

  static async listRecurringDonations(req: Request, res: Response): Promise<void> {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      schoolId: resolveSchoolScope(req),
      campaignId: req.query.campaignId as string | undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    };

    const result = await FundraisingService.listRecurringDonations(query);
    res.json(apiResponse(true, result, 'Recurring donations retrieved successfully'));
  }

  static async getRecurringDonation(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const recurring = await FundraisingService.getRecurringDonation(req.params.id as string, schoolId);
    res.json(apiResponse(true, recurring, 'Recurring donation retrieved successfully'));
  }

  static async cancelRecurringDonation(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const recurring = await FundraisingService.cancelRecurringDonation(req.params.id as string, schoolId);
    res.json(apiResponse(true, recurring, 'Recurring donation cancelled successfully'));
  }

  static async processRecurringDonations(req: Request, res: Response): Promise<void> {
    const result = await FundraisingService.processRecurringDonations();
    res.json(apiResponse(true, result, 'Recurring donations processed successfully'));
  }
}
