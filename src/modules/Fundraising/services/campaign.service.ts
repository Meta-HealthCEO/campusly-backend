import {
  Campaign, ICampaign,
} from '../model.js';
import { NotFoundError } from '../../../common/errors.js';
import { paginationHelper } from '../../../common/utils.js';
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
} from '../validation.js';

interface ListCampaignQuery {
  page?: number;
  limit?: number;
  sort?: string;
  schoolId?: string;
  isActive?: boolean;
}

export class CampaignService {
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
      Campaign.find(filter).sort(sortField).skip(skip).limit(limit).lean(),
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
    const campaign = await Campaign.findOne({ _id: id, isDeleted: false }).lean();

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

  static async getCampaignProgress(campaignId: string): Promise<{
    campaign: ICampaign;
    percentageComplete: number;
  }> {
    const campaign = await Campaign.findOne({ _id: campaignId, isDeleted: false }).lean();

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    const percentageComplete = campaign.targetAmount > 0
      ? Math.round(((campaign.raisedAmount / campaign.targetAmount) * 100) * 100) / 100
      : 0;

    return { campaign, percentageComplete };
  }
}
