import crypto from 'crypto';
import mongoose from 'mongoose';
import { OnlinePayment, PaymentGatewayConfig } from '../model.js';
import type { IOnlinePayment } from '../model.js';
import { Invoice, Payment } from '../../Fee/model.js';
import { Wallet, WalletTransaction } from '../../Wallet/model.js';
import { InvoiceStatus, TransactionType } from '../../../common/enums.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';
import { PayFastService } from './payfast.service.js';
import { PaymentCompletionService } from './payment-completion.service.js';

export class WebhookService {
  /**
   * Process an incoming PayFast ITN webhook.
   */
  static async handleWebhook(data: Record<string, string>) {
    const paymentId = data.m_payment_id;
    if (!paymentId) {
      throw new BadRequestError('Missing m_payment_id in webhook data');
    }

    const onlinePayment = await OnlinePayment.findOne({
      _id: paymentId,
      isDeleted: false,
    });
    if (!onlinePayment) {
      throw new NotFoundError('Online payment not found');
    }

    // Already completed — idempotent
    if (onlinePayment.status === 'completed') {
      return onlinePayment;
    }

    const config = await PaymentGatewayConfig.findOne({
      schoolId: onlinePayment.schoolId,
      isDeleted: false,
    }).lean();
    if (!config) {
      throw new NotFoundError('Gateway config not found for school');
    }

    // Validate ITN
    const isValid = PayFastService.validateITN(data, config.credentials, onlinePayment.amount);
    if (!isValid) {
      onlinePayment.status = 'failed';
      onlinePayment.failureReason = 'ITN validation failed';
      onlinePayment.gatewayResponse = data as Record<string, unknown>;
      await onlinePayment.save();
      throw new BadRequestError('ITN validation failed');
    }

    const paymentStatus = data.payment_status;

    if (paymentStatus === 'COMPLETE') {
      return WebhookService.handleCompleted(onlinePayment, data);
    }

    if (paymentStatus === 'CANCELLED') {
      onlinePayment.status = 'cancelled';
      onlinePayment.gatewayResponse = data as Record<string, unknown>;
      await onlinePayment.save();
      return onlinePayment;
    }

    // FAILED or any other status
    onlinePayment.status = 'failed';
    onlinePayment.failureReason = `Payment status: ${paymentStatus}`;
    onlinePayment.gatewayResponse = data as Record<string, unknown>;
    await onlinePayment.save();
    return onlinePayment;
  }

  // ─── Handle Completed Payment ──────────────────────────────────────────────

  private static async handleCompleted(
    onlinePayment: IOnlinePayment & mongoose.Document,
    data: Record<string, string>,
  ) {
    const receiptSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const receiptNumber = `OPR-${Date.now()}-${receiptSuffix}`;

    const pfPaymentMethod = data.payment_method as string | undefined;
    const methodMap: Record<string, 'card' | 'eft' | 'instant_eft' | 'qr_code'> = {
      cc: 'card',
      dc: 'card',
      eft: 'eft',
      instant_eft: 'instant_eft',
    };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Set PayFast-specific enrichment fields on the in-memory document so that
      // PaymentCompletionService picks them up (receiptNumber in particular) when
      // it reads the document from DB — we persist them first, then let the
      // service handle status='completed' and invoice/wallet logic.
      onlinePayment.receiptNumber = receiptNumber;
      onlinePayment.externalTransactionId = data.pf_payment_id ?? '';
      onlinePayment.paymentMethod = pfPaymentMethod
        ? (methodMap[pfPaymentMethod] ?? 'card')
        : undefined;
      onlinePayment.gatewayFee = Math.round(parseFloat(data.amount_fee ?? '0') * 100);
      onlinePayment.netAmount = Math.round(parseFloat(data.amount_net ?? '0') * 100);
      onlinePayment.gatewayResponse = data as Record<string, unknown>;
      // Persist PayFast-specific fields (status stays non-completed for now so
      // the idempotency guard in PaymentCompletionService does not short-circuit).
      await onlinePayment.save({ session });

      if (onlinePayment.paymentType === 'fee_payment') {
        await WebhookService.recordFeePayments(onlinePayment, session);
      }

      if (onlinePayment.paymentType === 'wallet_topup' && onlinePayment.walletId) {
        await WebhookService.creditWallet(onlinePayment, session);
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

  // ─── Record Fee Payments ───────────────────────────────────────────────────
  // Delegates to PaymentCompletionService so the same logic is reused by all
  // payment providers (PayFast, OneGate, etc.).

  static async recordFeePayments(
    onlinePayment: IOnlinePayment,
    session: mongoose.ClientSession,
  ): Promise<void> {
    // The caller (handleCompleted) has already set receiptNumber on the document
    // and called save() within the same transaction — pass the session through
    // so all writes remain in the same atomic unit.
    await PaymentCompletionService.completeFeePayment(String(onlinePayment._id), session);
  }

  // ─── Credit Wallet ─────────────────────────────────────────────────────────
  // Delegates to PaymentCompletionService — same reasoning as above.

  static async creditWallet(
    onlinePayment: IOnlinePayment,
    session: mongoose.ClientSession,
  ): Promise<void> {
    await PaymentCompletionService.completeWalletTopup(String(onlinePayment._id), session);
  }

  // ─── Reverse Wallet Top-up ─────────────────────────────────────────────────

  static async reverseWalletTopup(
    onlinePayment: IOnlinePayment,
    refundAmount: number,
    userId: string,
    session: mongoose.ClientSession,
  ) {
    const wallet = await Wallet.findOne({
      _id: onlinePayment.walletId,
      isDeleted: false,
    }).session(session);

    if (!wallet) {
      throw new NotFoundError('Wallet not found for refund');
    }

    if (wallet.balance < refundAmount) {
      throw new BadRequestError('Wallet balance insufficient for refund');
    }

    const updated = await Wallet.findOneAndUpdate(
      { _id: wallet._id, balance: { $gte: refundAmount } },
      { $inc: { balance: -refundAmount } },
      { new: true, session },
    );

    if (!updated) {
      throw new BadRequestError('Wallet balance changed during refund');
    }

    await WalletTransaction.create(
      [
        {
          walletId: wallet._id,
          type: TransactionType.REFUND,
          amount: refundAmount,
          description: `Refund for online payment: ${onlinePayment.receiptNumber}`,
          balanceAfter: updated.balance,
          performedBy: userId,
        },
      ],
      { session },
    );
  }

  // ─── Reverse Fee Payments ──────────────────────────────────────────────────

  static async reverseFeePayments(
    onlinePayment: IOnlinePayment,
    refundAmount: number,
    session: mongoose.ClientSession,
  ) {
    const payments = await Payment.find({
      reference: `Online: ${onlinePayment.receiptNumber}`,
      schoolId: onlinePayment.schoolId,
      isDeleted: false,
    }).session(session);

    let remaining = refundAmount;

    for (const payment of payments) {
      if (remaining <= 0) break;

      const reversal = Math.min(remaining, payment.amount);

      await Payment.findByIdAndUpdate(payment._id, { isDeleted: true }, { session });

      await Invoice.findByIdAndUpdate(
        payment.invoiceId,
        {
          $inc: { paidAmount: -reversal },
          $set: { status: InvoiceStatus.PARTIAL },
        },
        { session },
      );

      remaining -= reversal;
    }
  }
}
