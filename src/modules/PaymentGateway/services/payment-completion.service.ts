import crypto from 'crypto';
import mongoose from 'mongoose';
import type { IOnlinePayment } from '../model.js';
import { OnlinePayment } from '../model.js';
import { Wallet, WalletTransaction } from '../../Wallet/model.js';
import { Invoice, Payment } from '../../Fee/model.js';
import { InvoiceStatus, TransactionType } from '../../../common/enums.js';

type SessionOpts = { session: mongoose.ClientSession } | Record<string, never>;

function opts(session: mongoose.ClientSession | undefined): SessionOpts {
  return session ? { session } : {};
}

export class PaymentCompletionService {
  /**
   * Idempotent fee-payment completion.
   *
   * Finds the OnlinePayment, allocates its amount across attached Invoices,
   * creates Payment records and marks invoices paid/partial.
   * Returns immediately if the payment is already completed.
   *
   * @param paymentId  OnlinePayment._id as string
   * @param session    Optional Mongoose session supplied by a caller that owns
   *                   the transaction (e.g. PayFast webhook).  When absent the
   *                   operations run without a transaction (suitable for tests
   *                   and standalone callers like OneGate).
   */
  static async completeFeePayment(
    paymentId: string,
    session?: mongoose.ClientSession,
  ): Promise<void> {
    const payment = await OnlinePayment.findOne({ _id: paymentId, isDeleted: false });
    if (!payment) throw new Error(`OnlinePayment ${paymentId} not found`);
    if (payment.status === 'completed') return;
    if (payment.paymentType !== 'fee_payment') {
      throw new Error(`Payment ${paymentId} is not a fee_payment`);
    }

    const receiptNumber = payment.receiptNumber ?? PaymentCompletionService.genReceipt();

    const invoices = await Invoice.find({
      _id: { $in: payment.invoiceIds ?? [] },
      schoolId: payment.schoolId,
      isDeleted: false,
    }).session(session ?? null);

    let remaining = payment.amount;

    for (const invoice of invoices) {
      if (remaining <= 0) break;

      const outstanding =
        invoice.totalAmount -
        invoice.paidAmount -
        (invoice.discountAmount ?? 0) -
        (invoice.writeOffAmount ?? 0);
      const allocation = Math.min(remaining, Math.max(0, outstanding));
      if (allocation <= 0) continue;

      await Payment.create(
        [
          {
            invoiceId: invoice._id,
            studentId: invoice.studentId,
            schoolId: invoice.schoolId,
            amount: allocation,
            paymentMethod: 'card',
            reference: `Online: ${receiptNumber}`,
            receiptNumber,
            paymentDate: new Date(),
            recordedBy: payment.parentId,
          },
        ],
        opts(session),
      );

      const newPaid = invoice.paidAmount + allocation;
      const newStatus =
        newPaid + (invoice.discountAmount ?? 0) + (invoice.writeOffAmount ?? 0) >=
        invoice.totalAmount
          ? InvoiceStatus.PAID
          : InvoiceStatus.PARTIAL;

      await Invoice.findByIdAndUpdate(
        invoice._id,
        { $inc: { paidAmount: allocation }, $set: { status: newStatus } },
        opts(session),
      );

      remaining -= allocation;
    }

    payment.status = 'completed';
    payment.completedAt = new Date();
    if (!payment.receiptNumber) payment.receiptNumber = receiptNumber;
    await payment.save(opts(session));
  }

  /**
   * Idempotent wallet top-up completion.
   *
   * Credits the linked Wallet, writes a LOAD WalletTransaction and marks the
   * OnlinePayment completed.  Returns immediately if already completed.
   *
   * @param paymentId  OnlinePayment._id as string
   * @param session    Optional Mongoose session (see completeFeePayment docs).
   */
  static async completeWalletTopup(
    paymentId: string,
    session?: mongoose.ClientSession,
  ): Promise<void> {
    const payment = await OnlinePayment.findOne({ _id: paymentId, isDeleted: false });
    if (!payment) throw new Error(`OnlinePayment ${paymentId} not found`);
    if (payment.status === 'completed') return;
    if (payment.paymentType !== 'wallet_topup') {
      throw new Error(`Payment ${paymentId} is not a wallet_topup`);
    }
    if (!payment.walletId) throw new Error(`Payment ${paymentId} missing walletId`);

    const receiptNumber = payment.receiptNumber ?? PaymentCompletionService.genReceipt();

    const wallet = await Wallet.findOneAndUpdate(
      { _id: payment.walletId, schoolId: payment.schoolId, isDeleted: false, isActive: true },
      { $inc: { balance: payment.amount } },
      { returnDocument: 'after', ...opts(session) },
    );

    if (!wallet) {
      throw new Error(`Wallet ${String(payment.walletId)} not found or inactive`);
    }

    await WalletTransaction.create(
      [
        {
          walletId: wallet._id,
          type: TransactionType.LOAD,
          amount: payment.amount,
          description: `Online top-up: ${receiptNumber}`,
          reference: receiptNumber,
          balanceAfter: wallet.balance,
          performedBy: payment.parentId,
        },
      ],
      opts(session),
    );

    payment.status = 'completed';
    payment.completedAt = new Date();
    if (!payment.receiptNumber) payment.receiptNumber = receiptNumber;
    await payment.save(opts(session));
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private static genReceipt(): string {
    const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `OPR-${Date.now()}-${suffix}`;
  }
}

// Re-export the document type so callers don't need to import from model directly
export type { IOnlinePayment };
