import { Campaign, ICampaign, Donation, IDonation, Raffle, IRaffle, RaffleTicket, IRaffleTicket } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateCampaignInput, UpdateCampaignInput, CreateDonationInput, CreateRaffleInput, BuyRaffleTicketsInput } from './validation.js';

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
}
