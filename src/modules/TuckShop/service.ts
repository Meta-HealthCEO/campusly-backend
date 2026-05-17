import mongoose from 'mongoose';
import { MenuItem, IMenuItem, TuckShopOrder, ITuckShopOrder } from './model.js';
import { Wallet, WalletTransaction, Wristband } from '../Wallet/model.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { TransactionType } from '../../common/enums.js';

interface ListMenuQuery {
  page?: number;
  limit?: number;
  category?: string;
  isAvailable?: boolean;
}

interface ListOrderQuery {
  page?: number;
  limit?: number;
}

interface DailySalesSummary {
  totalSales: number;
  orderCount: number;
  byPaymentMethod: Array<{
    paymentMethod: string;
    totalSales: number;
    orderCount: number;
  }>;
}

export class TuckShopService {
  // ─── Menu Item CRUD ─────────────────────────────────────────────────────────

  static async createMenuItem(data: Partial<IMenuItem>): Promise<IMenuItem> {
    const menuItem = new MenuItem(data);
    return menuItem.save();
  }

  static async listMenuItems(schoolId: string, query: ListMenuQuery): Promise<{
    items: IMenuItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
    const limit = Math.min(
      Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
      PAGINATION_DEFAULTS.maxLimit,
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    if (query.category) {
      filter.category = query.category;
    }

    if (query.isAvailable !== undefined) {
      filter.isAvailable = query.isAvailable;
    }

    const [items, total] = await Promise.all([
      MenuItem.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
      MenuItem.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getMenuItem(id: string, schoolId: string): Promise<IMenuItem> {
    const item = await MenuItem.findOne({ _id: id, schoolId, isDeleted: false });

    if (!item) {
      throw new NotFoundError('Menu item not found');
    }

    return item;
  }

  static async updateMenuItem(id: string, schoolId: string, data: Partial<IMenuItem>): Promise<IMenuItem> {
    const item = await MenuItem.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!item) {
      throw new NotFoundError('Menu item not found');
    }

    return item;
  }

  static async deleteMenuItem(id: string, schoolId: string): Promise<IMenuItem> {
    const item = await MenuItem.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!item) {
      throw new NotFoundError('Menu item not found');
    }

    return item;
  }

  // ─── Orders ─────────────────────────────────────────────────────────────────

  static async placeOrder(
    data: {
      schoolId: string;
      studentId: string;
      items: Array<{ menuItemId: string; quantity: number }>;
      paymentMethod: 'wallet' | 'wristband' | 'cash';
      wristbandId?: string;
      allergenOverride?: boolean;
    },
    processedBy: string,
  ): Promise<ITuckShopOrder> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate all items exist and are available
      const menuItemIds = data.items.map((i) => i.menuItemId);
      const menuItems = await MenuItem.find({
        _id: { $in: menuItemIds },
        isDeleted: false,
      }).session(session);

      if (menuItems.length !== menuItemIds.length) {
        throw new BadRequestError('One or more menu items not found');
      }

      const menuItemMap = new Map(menuItems.map((item) => [item._id.toString(), item]));


      // Build order items and check stock
      const orderItems = [];
      let totalAmount = 0;

      for (const orderItem of data.items) {
        const menuItem = menuItemMap.get(orderItem.menuItemId);

        if (!menuItem) {
          throw new BadRequestError(`Menu item ${orderItem.menuItemId} not found`);
        }

        if (!menuItem.isAvailable) {
          throw new BadRequestError(`Menu item "${menuItem.name}" is not available`);
        }

        // Check stock and atomically decrement (-1 means unlimited)
        if (menuItem.stock !== -1) {
          const updated = await MenuItem.findOneAndUpdate(
            { _id: menuItem._id, stock: { $gte: orderItem.quantity } },
            { $inc: { stock: -orderItem.quantity } },
            { new: true, session },
          );
          if (!updated) {
            throw new BadRequestError(`Insufficient stock for "${menuItem.name}"`);
          }
        }

        const itemTotal = menuItem.price * orderItem.quantity;
        orderItems.push({
          menuItemId: menuItem._id,
          name: menuItem.name,
          quantity: orderItem.quantity,
          unitPrice: menuItem.price,
          totalPrice: itemTotal,
        });
        totalAmount += itemTotal;
      }

      let walletTransactionId: mongoose.Types.ObjectId | undefined;

      // Handle payment method
      if (data.paymentMethod === 'wallet') {
        const updatedWallet = await Wallet.findOneAndUpdate(
          {
            studentId: data.studentId,
            isActive: true,
            isDeleted: false,
            balance: { $gte: totalAmount },
          },
          { $inc: { balance: -totalAmount } },
          { new: true, session },
        );

        if (!updatedWallet) {
          throw new BadRequestError('Insufficient wallet balance or wallet not found');
        }

        // Create wallet transaction
        const transaction = new WalletTransaction({
          walletId: updatedWallet._id,
          type: TransactionType.PURCHASE,
          amount: totalAmount,
          description: `Tuck shop purchase - ${orderItems.length} item(s)`,
          balanceAfter: updatedWallet.balance,
          performedBy: processedBy,
        });
        await transaction.save({ session });
        walletTransactionId = transaction._id as mongoose.Types.ObjectId;
      } else if (data.paymentMethod === 'wristband') {
        if (!data.wristbandId) {
          throw new BadRequestError('Wristband ID is required for wristband payment');
        }

        const wristband = await Wristband.findOne({
          wristbandId: data.wristbandId,
          isActive: true,
          isDeleted: false,
        }).session(session);

        if (!wristband) {
          throw new BadRequestError('Wristband not found or inactive');
        }

        if (wristband.studentId.toString() !== data.studentId) {
          throw new UnauthorizedError('Wristband does not belong to this student');
        }

        const updatedWallet = await Wallet.findOneAndUpdate(
          {
            studentId: wristband.studentId,
            isActive: true,
            isDeleted: false,
            balance: { $gte: totalAmount },
          },
          { $inc: { balance: -totalAmount } },
          { new: true, session },
        );

        if (!updatedWallet) {
          throw new BadRequestError('Insufficient wallet balance or wallet not found');
        }

        // Create wallet transaction
        const transaction = new WalletTransaction({
          walletId: updatedWallet._id,
          type: TransactionType.PURCHASE,
          amount: totalAmount,
          description: `Tuck shop purchase via wristband - ${orderItems.length} item(s)`,
          balanceAfter: updatedWallet.balance,
          performedBy: processedBy,
        });
        await transaction.save({ session });
        walletTransactionId = transaction._id as mongoose.Types.ObjectId;
      } else if (data.paymentMethod === 'cash') {
        // Cash: no deduction needed, just record the order
      } else {
        throw new BadRequestError(`Unsupported payment method: ${data.paymentMethod as string}`);
      }

      // Create the order
      const order = new TuckShopOrder({
        schoolId: data.schoolId,
        studentId: data.studentId,
        items: orderItems,
        totalAmount,
        paymentMethod: data.paymentMethod,
        walletTransactionId,
        processedBy,
      });
      await order.save({ session });

      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getOrder(id: string, schoolId: string): Promise<ITuckShopOrder> {
    const order = await TuckShopOrder.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('studentId')
      .populate('processedBy', 'firstName lastName email');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  static async getStudentOrders(
    studentId: string,
    query: ListOrderQuery,
  ): Promise<{
    orders: ITuckShopOrder[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
    const limit = Math.min(
      Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
      PAGINATION_DEFAULTS.maxLimit,
    );
    const skip = (page - 1) * limit;

    const filter = { studentId, isDeleted: false };

    const [orders, total] = await Promise.all([
      TuckShopOrder.find(filter).sort('-createdAt').skip(skip).limit(limit),
      TuckShopOrder.countDocuments(filter),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getDailySales(schoolId: string, date: string): Promise<DailySalesSummary> {
    const startOfDay = new Date(date + 'T00:00:00');
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date + 'T00:00:00');
    endOfDay.setHours(23, 59, 59, 999);

    const results = await TuckShopOrder.aggregate([
      {
        $match: {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const byPaymentMethod = results.map((r) => ({
      paymentMethod: r._id as string,
      totalSales: r.totalSales as number,
      orderCount: r.orderCount as number,
    }));

    const totalSales = byPaymentMethod.reduce((sum, m) => sum + m.totalSales, 0);
    const orderCount = byPaymentMethod.reduce((sum, m) => sum + m.orderCount, 0);

    return {
      totalSales,
      orderCount,
      byPaymentMethod,
    };
  }

  static async updateStock(menuItemId: string, schoolId: string, quantity: number): Promise<IMenuItem> {
    const item = await MenuItem.findOneAndUpdate(
      { _id: menuItemId, schoolId, isDeleted: false },
      { $set: { stock: quantity } },
      { new: true, runValidators: true },
    );

    if (!item) {
      throw new NotFoundError('Menu item not found');
    }

    return item;
  }
}
