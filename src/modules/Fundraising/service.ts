import {
  Campaign, ICampaign,
  Donation, IDonation,
  Raffle, IRaffle,
  RaffleTicket, IRaffleTicket,
  TaxCertificate, ITaxCertificate,
  DonorWall, IDonorWall,
  RecurringDonation, IRecurringDonation,
} from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
  CreateDonationInput,
  CreateRaffleInput,
  BuyRaffleTicketsInput,
  GenerateTaxCertificateInput,
  AddDonorWallInput,
  CreateRecurringDonationInput,
} from './validation.js';

interface ListCampaignQuery {
  page?: number;
  limit?: number;
  sort?: string;
  schoolId?: string;
  isActive?: boolean;
}

interface ListDonationQuery {
  page?: number;
  limit?: number;
  campaignId?: string;
  schoolId?: string;
}

export class FundraisingService {
  // ─── Campaign CRUD ────────────────────────────────────────────────────────

  static async createCampaign(data: CreateCampaignInput): Promise<ICampaign> {
    const campaign = await Campaign.create(data);
    return campaign;
  }

  static async listCampaigns(
    query: ListCampaignQuery,
  ): Promise<{
    campaigns: ICampaign[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);
    const sortField = query.sort ?? '-createdAt';

    const filter: Record<string, unknown> = {
      isDeleted: false,
    };

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter).sort(sortField).skip(skip).limit(limit),
      Campaign.countDocuments(filter),
    ]);

    return {
      campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getCampaign(id: string): Promise<ICampaign> {
    const campaign = await Campaign.findOne({ _id: id, isDeleted: false });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    return campaign;
  }

  static async updateCampaign(id: string, data: UpdateCampaignInput): Promise<ICampaign> {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    return campaign;
  }

  static async deleteCampaign(id: string): Promise<ICampaign> {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    return campaign;
  }

  // ─── Donation ─────────────────────────────────────────────────────────────

  static async recordDonation(data: CreateDonationInput): Promise<IDonation> {
    // Verify campaign exists
    const campaign = await Campaign.findOne({ _id: data.campaignId, isDeleted: false });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    // Create donation
    const donation = await Donation.create(data);

    // Update raised amount on campaign
    await Campaign.updateOne(
      { _id: data.campaignId },
      { $inc: { raisedAmount: data.amount } },
    );

    return donation;
  }

  static async listDonations(
    query: ListDonationQuery,
  ): Promise<{
    donations: IDonation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter: Record<string, unknown> = {
      isDeleted: false,
    };

    if (query.campaignId) {
      filter.campaignId = query.campaignId;
    }

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .populate('campaignId', 'title')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Donation.countDocuments(filter),
    ]);

    return {
      donations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getDonation(id: string): Promise<IDonation> {
    const donation = await Donation.findOne({ _id: id, isDeleted: false })
      .populate('campaignId', 'title');

    if (!donation) {
      throw new NotFoundError('Donation not found');
    }

    return donation;
  }

  static async deleteDonation(id: string): Promise<IDonation> {
    const donation = await Donation.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!donation) {
      throw new NotFoundError('Donation not found');
    }

    // Decrement raised amount on campaign
    await Campaign.updateOne(
      { _id: donation.campaignId },
      { $inc: { raisedAmount: -donation.amount } },
    );

    return donation;
  }

  // ─── Raffle ─────────────────────────────────────────────────────────────────

  static async createRaffle(data: CreateRaffleInput): Promise<IRaffle> {
    const campaign = await Campaign.findOne({ _id: data.campaignId, isDeleted: false });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    const raffle = await Raffle.create(data);
    return raffle;
  }

  static async buyTickets(data: BuyRaffleTicketsInput): Promise<IRaffleTicket[]> {
    const raffle = await Raffle.findOne({ _id: data.raffleId, isDeleted: false });

    if (!raffle) {
      throw new NotFoundError('Raffle not found');
    }

    if (raffle.soldTickets + data.quantity > raffle.totalTickets) {
      throw new BadRequestError('Not enough tickets available');
    }

    const raffleIdSuffix = data.raffleId.slice(-6);
    const tickets: IRaffleTicket[] = [];

    for (let i = 0; i < data.quantity; i++) {
      const ticketNum = raffle.soldTickets + i + 1;
      const ticketNumber = `RAFFLE-${raffleIdSuffix}-${String(ticketNum).padStart(5, '0')}`;

      const ticket = await RaffleTicket.create({
        raffleId: data.raffleId,
        parentId: data.parentId,
        studentId: data.studentId,
        ticketNumber,
      });

      tickets.push(ticket);
    }

    await Raffle.updateOne(
      { _id: data.raffleId },
      { $inc: { soldTickets: data.quantity } },
    );

    return tickets;
  }

  static async drawWinners(raffleId: string): Promise<IRaffleTicket[]> {
    const raffle = await Raffle.findOne({ _id: raffleId, isDeleted: false });

    if (!raffle) {
      throw new NotFoundError('Raffle not found');
    }

    if (raffle.winnersDrawn) {
      throw new BadRequestError('Winners have already been drawn for this raffle');
    }

    const tickets = await RaffleTicket.find({ raffleId, isDeleted: false });

    if (tickets.length === 0) {
      throw new BadRequestError('No tickets have been sold for this raffle');
    }

    // Shuffle tickets using Fisher-Yates algorithm
    const shuffled = [...tickets];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const winnerCount = Math.min(raffle.prizes.length, shuffled.length);
    const winners: IRaffleTicket[] = [];

    for (let i = 0; i < winnerCount; i++) {
      const ticket = await RaffleTicket.findByIdAndUpdate(
        shuffled[i]._id,
        { $set: { isWinner: true, prizePlace: raffle.prizes[i].place } },
        { new: true },
      );

      if (ticket) {
        winners.push(ticket);
      }
    }

    await Raffle.updateOne(
      { _id: raffleId },
      { $set: { winnersDrawn: true } },
    );

    return winners;
  }

  static async getTicketsByParent(parentId: string, raffleId?: string): Promise<IRaffleTicket[]> {
    const filter: Record<string, unknown> = { parentId, isDeleted: false };

    if (raffleId) {
      filter.raffleId = raffleId;
    }

    const tickets = await RaffleTicket.find(filter)
      .populate('raffleId')
      .sort('-purchasedAt');

    return tickets;
  }

  // ─── Campaign Progress ──────────────────────────────────────────────────

  static async getCampaignProgress(campaignId: string): Promise<{
    campaign: ICampaign;
    percentageComplete: number;
  }> {
    const campaign = await Campaign.findOne({ _id: campaignId, isDeleted: false });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    const percentageComplete = campaign.targetAmount > 0
      ? Math.round(((campaign.raisedAmount / campaign.targetAmount) * 100) * 100) / 100
      : 0;

    return { campaign, percentageComplete };
  }

  // ─── Tax Certificate (Section 18A) ──────────────────────────────────────

  static async generateTaxCertificate(data: GenerateTaxCertificateInput): Promise<ITaxCertificate> {
    // Verify donation exists
    const donation = await Donation.findOne({ _id: data.donationId, isDeleted: false });

    if (!donation) {
      throw new NotFoundError('Donation not found');
    }

    // Check if certificate already exists for this donation
    const existing = await TaxCertificate.findOne({ donationId: data.donationId, isDeleted: false });

    if (existing) {
      throw new BadRequestError('Tax certificate already exists for this donation');
    }

    // Generate unique certificate number: S18A-{schoolId-last6}-{YYYYMM}-{seq}
    const schoolIdSuffix = data.schoolId.slice(-6);
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `S18A-${schoolIdSuffix}-${yearMonth}`;

    // Count existing certificates with this prefix to determine sequence
    const count = await TaxCertificate.countDocuments({
      certificateNumber: { $regex: `^${prefix}` },
    });
    const seq = String(count + 1).padStart(4, '0');
    const certificateNumber = `${prefix}-${seq}`;

    const certificate = await TaxCertificate.create({
      donationId: data.donationId,
      schoolId: data.schoolId,
      certificateNumber,
      donorName: data.donorName,
      donorIdNumber: data.donorIdNumber,
      donorAddress: data.donorAddress,
      amount: donation.amount,
      dateIssued: now,
      schoolTaxNumber: data.schoolTaxNumber,
    });

    return certificate;
  }

  static async getTaxCertificateById(id: string): Promise<ITaxCertificate> {
    const certificate = await TaxCertificate.findOne({ _id: id, isDeleted: false })
      .populate('donationId');

    if (!certificate) {
      throw new NotFoundError('Tax certificate not found');
    }

    return certificate;
  }

  static async listTaxCertificatesBySchool(
    schoolId: string,
    query: { page?: number; limit?: number },
  ): Promise<{
    certificates: ITaxCertificate[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter = { schoolId, isDeleted: false };

    const [certificates, total] = await Promise.all([
      TaxCertificate.find(filter)
        .populate('donationId')
        .sort('-dateIssued')
        .skip(skip)
        .limit(limit),
      TaxCertificate.countDocuments(filter),
    ]);

    return {
      certificates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async listTaxCertificatesByDonor(
    donorName: string,
    schoolId: string,
    query: { page?: number; limit?: number },
  ): Promise<{
    certificates: ITaxCertificate[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter = {
      donorName: { $regex: new RegExp(donorName, 'i') },
      schoolId,
      isDeleted: false,
    };

    const [certificates, total] = await Promise.all([
      TaxCertificate.find(filter)
        .populate('donationId')
        .sort('-dateIssued')
        .skip(skip)
        .limit(limit),
      TaxCertificate.countDocuments(filter),
    ]);

    return {
      certificates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Donor Wall ─────────────────────────────────────────────────────────

  static async addDonorWallEntry(data: AddDonorWallInput): Promise<IDonorWall> {
    // Verify campaign exists
    const campaign = await Campaign.findOne({ _id: data.campaignId, isDeleted: false });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    // Verify donation exists
    const donation = await Donation.findOne({ _id: data.donationId, isDeleted: false });

    if (!donation) {
      throw new NotFoundError('Donation not found');
    }

    const entry = await DonorWall.create(data);
    return entry;
  }

  static async listDonorWallByCampaign(
    campaignId: string,
    query: { page?: number; limit?: number },
  ): Promise<{
    entries: IDonorWall[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter = { campaignId, isPublic: true, isDeleted: false };

    const [entries, total] = await Promise.all([
      DonorWall.find(filter)
        .sort('-amount')
        .skip(skip)
        .limit(limit),
      DonorWall.countDocuments(filter),
    ]);

    return {
      entries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Recurring Donation ─────────────────────────────────────────────────

  static async createRecurringDonation(data: CreateRecurringDonationInput): Promise<IRecurringDonation> {
    // Verify campaign exists
    const campaign = await Campaign.findOne({ _id: data.campaignId, isDeleted: false });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    const recurring = await RecurringDonation.create(data);
    return recurring;
  }

  static async listRecurringDonations(
    query: { page?: number; limit?: number; schoolId?: string; campaignId?: string; isActive?: boolean },
  ): Promise<{
    recurringDonations: IRecurringDonation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter: Record<string, unknown> = { isDeleted: false };

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.campaignId) {
      filter.campaignId = query.campaignId;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const [recurringDonations, total] = await Promise.all([
      RecurringDonation.find(filter)
        .populate('campaignId', 'title')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      RecurringDonation.countDocuments(filter),
    ]);

    return {
      recurringDonations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getRecurringDonation(id: string): Promise<IRecurringDonation> {
    const recurring = await RecurringDonation.findOne({ _id: id, isDeleted: false })
      .populate('campaignId', 'title');

    if (!recurring) {
      throw new NotFoundError('Recurring donation not found');
    }

    return recurring;
  }

  static async cancelRecurringDonation(id: string): Promise<IRecurringDonation> {
    const recurring = await RecurringDonation.findOneAndUpdate(
      { _id: id, isDeleted: false, isActive: true },
      { $set: { isActive: false } },
      { new: true },
    );

    if (!recurring) {
      throw new NotFoundError('Active recurring donation not found');
    }

    return recurring;
  }

  static async processRecurringDonations(): Promise<{
    processed: number;
    failed: number;
    donations: IDonation[];
  }> {
    const now = new Date();

    // Find all active recurring donations that are due
    const dueRecurring = await RecurringDonation.find({
      isActive: true,
      isDeleted: false,
      nextChargeDate: { $lte: now },
    });

    let processed = 0;
    let failed = 0;
    const donations: IDonation[] = [];

    for (const recurring of dueRecurring) {
      try {
        // Verify the campaign is still active
        const campaign = await Campaign.findOne({
          _id: recurring.campaignId,
          isDeleted: false,
          isActive: true,
        });

        if (!campaign) {
          // Deactivate the recurring donation if campaign is gone/inactive
          await RecurringDonation.updateOne(
            { _id: recurring._id },
            { $set: { isActive: false } },
          );
          failed++;
          continue;
        }

        // Create a donation record
        const donation = await Donation.create({
          campaignId: recurring.campaignId,
          schoolId: recurring.schoolId,
          donorName: recurring.donorName,
          donorEmail: recurring.donorEmail,
          amount: recurring.amount,
          message: `Recurring ${recurring.frequency} donation`,
          isAnonymous: false,
        });

        // Update raised amount on campaign
        await Campaign.updateOne(
          { _id: recurring.campaignId },
          { $inc: { raisedAmount: recurring.amount } },
        );

        // Advance nextChargeDate based on frequency
        const nextDate = new Date(recurring.nextChargeDate);
        if (recurring.frequency === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7);
        } else {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }

        await RecurringDonation.updateOne(
          { _id: recurring._id },
          {
            $set: {
              nextChargeDate: nextDate,
              lastChargedDate: now,
            },
            $inc: { totalCharged: recurring.amount },
          },
        );

        donations.push(donation);
        processed++;
      } catch {
        failed++;
      }
    }

    return { processed, failed, donations };
  }
}
