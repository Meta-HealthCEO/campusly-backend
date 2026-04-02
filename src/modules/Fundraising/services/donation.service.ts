import crypto from 'crypto';
import mongoose from 'mongoose';
import {
  Campaign, IDonation,
  Donation,
  TaxCertificate, ITaxCertificate,
  DonorWall, IDonorWall,
  RecurringDonation, IRecurringDonation,
} from '../model.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';
import { paginationHelper, escapeRegex } from '../../../common/utils.js';
import type {
  CreateDonationInput,
  GenerateTaxCertificateInput,
  AddDonorWallInput,
  CreateRecurringDonationInput,
} from '../validation.js';

interface ListDonationQuery {
  page?: number;
  limit?: number;
  campaignId?: string;
  schoolId?: string;
}

export class DonationService {
  static async recordDonation(data: CreateDonationInput): Promise<IDonation> {
    const campaign = await Campaign.findOne({ _id: data.campaignId, isDeleted: false });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const [donation] = await Donation.create([data], { session });

      await Campaign.updateOne(
        { _id: data.campaignId },
        { $inc: { raisedAmount: data.amount } },
        { session },
      );

      await session.commitTransaction();
      return donation;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
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
        .limit(limit)
        .lean(),
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
      .populate('campaignId', 'title')
      .lean();

    if (!donation) {
      throw new NotFoundError('Donation not found');
    }

    return donation;
  }

  static async deleteDonation(id: string): Promise<IDonation> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const donation = await Donation.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true } },
        { new: true, session },
      );

      if (!donation) {
        throw new NotFoundError('Donation not found');
      }

      await Campaign.updateOne(
        { _id: donation.campaignId },
        { $inc: { raisedAmount: -donation.amount } },
        { session },
      );

      await session.commitTransaction();
      return donation;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  // ─── Tax Certificate (Section 18A) ──────────────────────────────────────

  static async generateTaxCertificate(data: GenerateTaxCertificateInput): Promise<ITaxCertificate> {
    const donation = await Donation.findOne({ _id: data.donationId, isDeleted: false });

    if (!donation) {
      throw new NotFoundError('Donation not found');
    }

    const existing = await TaxCertificate.findOne({ donationId: data.donationId, isDeleted: false });

    if (existing) {
      throw new BadRequestError('Tax certificate already exists for this donation');
    }

    const schoolIdSuffix = data.schoolId.slice(-6);
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const uniqueSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const certificateNumber = `S18A-${schoolIdSuffix}-${yearMonth}-${uniqueSuffix}`;

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
      .populate('donationId')
      .lean();

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
        .limit(limit)
        .lean(),
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
      donorName: { $regex: new RegExp(escapeRegex(donorName), 'i') },
      schoolId,
      isDeleted: false,
    };

    const [certificates, total] = await Promise.all([
      TaxCertificate.find(filter)
        .populate('donationId')
        .sort('-dateIssued')
        .skip(skip)
        .limit(limit)
        .lean(),
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
    const campaign = await Campaign.findOne({ _id: data.campaignId, isDeleted: false });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

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
        .limit(limit)
        .lean(),
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
        .limit(limit)
        .lean(),
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
      .populate('campaignId', 'title')
      .lean();

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
        const campaign = await Campaign.findOne({
          _id: recurring.campaignId,
          isDeleted: false,
          isActive: true,
        });

        if (!campaign) {
          await RecurringDonation.updateOne(
            { _id: recurring._id },
            { $set: { isActive: false } },
          );
          failed++;
          continue;
        }

        const donation = await Donation.create({
          campaignId: recurring.campaignId,
          schoolId: recurring.schoolId,
          donorName: recurring.donorName,
          donorEmail: recurring.donorEmail,
          amount: recurring.amount,
          message: `Recurring ${recurring.frequency} donation`,
          isAnonymous: false,
        });

        await Campaign.updateOne(
          { _id: recurring.campaignId },
          { $inc: { raisedAmount: recurring.amount } },
        );

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
