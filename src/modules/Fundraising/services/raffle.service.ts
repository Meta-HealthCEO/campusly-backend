import mongoose from 'mongoose';
import {
  Campaign,
  Raffle, IRaffle,
  RaffleTicket, IRaffleTicket,
} from '../model.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';
import type { CreateRaffleInput, BuyRaffleTicketsInput } from '../validation.js';

export class RaffleService {
  static async createRaffle(data: CreateRaffleInput): Promise<IRaffle> {
    const campaign = await Campaign.findOne({ _id: data.campaignId, isDeleted: false });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    const raffle = await Raffle.create(data);
    return raffle;
  }

  static async buyTickets(data: BuyRaffleTicketsInput): Promise<IRaffleTicket[]> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const raffle = await Raffle.findOne({ _id: data.raffleId, isDeleted: false }).session(session);
      if (!raffle) throw new NotFoundError('Raffle not found');

      // Atomic increment with upper-bound guard — prevents overselling
      const maxAllowed = raffle.totalTickets - data.quantity;
      const updated = await Raffle.findOneAndUpdate(
        { _id: data.raffleId, soldTickets: { $lte: maxAllowed } },
        { $inc: { soldTickets: data.quantity } },
        { new: true, session },
      );

      if (!updated) {
        throw new BadRequestError('Not enough tickets available');
      }

      const raffleIdSuffix = data.raffleId.slice(-6);
      // Use the soldTickets value BEFORE our increment to generate sequential ticket numbers
      const baseTicketNum = updated.soldTickets - data.quantity;
      const ticketDocs = Array.from({ length: data.quantity }, (_, i) => {
        const ticketNum = baseTicketNum + i + 1;
        const ticketNumber = `RAFFLE-${raffleIdSuffix}-${String(ticketNum).padStart(5, '0')}`;
        return {
          raffleId: data.raffleId,
          parentId: data.parentId,
          studentId: data.studentId,
          ticketNumber,
        };
      });

      const tickets = await RaffleTicket.insertMany(ticketDocs, { session });

      await session.commitTransaction();
      return tickets as unknown as IRaffleTicket[];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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

    // Batch update all winners at once instead of one-by-one
    const bulkOps = shuffled.slice(0, winnerCount).map((ticket, i) => ({
      updateOne: {
        filter: { _id: ticket._id },
        update: { $set: { isWinner: true, prizePlace: raffle.prizes[i].place } },
      },
    }));

    await RaffleTicket.bulkWrite(bulkOps);

    // Fetch updated winner tickets in one query
    const winnerIds = shuffled.slice(0, winnerCount).map((t) => t._id);
    const winners = await RaffleTicket.find({ _id: { $in: winnerIds } });

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
      .sort('-purchasedAt')
      .lean();

    return tickets;
  }
}
