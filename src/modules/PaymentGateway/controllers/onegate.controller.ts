import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getUser } from '../../../types/authenticated-request.js';
import { OnlinePayment } from '../model.js';
import { Invoice } from '../../Fee/model.js';
import { Wallet } from '../../Wallet/model.js';
import { getOneGateClient } from '../../../lib/onegate/index.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';
import { apiResponse } from '../../../common/utils.js';
import { InvoiceStatus } from '../../../common/enums.js';
import type {
  OnegateFeePaymentInput,
  OnegateWalletTopupInput,
} from '../validation.js';

const NOTIFY_BASE = process.env.PUBLIC_API_URL ?? process.env.API_BASE_URL ?? 'http://localhost:4500';

// OneGate payment keys expire 1 hour from creation
const PAYMENT_KEY_TTL_MS = 60 * 60 * 1000;

export async function initiateOneGateFeePayment(req: Request, res: Response): Promise<void> {
  const { id: userId, schoolId } = getUser(req);
  const { invoiceIds, returnUrl } = req.body as OnegateFeePaymentInput;

  const invoices = await Invoice.find({
    _id: { $in: invoiceIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
    status: { $nin: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED] },
  }).lean();

  if (invoices.length === 0) {
    throw new BadRequestError('No valid unpaid invoices found');
  }

  if (invoices.length !== invoiceIds.length) {
    throw new BadRequestError('Some invoices are invalid, already paid, or cancelled');
  }

  const totalAmount = invoices.reduce((sum, inv) => {
    const outstanding =
      inv.totalAmount - inv.paidAmount - (inv.discountAmount ?? 0) - (inv.writeOffAmount ?? 0);
    return sum + Math.max(0, outstanding);
  }, 0);

  if (totalAmount <= 0) {
    throw new BadRequestError('Total outstanding amount is zero');
  }

  const notifyUrl = `${NOTIFY_BASE}/api/webhooks/onegate`;

  const payment = await OnlinePayment.create({
    schoolId,
    parentId: userId,
    invoiceIds,
    paymentType: 'fee_payment',
    amount: totalAmount,
    currency: 'ZAR',
    provider: 'onegate',
    status: 'pending',
    returnUrl,
    cancelUrl: returnUrl,
    notifyUrl,
  });

  const merchantReference = `fee_${String(payment._id)}`;

  const onegateResp = await getOneGateClient().createPaymentKey({
    payment_type: 'all',
    amount: (totalAmount / 100).toFixed(2),
    merchant_reference: merchantReference,
    success_url: returnUrl,
    cancel_url: returnUrl,
    notify_url: notifyUrl,
  });

  payment.externalTransactionId = onegateResp.key;
  await payment.save();

  const expiresAt = new Date(Date.now() + PAYMENT_KEY_TTL_MS).toISOString();

  res.json(
    apiResponse(true, {
      paymentId: String(payment._id),
      redirectUrl: onegateResp.url,
      expiresAt,
    }, 'Fee payment initiated'),
  );
}

export async function initiateOneGateWalletTopup(req: Request, res: Response): Promise<void> {
  const { id: userId, schoolId } = getUser(req);
  const { walletId, amount, returnUrl } = req.body as OnegateWalletTopupInput;

  const wallet = await Wallet.findOne({
    _id: new mongoose.Types.ObjectId(walletId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
    isActive: true,
  }).lean();

  if (!wallet) {
    throw new NotFoundError('Wallet not found or inactive');
  }

  const notifyUrl = `${NOTIFY_BASE}/api/webhooks/onegate`;

  const payment = await OnlinePayment.create({
    schoolId,
    parentId: userId,
    studentId: wallet.studentId,
    walletId,
    paymentType: 'wallet_topup',
    amount,
    currency: 'ZAR',
    provider: 'onegate',
    status: 'pending',
    returnUrl,
    cancelUrl: returnUrl,
    notifyUrl,
  });

  const merchantReference = `top_${String(payment._id)}`;

  const onegateResp = await getOneGateClient().createPaymentKey({
    payment_type: 'all',
    amount: (amount / 100).toFixed(2),
    merchant_reference: merchantReference,
    success_url: returnUrl,
    cancel_url: returnUrl,
    notify_url: notifyUrl,
  });

  payment.externalTransactionId = onegateResp.key;
  await payment.save();

  const expiresAt = new Date(Date.now() + PAYMENT_KEY_TTL_MS).toISOString();

  res.json(
    apiResponse(true, {
      paymentId: String(payment._id),
      redirectUrl: onegateResp.url,
      expiresAt,
    }, 'Wallet top-up initiated'),
  );
}
