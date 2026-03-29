import mongoose from 'mongoose';
import { Wallet, WalletTransaction, Wristband } from './model.js';
import { TransactionType } from '../../common/enums.js';
import { BadRequestError, NotFoundError, ConflictError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateWalletInput, LinkWristbandInput } from './validation.js';

export class WalletService {
  static async createWallet(data: CreateWalletInput) {
    const existing = await Wallet.findOne({
      studentId: data.studentId,
      isDeleted: false,
    });

    if (existing) {
      throw new ConflictError('Wallet already exists for this student');
    }

    const wallet = await Wallet.create({
      studentId: data.studentId,
      schoolId: data.schoolId,
      dailyLimit: data.dailyLimit ?? 10000,
    });

    return wallet;
  }

  static async getWallet(studentId: string) {
    const wallet = await Wallet.findOne({
      studentId,
      isDeleted: false,
    });

    if (!wallet) {
      throw new NotFoundError('Wallet not found for this student');
    }

    return wallet;
  }

  static async loadMoney(
    walletId: string,
    amount: number,
    description: string | undefined,
    performedBy: string,
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOneAndUpdate(
        { _id: walletId, isDeleted: false, isActive: true },
        { $inc: { balance: amount } },
        { new: true, session },
      );

      if (!wallet) {
        throw new NotFoundError('Wallet not found or inactive');
      }

      await WalletTransaction.create(
        [
          {
            walletId: wallet._id,
            type: TransactionType.LOAD,
            amount,
            description: description ?? 'Wallet top-up',
            balanceAfter: wallet.balance,
            performedBy,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async deductMoney(
    walletId: string,
    amount: number,
    description: string,
    performedBy: string,
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({
        _id: walletId,
        isDeleted: false,
        isActive: true,
      }).session(session);

      if (!wallet) {
        throw new NotFoundError('Wallet not found or inactive');
      }

      if (wallet.balance < amount) {
        throw new BadRequestError('Insufficient funds');
      }

      // Check daily limit — sum of today's purchases
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todaySpend = await WalletTransaction.aggregate([
        {
          $match: {
            walletId: wallet._id,
            type: TransactionType.PURCHASE,
            isDeleted: false,
            createdAt: { $gte: startOfDay },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]).session(session);

      const spentToday = todaySpend.length > 0 ? todaySpend[0].total : 0;

      if (spentToday + amount > wallet.dailyLimit) {
        throw new BadRequestError(
          `Daily spending limit exceeded. Limit: ${wallet.dailyLimit}, spent today: ${spentToday}, requested: ${amount}`,
        );
      }

      wallet.balance -= amount;
      await wallet.save({ session });

      await WalletTransaction.create(
        [
          {
            walletId: wallet._id,
            type: TransactionType.PURCHASE,
            amount,
            description,
            balanceAfter: wallet.balance,
            performedBy,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getTransactions(
    walletId: string,
    query: { page?: number; limit?: number },
  ) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter = { walletId, isDeleted: false };

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WalletTransaction.countDocuments(filter),
    ]);

    return { transactions, total, page: query.page ?? 1, limit };
  }

  static async linkWristband(data: LinkWristbandInput) {
    // Deactivate any existing active wristband for this student
    await Wristband.updateMany(
      { studentId: data.studentId, isActive: true, isDeleted: false },
      { isActive: false, deactivatedAt: new Date() },
    );

    // Check if wristbandId is already in use by another active link
    const existingBand = await Wristband.findOne({
      wristbandId: data.wristbandId,
      isActive: true,
      isDeleted: false,
    });

    if (existingBand) {
      throw new ConflictError('This wristband is already linked to a student');
    }

    // Look up the student's wallet to get schoolId
    const wallet = await Wallet.findOne({
      studentId: data.studentId,
      isDeleted: false,
    });

    if (!wallet) {
      throw new NotFoundError('Wallet not found for this student. Create a wallet first.');
    }

    const wristband = await Wristband.create({
      wristbandId: data.wristbandId,
      studentId: data.studentId,
      schoolId: wallet.schoolId,
      activatedAt: new Date(),
    });

    return wristband;
  }

  static async unlinkWristband(wristbandId: string) {
    const wristband = await Wristband.findOneAndUpdate(
      { wristbandId, isActive: true, isDeleted: false },
      { isActive: false, deactivatedAt: new Date() },
      { new: true },
    );

    if (!wristband) {
      throw new NotFoundError('Active wristband not found');
    }

    return wristband;
  }

  static async getWristband(studentId: string) {
    const wristband = await Wristband.findOne({
      studentId,
      isActive: true,
      isDeleted: false,
    });

    if (!wristband) {
      throw new NotFoundError('No active wristband found for this student');
    }

    return wristband;
  }

  static async updateDailyLimit(walletId: string, dailyLimit: number) {
    const wallet = await Wallet.findOneAndUpdate(
      { _id: walletId, isDeleted: false },
      { dailyLimit },
      { new: true },
    );

    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    return wallet;
  }

  static async getWalletByWristband(wristbandId: string) {
    const wristband = await Wristband.findOne({
      wristbandId,
      isActive: true,
      isDeleted: false,
    });

    if (!wristband) {
      throw new NotFoundError('Active wristband not found');
    }

    const wallet = await Wallet.findOne({
      studentId: wristband.studentId,
      isDeleted: false,
    });

    if (!wallet) {
      throw new NotFoundError('Wallet not found for wristband student');
    }

    return wallet;
  }
}
