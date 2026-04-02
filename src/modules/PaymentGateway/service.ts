import mongoose from 'mongoose';
import { PaymentGatewayConfig, OnlinePayment } from './model.js';
import { Invoice } from '../Fee/model.js';
import { Wallet } from '../Wallet/model.js';
import { User } from '../Auth/model.js';
import { InvoiceStatus } from '../../common/enums.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { PayFastService } from './services/payfast.service.js';
import { WebhookService } from './services/webhook.service.js';
import type {
  InitiatePaymentInput,
  InitiateWalletTopupInput,
  GatewayConfigInput,
  RefundInput,
} from './validation.js';

export class PaymentGatewayService {
  // ─── Config ────────────────────────────────────────────────────────────────

  static async getConfig(schoolId: string) {
    const config = await PaymentGatewayConfig.findOne({
      schoolId,
      isDeleted: false,
    }).lean();
    if (!config) {
      throw new NotFoundError('Payment gateway configuration not found');
    }
    return config;
  }

  static async upsertConfig(schoolId: string, data: GatewayConfigInput) {
    return PaymentGatewayConfig.findOneAndUpdate(
      { schoolId },
      {
        $set: {
          provider: data.provider,
          credentials: data.credentials,
          enabled: data.enabled,
          isDeleted: false,
        },
      },
      { upsert: true, new: true },
    );
  }

  // ─── Initiate Fee Payment ──────────────────────────────────────────────────

  static async initiatePayment(
    userId: string,
    schoolId: string,
    input: InitiatePaymentInput,
  ) {
    const config = await PaymentGatewayConfig.findOne({
      schoolId,
      isDeleted: false,
      enabled: true,
    }).lean();
    if (!config) {
      throw new BadRequestError('Payment gateway is not configured or enabled');
    }

    // Fetch & validate invoices
    const invoices = await Invoice.find({
      _id: { $in: input.invoiceIds },
      schoolId,
      isDeleted: false,
      status: { $nin: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED] },
    }).lean();

    if (invoices.length === 0) {
      throw new BadRequestError('No valid unpaid invoices found');
    }

    if (invoices.length !== input.invoiceIds.length) {
      throw new BadRequestError('Some invoices are invalid, already paid, or cancelled');
    }

    // Calculate total outstanding
    const totalAmount = invoices.reduce((sum, inv) => {
      const outstanding =
        inv.totalAmount - inv.paidAmount - (inv.discountAmount ?? 0) - (inv.writeOffAmount ?? 0);
      return sum + Math.max(0, outstanding);
    }, 0);

    if (totalAmount <= 0) {
      throw new BadRequestError('Total outstanding amount is zero');
    }

    // Get parent details
    const parent = await User.findOne({ _id: userId, isDeleted: false }).lean();
    if (!parent) {
      throw new NotFoundError('Parent user not found');
    }

    const notifyUrl = `${process.env.API_BASE_URL ?? 'http://localhost:4500'}/api/payment-gateway/webhook/payfast`;

    const onlinePayment = await OnlinePayment.create({
      schoolId,
      parentId: userId,
      invoiceIds: input.invoiceIds,
      paymentType: 'fee_payment',
      amount: totalAmount,
      currency: 'ZAR',
      provider: config.provider,
      status: 'initiated',
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
      notifyUrl,
    });

    const { formData, paymentUrl } = PayFastService.generatePaymentData(
      config.credentials,
      onlinePayment,
      { firstName: parent.firstName, lastName: parent.lastName, email: parent.email },
      `School Fees Payment - ${invoices.length} invoice(s)`,
      input.returnUrl,
      input.cancelUrl,
      notifyUrl,
    );

    return { paymentId: onlinePayment._id, formData, paymentUrl };
  }

  // ─── Initiate Wallet Top-up ────────────────────────────────────────────────

  static async initiateWalletTopup(
    userId: string,
    schoolId: string,
    input: InitiateWalletTopupInput,
  ) {
    const config = await PaymentGatewayConfig.findOne({
      schoolId,
      isDeleted: false,
      enabled: true,
    }).lean();
    if (!config) {
      throw new BadRequestError('Payment gateway is not configured or enabled');
    }

    const wallet = await Wallet.findOne({
      _id: input.walletId,
      schoolId,
      isDeleted: false,
      isActive: true,
    }).lean();
    if (!wallet) {
      throw new NotFoundError('Wallet not found or inactive');
    }

    const parent = await User.findOne({ _id: userId, isDeleted: false }).lean();
    if (!parent) {
      throw new NotFoundError('Parent user not found');
    }

    const notifyUrl = `${process.env.API_BASE_URL ?? 'http://localhost:4500'}/api/payment-gateway/webhook/payfast`;

    const onlinePayment = await OnlinePayment.create({
      schoolId,
      parentId: userId,
      studentId: wallet.studentId,
      walletId: input.walletId,
      paymentType: 'wallet_topup',
      amount: input.amount,
      currency: 'ZAR',
      provider: config.provider,
      status: 'initiated',
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
      notifyUrl,
    });

    const { formData, paymentUrl } = PayFastService.generatePaymentData(
      config.credentials,
      onlinePayment,
      { firstName: parent.firstName, lastName: parent.lastName, email: parent.email },
      'Wallet Top-up',
      input.returnUrl,
      input.cancelUrl,
      notifyUrl,
    );

    return { paymentId: onlinePayment._id, formData, paymentUrl };
  }

  // ─── Webhook (delegates to WebhookService) ────────────────────────────────

  static async handleWebhook(data: Record<string, string>) {
    return WebhookService.handleWebhook(data);
  }

  // ─── Query ─────────────────────────────────────────────────────────────────

  static async getPaymentStatus(paymentId: string, schoolId: string) {
    const payment = await OnlinePayment.findOne({
      _id: paymentId,
      schoolId,
      isDeleted: false,
    }).lean();
    if (!payment) {
      throw new NotFoundError('Online payment not found');
    }
    return payment;
  }

  static async listPayments(
    schoolId: string,
    filters: { status?: string; parentId?: string; from?: string; to?: string },
    page?: number,
    limit?: number,
  ) {
    const { skip, limit: pLimit } = paginationHelper(page, limit);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters.status) filter.status = filters.status;
    if (filters.parentId) filter.parentId = filters.parentId;
    if (filters.from || filters.to) {
      const dateFilter: Record<string, Date> = {};
      if (filters.from) dateFilter.$gte = new Date(filters.from);
      if (filters.to) dateFilter.$lte = new Date(filters.to);
      filter.initiatedAt = dateFilter;
    }

    const [payments, total] = await Promise.all([
      OnlinePayment.find(filter)
        .populate('parentId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pLimit)
        .lean(),
      OnlinePayment.countDocuments(filter),
    ]);

    return { payments, total, page: page ?? 1, limit: pLimit };
  }

  // ─── Refund ────────────────────────────────────────────────────────────────

  static async refundPayment(userId: string, schoolId: string, input: RefundInput) {
    const onlinePayment = await OnlinePayment.findOne({
      _id: input.onlinePaymentId,
      schoolId,
      isDeleted: false,
      status: 'completed',
    });
    if (!onlinePayment) {
      throw new NotFoundError('Completed online payment not found');
    }

    if (input.amount > onlinePayment.amount) {
      throw new BadRequestError('Refund amount exceeds original payment amount');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      onlinePayment.status = 'refunded';
      onlinePayment.gatewayResponse = {
        ...(onlinePayment.gatewayResponse ?? {}),
        refundedBy: userId,
        refundReason: input.reason,
        refundAmount: input.amount,
        refundedAt: new Date().toISOString(),
      };
      await onlinePayment.save({ session });

      if (onlinePayment.paymentType === 'wallet_topup' && onlinePayment.walletId) {
        await WebhookService.reverseWalletTopup(
          onlinePayment, input.amount, userId, session,
        );
      }

      if (onlinePayment.paymentType === 'fee_payment' && onlinePayment.invoiceIds.length > 0) {
        await WebhookService.reverseFeePayments(
          onlinePayment, input.amount, session,
        );
      }

      await session.commitTransaction();
      return onlinePayment;
    } catch (err: unknown) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  // ─── Analytics ─────────────────────────────────────────────────────────────

  static async getPaymentAnalytics(schoolId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    const [totals, methodBreakdown, failedCount] = await Promise.all([
      OnlinePayment.aggregate([
        { $match: { schoolId: schoolOid, status: 'completed', isDeleted: false } },
        {
          $group: {
            _id: null,
            totalAll: { $sum: '$amount' },
            totalToday: {
              $sum: { $cond: [{ $gte: ['$completedAt', startOfDay] }, '$amount', 0] },
            },
            totalWeek: {
              $sum: { $cond: [{ $gte: ['$completedAt', startOfWeek] }, '$amount', 0] },
            },
            totalMonth: {
              $sum: { $cond: [{ $gte: ['$completedAt', startOfMonth] }, '$amount', 0] },
            },
          },
        },
      ]),
      OnlinePayment.aggregate([
        { $match: { schoolId: schoolOid, status: 'completed', isDeleted: false } },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
      OnlinePayment.countDocuments({ schoolId, status: 'failed', isDeleted: false }),
    ]);

    const summary = totals[0] ?? { totalAll: 0, totalToday: 0, totalWeek: 0, totalMonth: 0 };

    return {
      totalCollected: summary.totalAll,
      collectedToday: summary.totalToday,
      collectedThisWeek: summary.totalWeek,
      collectedThisMonth: summary.totalMonth,
      paymentMethodBreakdown: methodBreakdown,
      failedPayments: failedCount,
    };
  }
}
