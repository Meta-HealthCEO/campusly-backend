import { afterEach, beforeAll, afterAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { PaymentCompletionService } from '../payment-completion.service.js';
import { OnlinePayment } from '../../model.js';
import { Wallet, WalletTransaction } from '../../../Wallet/model.js';
import { Invoice, Payment } from '../../../Fee/model.js';
import { TransactionType, InvoiceStatus } from '../../../../common/enums.js';

const TEST_URI = process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test';

// Stable sentinel ObjectIds reused as required foreign-key stubs
const SCHOOL_ID = new mongoose.Types.ObjectId();
const STUDENT_ID = new mongoose.Types.ObjectId();
const PARENT_ID = new mongoose.Types.ObjectId();

/** Minimal Invoice fixture — fills all required fields */
async function createInvoice(overrides: Partial<{
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
}> = {}) {
  return Invoice.create({
    schoolId: SCHOOL_ID,
    studentId: STUDENT_ID,
    feeScheduleId: new mongoose.Types.ObjectId(),
    invoiceNumber: `INV-${Date.now()}-${Math.random()}`,
    items: [{ description: 'Test fee', amount: overrides.totalAmount ?? 1000 }],
    totalAmount: overrides.totalAmount ?? 1000,
    paidAmount: overrides.paidAmount ?? 0,
    status: overrides.status ?? InvoiceStatus.PENDING,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
}

/** Minimal OnlinePayment fixture for fee_payment */
async function createFeePayment(invoiceIds: mongoose.Types.ObjectId[], amount: number) {
  return OnlinePayment.create({
    schoolId: SCHOOL_ID,
    parentId: PARENT_ID,
    studentId: STUDENT_ID,
    paymentType: 'fee_payment',
    provider: 'onegate',
    status: 'pending',
    amount,
    invoiceIds,
    returnUrl: 'https://example.com/return',
    cancelUrl: 'https://example.com/cancel',
    notifyUrl: 'https://example.com/notify',
  });
}

/** Minimal OnlinePayment fixture for wallet_topup */
async function createWalletTopup(walletId: mongoose.Types.ObjectId, amount: number) {
  return OnlinePayment.create({
    schoolId: SCHOOL_ID,
    parentId: PARENT_ID,
    paymentType: 'wallet_topup',
    provider: 'onegate',
    status: 'pending',
    amount,
    walletId,
    returnUrl: 'https://example.com/return',
    cancelUrl: 'https://example.com/cancel',
    notifyUrl: 'https://example.com/notify',
  });
}

describe('PaymentCompletionService', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) await mongoose.connect(TEST_URI);
  });

  afterEach(async () => {
    await Promise.all([
      OnlinePayment.deleteMany({}),
      Wallet.deleteMany({}),
      WalletTransaction.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ─── completeFeePayment ──────────────────────────────────────────────────────

  describe('completeFeePayment', () => {
    it('marks the payment completed and allocates to invoices', async () => {
      const inv = await createInvoice({ totalAmount: 1000 });
      const payment = await createFeePayment([inv._id as mongoose.Types.ObjectId], 1000);

      await PaymentCompletionService.completeFeePayment(String(payment._id));

      const updated = await OnlinePayment.findById(payment._id);
      expect(updated?.status).toBe('completed');
      expect(updated?.completedAt).toBeDefined();

      const invAfter = await Invoice.findById(inv._id);
      expect(invAfter?.status).toBe(InvoiceStatus.PAID);
      expect(invAfter?.paidAmount).toBe(1000);

      const paymentsCreated = await Payment.find({ invoiceId: inv._id });
      expect(paymentsCreated.length).toBe(1);
      expect(paymentsCreated[0].amount).toBe(1000);
    });

    it('is idempotent — a second call is a no-op', async () => {
      const inv = await createInvoice({ totalAmount: 500 });
      const payment = await createFeePayment([inv._id as mongoose.Types.ObjectId], 500);

      await PaymentCompletionService.completeFeePayment(String(payment._id));
      await PaymentCompletionService.completeFeePayment(String(payment._id));

      const paymentsForInvoice = await Payment.find({ invoiceId: inv._id });
      expect(paymentsForInvoice.length).toBe(1);

      const invAfter = await Invoice.findById(inv._id);
      expect(invAfter?.paidAmount).toBe(500);
    });

    it('allocates across multiple invoices', async () => {
      const inv1 = await createInvoice({ totalAmount: 300 });
      const inv2 = await createInvoice({ totalAmount: 200 });
      const payment = await createFeePayment(
        [inv1._id as mongoose.Types.ObjectId, inv2._id as mongoose.Types.ObjectId],
        500,
      );

      await PaymentCompletionService.completeFeePayment(String(payment._id));

      const inv1After = await Invoice.findById(inv1._id);
      const inv2After = await Invoice.findById(inv2._id);
      expect(inv1After?.paidAmount).toBe(300);
      expect(inv1After?.status).toBe(InvoiceStatus.PAID);
      expect(inv2After?.paidAmount).toBe(200);
      expect(inv2After?.status).toBe(InvoiceStatus.PAID);
    });
  });

  // ─── completeWalletTopup ─────────────────────────────────────────────────────

  describe('completeWalletTopup', () => {
    it('credits the wallet and creates a LOAD transaction', async () => {
      const wallet = await Wallet.create({
        schoolId: SCHOOL_ID,
        studentId: STUDENT_ID,
        balance: 100,
      });
      const payment = await createWalletTopup(wallet._id as mongoose.Types.ObjectId, 250);

      await PaymentCompletionService.completeWalletTopup(String(payment._id));

      const walletAfter = await Wallet.findById(wallet._id);
      expect(walletAfter?.balance).toBe(350);

      const txns = await WalletTransaction.find({ walletId: wallet._id });
      expect(txns.length).toBe(1);
      // TransactionType.LOAD = 'load'
      expect(txns[0].type).toBe(TransactionType.LOAD);
      expect(txns[0].amount).toBe(250);
      expect(txns[0].balanceAfter).toBe(350);
    });

    it('marks the OnlinePayment completed', async () => {
      const wallet = await Wallet.create({
        schoolId: SCHOOL_ID,
        studentId: STUDENT_ID,
        balance: 0,
      });
      const payment = await createWalletTopup(wallet._id as mongoose.Types.ObjectId, 500);

      await PaymentCompletionService.completeWalletTopup(String(payment._id));

      const updated = await OnlinePayment.findById(payment._id);
      expect(updated?.status).toBe('completed');
      expect(updated?.completedAt).toBeDefined();
    });

    it('is idempotent', async () => {
      const wallet = await Wallet.create({
        schoolId: SCHOOL_ID,
        studentId: STUDENT_ID,
        balance: 0,
      });
      const payment = await createWalletTopup(wallet._id as mongoose.Types.ObjectId, 100);

      await PaymentCompletionService.completeWalletTopup(String(payment._id));
      await PaymentCompletionService.completeWalletTopup(String(payment._id));

      const walletAfter = await Wallet.findById(wallet._id);
      expect(walletAfter?.balance).toBe(100);

      const txns = await WalletTransaction.find({ walletId: wallet._id });
      expect(txns.length).toBe(1);
    });
  });
});
