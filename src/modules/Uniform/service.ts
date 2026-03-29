import { UniformItem, IUniformItem, UniformOrder, IUniformOrder, SecondHandListing, ISecondHandListing } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type {
  CreateUniformItemInput,
  UpdateUniformItemInput,
  CreateUniformOrderInput,
  UpdateUniformOrderStatusInput,
  CreateSecondHandListingInput,
  UpdateSecondHandListingInput,
} from './validation.js';

interface ListItemQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  category?: string;
  isAvailable?: boolean;
}

interface ListOrderQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  studentId?: string;
  status?: string;
}

export class UniformService {
  // ─── Uniform Item CRUD ────────────────────────────────────────────────────

  static async createItem(data: CreateUniformItemInput): Promise<IUniformItem> {
    const item = await UniformItem.create(data);
    return item;
  }

  static async listItems(
    query: ListItemQuery,
  ): Promise<{
    items: IUniformItem[];
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

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.isAvailable !== undefined) {
      filter.isAvailable = query.isAvailable;
    }

    const [items, total] = await Promise.all([
      UniformItem.find(filter).sort('-createdAt').skip(skip).limit(limit),
      UniformItem.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getItem(id: string): Promise<IUniformItem> {
    const item = await UniformItem.findOne({ _id: id, isDeleted: false });

    if (!item) {
      throw new NotFoundError('Uniform item not found');
    }

    return item;
  }

  static async updateItem(id: string, data: UpdateUniformItemInput): Promise<IUniformItem> {
    const item = await UniformItem.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!item) {
      throw new NotFoundError('Uniform item not found');
    }

    return item;
  }

  static async deleteItem(id: string): Promise<IUniformItem> {
    const item = await UniformItem.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!item) {
      throw new NotFoundError('Uniform item not found');
    }

    return item;
  }

  // ─── Uniform Order ────────────────────────────────────────────────────────

  static async createOrder(data: CreateUniformOrderInput, orderedBy: string): Promise<IUniformOrder> {
    const order = await UniformOrder.create({
      ...data,
      orderedBy,
    });

    return order;
  }

  static async listOrders(
    query: ListOrderQuery,
  ): Promise<{
    orders: IUniformOrder[];
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

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.studentId) {
      filter.studentId = query.studentId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    const [orders, total] = await Promise.all([
      UniformOrder.find(filter)
        .populate('studentId')
        .populate('orderedBy', 'firstName lastName email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      UniformOrder.countDocuments(filter),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getOrder(id: string): Promise<IUniformOrder> {
    const order = await UniformOrder.findOne({ _id: id, isDeleted: false })
      .populate('studentId')
      .populate('orderedBy', 'firstName lastName email');

    if (!order) {
      throw new NotFoundError('Uniform order not found');
    }

    return order;
  }

  static async updateOrderStatus(id: string, data: UpdateUniformOrderStatusInput): Promise<IUniformOrder> {
    const order = await UniformOrder.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { status: data.status } },
      { new: true, runValidators: true },
    )
      .populate('studentId')
      .populate('orderedBy', 'firstName lastName email');

    if (!order) {
      throw new NotFoundError('Uniform order not found');
    }

    return order;
  }

  static async deleteOrder(id: string): Promise<IUniformOrder> {
    const order = await UniformOrder.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!order) {
      throw new NotFoundError('Uniform order not found');
    }

    return order;
  }

  // ─── Second Hand Marketplace ───────────────────────────────────────────────

  static async createSecondHandListing(data: CreateSecondHandListingInput): Promise<ISecondHandListing> {
    const listing = await SecondHandListing.create(data);
    return listing;
  }

  static async listSecondHandListings(
    query: { page?: number; limit?: number; schoolId?: string; condition?: string; status?: string },
  ): Promise<{
    listings: ISecondHandListing[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter: Record<string, unknown> = {
      isDeleted: false,
      status: query.status ?? 'available',
    };

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.condition) {
      filter.condition = query.condition;
    }

    const [listings, total] = await Promise.all([
      SecondHandListing.find(filter)
        .populate('parentId')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      SecondHandListing.countDocuments(filter),
    ]);

    return {
      listings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getSecondHandListing(id: string): Promise<ISecondHandListing> {
    const listing = await SecondHandListing.findOne({ _id: id, isDeleted: false })
      .populate('parentId')
      .populate('buyerId');

    if (!listing) {
      throw new NotFoundError('Second hand listing not found');
    }

    return listing;
  }

  static async reserveSecondHandListing(id: string, buyerId: string): Promise<ISecondHandListing> {
    const listing = await SecondHandListing.findOneAndUpdate(
      { _id: id, isDeleted: false, status: 'available' },
      { $set: { status: 'reserved', buyerId } },
      { new: true, runValidators: true },
    );

    if (!listing) {
      throw new NotFoundError('Listing not found or not available');
    }

    return listing;
  }

  static async markSecondHandSold(id: string): Promise<ISecondHandListing> {
    const listing = await SecondHandListing.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { status: 'sold' } },
      { new: true, runValidators: true },
    );

    if (!listing) {
      throw new NotFoundError('Second hand listing not found');
    }

    return listing;
  }

  static async getMyListings(
    parentId: string,
    query: { page?: number; limit?: number },
  ): Promise<{
    listings: ISecondHandListing[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter: Record<string, unknown> = {
      parentId,
      isDeleted: false,
    };

    const [listings, total] = await Promise.all([
      SecondHandListing.find(filter).sort('-createdAt').skip(skip).limit(limit),
      SecondHandListing.countDocuments(filter),
    ]);

    return {
      listings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
