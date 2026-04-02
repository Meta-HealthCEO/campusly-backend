import {
  UniformItem,
  IUniformItem,
  UniformOrder,
  IUniformOrder,
  SecondHandListing,
  ISecondHandListing,
  SizeGuide,
  ISizeGuide,
  PreOrder,
  IPreOrder,
} from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type {
  CreateUniformItemInput,
  UpdateUniformItemInput,
  CreateUniformOrderInput,
  UpdateUniformOrderStatusInput,
  CreateSecondHandListingInput,
  UpdateSecondHandListingInput,
  CreateSizeGuideInput,
  UpdateSizeGuideInput,
  CreatePreOrderInput,
  UpdatePreOrderStatusInput,
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
      UniformItem.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
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

  static async getItem(id: string, schoolId: string): Promise<IUniformItem> {
    const item = await UniformItem.findOne({ _id: id, schoolId, isDeleted: false }).lean();

    if (!item) {
      throw new NotFoundError('Uniform item not found');
    }

    return item;
  }

  static async updateItem(id: string, schoolId: string, data: UpdateUniformItemInput): Promise<IUniformItem> {
    const item = await UniformItem.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!item) {
      throw new NotFoundError('Uniform item not found');
    }

    return item;
  }

  static async deleteItem(id: string, schoolId: string): Promise<IUniformItem> {
    const item = await UniformItem.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
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
        .limit(limit)
        .lean(),
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

  static async getOrder(id: string, schoolId: string): Promise<IUniformOrder> {
    const order = await UniformOrder.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('studentId')
      .populate('orderedBy', 'firstName lastName email')
      .lean();

    if (!order) {
      throw new NotFoundError('Uniform order not found');
    }

    return order;
  }

  static async updateOrderStatus(id: string, schoolId: string, data: UpdateUniformOrderStatusInput): Promise<IUniformOrder> {
    const order = await UniformOrder.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      {
        $set: { status: data.status },
        $push: {
          statusHistory: {
            status: data.status,
            timestamp: new Date(),
            notes: data.notes,
          },
        },
      },
      { new: true, runValidators: true },
    )
      .populate('studentId')
      .populate('orderedBy', 'firstName lastName email');

    if (!order) {
      throw new NotFoundError('Uniform order not found');
    }

    return order;
  }

  static async getOrderTimeline(
    id: string,
    schoolId: string,
  ): Promise<{ status: string; timestamp: Date; notes?: string }[]> {
    const order = await UniformOrder.findOne({ _id: id, schoolId, isDeleted: false })
      .select('statusHistory createdAt')
      .lean();

    if (!order) {
      throw new NotFoundError('Uniform order not found');
    }

    // Always include the initial "pending" from creation if statusHistory is empty or doesn't start with pending
    const timeline = [...(order.statusHistory ?? [])];
    if (timeline.length === 0 || timeline[0].status !== 'pending') {
      timeline.unshift({ status: 'pending', timestamp: order.createdAt });
    }

    return timeline;
  }

  static async getSizeRecommendation(
    schoolId: string,
    studentId: string,
  ): Promise<{ studentId: string; gradeName: string; recommendedSize: string }> {
    const { Student } = await import('../Student/model.js');
    const student = await Student.findOne({ _id: studentId, schoolId, isDeleted: false })
      .populate('gradeId', 'name')
      .lean();

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const grade = student.gradeId as { name?: string } | undefined;
    const gradeName = grade?.name ?? '';

    // Simple grade-based mapping
    const gradeNum = parseInt(gradeName.replace(/\D/g, ''), 10);
    let recommendedSize = 'M';
    if (!isNaN(gradeNum)) {
      if (gradeNum <= 3) recommendedSize = 'S';
      else if (gradeNum <= 6) recommendedSize = 'M';
      else if (gradeNum <= 9) recommendedSize = 'L';
      else recommendedSize = 'XL';
    }

    return { studentId, gradeName, recommendedSize };
  }

  static async getUniformRequirements(
    schoolId: string,
    _gradeId: string,
  ): Promise<IUniformItem[]> {
    // Return all available items for the school (grade-specific requirements not yet modelled)
    const items = await UniformItem.find({
      schoolId,
      isDeleted: false,
      isAvailable: true,
    }).lean();

    return items;
  }

  static async deleteOrder(id: string, schoolId: string): Promise<IUniformOrder> {
    const order = await UniformOrder.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
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
        .limit(limit)
        .lean(),
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

  static async getSecondHandListing(id: string, schoolId: string): Promise<ISecondHandListing> {
    const listing = await SecondHandListing.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('parentId')
      .populate('buyerId')
      .lean();

    if (!listing) {
      throw new NotFoundError('Second hand listing not found');
    }

    return listing;
  }

  static async reserveSecondHandListing(id: string, schoolId: string, buyerId: string): Promise<ISecondHandListing> {
    const listing = await SecondHandListing.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false, status: 'available' },
      { $set: { status: 'reserved', buyerId } },
      { new: true, runValidators: true },
    );

    if (!listing) {
      throw new NotFoundError('Listing not found or not available');
    }

    return listing;
  }

  static async markSecondHandSold(id: string, schoolId: string): Promise<ISecondHandListing> {
    const listing = await SecondHandListing.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
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
      SecondHandListing.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
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

  // ─── Size Guide ──────────────────────────────────────────────────────────

  static async createSizeGuide(data: CreateSizeGuideInput): Promise<ISizeGuide> {
    const sizeGuide = await SizeGuide.create(data);
    return sizeGuide;
  }

  static async getSizeGuideByItem(uniformItemId: string, schoolId: string): Promise<ISizeGuide> {
    const sizeGuide = await SizeGuide.findOne({ uniformItemId, schoolId, isDeleted: false }).lean();

    if (!sizeGuide) {
      throw new NotFoundError('Size guide not found for this item');
    }

    return sizeGuide;
  }

  static async updateSizeGuide(uniformItemId: string, schoolId: string, data: UpdateSizeGuideInput): Promise<ISizeGuide> {
    const sizeGuide = await SizeGuide.findOneAndUpdate(
      { uniformItemId, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!sizeGuide) {
      throw new NotFoundError('Size guide not found for this item');
    }

    return sizeGuide;
  }

  static async deleteSizeGuide(uniformItemId: string, schoolId: string): Promise<ISizeGuide> {
    const sizeGuide = await SizeGuide.findOneAndUpdate(
      { uniformItemId, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!sizeGuide) {
      throw new NotFoundError('Size guide not found for this item');
    }

    return sizeGuide;
  }

  // ─── Pre Order ───────────────────────────────────────────────────────────

  static async createPreOrder(data: CreatePreOrderInput, orderedBy: string): Promise<IPreOrder> {
    const preOrder = await PreOrder.create({
      ...data,
      orderedBy,
    });

    return preOrder;
  }

  static async listPreOrders(
    query: { page?: number; limit?: number; schoolId?: string; status?: string; uniformItemId?: string },
  ): Promise<{
    preOrders: IPreOrder[];
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

    if (query.status) {
      filter.status = query.status;
    }

    if (query.uniformItemId) {
      filter.uniformItemId = query.uniformItemId;
    }

    const [preOrders, total] = await Promise.all([
      PreOrder.find(filter)
        .populate('uniformItemId')
        .populate('studentId')
        .populate('orderedBy', 'firstName lastName email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      PreOrder.countDocuments(filter),
    ]);

    return {
      preOrders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getPreOrder(id: string, schoolId: string): Promise<IPreOrder> {
    const preOrder = await PreOrder.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('uniformItemId')
      .populate('studentId')
      .populate('orderedBy', 'firstName lastName email')
      .lean();

    if (!preOrder) {
      throw new NotFoundError('Pre-order not found');
    }

    return preOrder;
  }

  static async updatePreOrderStatus(id: string, schoolId: string, data: UpdatePreOrderStatusInput): Promise<IPreOrder> {
    const preOrder = await PreOrder.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { status: data.status } },
      { new: true, runValidators: true },
    )
      .populate('uniformItemId')
      .populate('studentId')
      .populate('orderedBy', 'firstName lastName email');

    if (!preOrder) {
      throw new NotFoundError('Pre-order not found');
    }

    return preOrder;
  }

  static async deletePreOrder(id: string, schoolId: string): Promise<IPreOrder> {
    const preOrder = await PreOrder.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!preOrder) {
      throw new NotFoundError('Pre-order not found');
    }

    return preOrder;
  }

  // ─── Low Stock ───────────────────────────────────────────────────────────

  static async getLowStockItems(
    query: { page?: number; limit?: number; schoolId?: string },
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
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    };

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    const [items, total] = await Promise.all([
      UniformItem.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
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
}
