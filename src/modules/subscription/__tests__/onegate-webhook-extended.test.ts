import { afterEach, beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { OnlinePayment } from '../../PaymentGateway/model.js';
import { Invoice, Payment } from '../../Fee/model.js';
import { Wallet, WalletTransaction } from '../../Wallet/model.js';
import { WebhookEvent } from '../model.js';
import * as OneGateLib from '../../../lib/onegate/index.js';

const TEST_URI = process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test';

// The ONEGATE_IP_ALLOWLIST env var is used only for rate-limit bypass — not a
// hard 403 gate — so tests reach the handler regardless. We set it anyway to
// avoid any future change in behavior.
const SUPERTEST_IP = '::ffff:127.0.0.1';

function makeMockClient(merchantRef: string) {
  return {
    getTransaction: vi.fn().mockResolvedValue({
      id: 9999,
      successful: 1 as const,
      status: 'complete',
      amount: '10.00',
      displayAmount: 'R10.00',
      currency: 'ZAR',
      merchant_reference: merchantRef,
      gateway_reference: 'gw-ref',
      payment_key: 'pk',
      created: '2026-05-14',
      refunded_amount: '0.00',
      refunded: 0 as const,
      service: 'Direct',
      gateway: 'Imbeko',
      gateway_response_parameters: {},
    }),
  };
}

const PARENT_ID = new mongoose.Types.ObjectId();

describe('OneGate webhook — fee_ + wallet top_ branches', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) await mongoose.connect(TEST_URI);
    process.env.ONEGATE_IP_ALLOWLIST = SUPERTEST_IP;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all([
      OnlinePayment.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      Wallet.deleteMany({}),
      WalletTransaction.deleteMany({}),
      WebhookEvent.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('completes a fee payment when fee_ ref arrives', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();

    const inv = await Invoice.create({
      schoolId,
      studentId,
      feeScheduleId: new mongoose.Types.ObjectId(),
      invoiceNumber: `INV-TEST-${Date.now()}`,
      items: [{ description: 'Tuition', amount: 1000 }],
      totalAmount: 1000,
      paidAmount: 0,
      status: 'pending',
      dueDate: new Date(Date.now() + 86400000),
    });

    const payment = await OnlinePayment.create({
      schoolId,
      parentId: PARENT_ID,
      studentId,
      paymentType: 'fee_payment',
      provider: 'onegate',
      status: 'pending',
      amount: 1000,
      invoiceIds: [inv._id],
      returnUrl: 'https://example.com/return',
      cancelUrl: 'https://example.com/cancel',
      notifyUrl: 'https://example.com/notify',
    });

    vi.spyOn(OneGateLib, 'getOneGateClient').mockReturnValue(
      makeMockClient(`fee_${String(payment._id)}`) as never,
    );

    const res = await request(app)
      .post('/api/webhooks/onegate')
      .send({ callpay_transaction_id: 9999, merchant_reference: `fee_${String(payment._id)}`, amount: '10.00' });

    expect(res.status).toBeLessThan(400);

    const updatedInv = await Invoice.findById(inv._id);
    expect(updatedInv?.status).toBe('paid');

    const updatedPayment = await OnlinePayment.findById(payment._id);
    expect(updatedPayment?.status).toBe('completed');

    const feePmts = await Payment.find({ invoiceId: inv._id });
    expect(feePmts.length).toBe(1);
  });

  it('credits a wallet when top_ ref arrives', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();

    const wallet = await Wallet.create({
      schoolId,
      studentId,
      balance: 0,
      isActive: true,
    });

    const payment = await OnlinePayment.create({
      schoolId,
      parentId: PARENT_ID,
      studentId,
      paymentType: 'wallet_topup',
      provider: 'onegate',
      status: 'pending',
      amount: 500,
      walletId: wallet._id,
      returnUrl: 'https://example.com/return',
      cancelUrl: 'https://example.com/cancel',
      notifyUrl: 'https://example.com/notify',
    });

    vi.spyOn(OneGateLib, 'getOneGateClient').mockReturnValue(
      makeMockClient(`top_${String(payment._id)}`) as never,
    );

    const res = await request(app)
      .post('/api/webhooks/onegate')
      .send({ callpay_transaction_id: 9999, merchant_reference: `top_${String(payment._id)}`, amount: '5.00' });

    expect(res.status).toBeLessThan(400);

    const updatedWallet = await Wallet.findById(wallet._id);
    expect(updatedWallet?.balance).toBe(500);

    const txns = await WalletTransaction.find({ walletId: wallet._id });
    expect(txns.length).toBe(1);

    const updatedPayment = await OnlinePayment.findById(payment._id);
    expect(updatedPayment?.status).toBe('completed');
  });

  it('handles duplicate webhooks idempotently (wallet topup)', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();

    const wallet = await Wallet.create({
      schoolId,
      studentId,
      balance: 0,
      isActive: true,
    });

    const payment = await OnlinePayment.create({
      schoolId,
      parentId: PARENT_ID,
      studentId,
      paymentType: 'wallet_topup',
      provider: 'onegate',
      status: 'pending',
      amount: 500,
      walletId: wallet._id,
      returnUrl: 'https://example.com/return',
      cancelUrl: 'https://example.com/cancel',
      notifyUrl: 'https://example.com/notify',
    });

    const ref = `top_${String(payment._id)}`;
    vi.spyOn(OneGateLib, 'getOneGateClient').mockReturnValue(
      makeMockClient(ref) as never,
    );

    // Fire twice with the same callpay_transaction_id
    await request(app)
      .post('/api/webhooks/onegate')
      .send({ callpay_transaction_id: 9999, merchant_reference: ref, amount: '5.00' });
    await request(app)
      .post('/api/webhooks/onegate')
      .send({ callpay_transaction_id: 9999, merchant_reference: ref, amount: '5.00' });

    const updatedWallet = await Wallet.findById(wallet._id);
    expect(updatedWallet?.balance).toBe(500); // not 1000

    const txns = await WalletTransaction.find({ walletId: wallet._id });
    expect(txns.length).toBe(1);
  });

  it('skips completion when lookup.successful !== 1 (failed transaction)', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();

    const wallet = await Wallet.create({
      schoolId,
      studentId,
      balance: 0,
      isActive: true,
    });

    const payment = await OnlinePayment.create({
      schoolId,
      parentId: PARENT_ID,
      studentId,
      paymentType: 'wallet_topup',
      provider: 'onegate',
      status: 'pending',
      amount: 500,
      walletId: wallet._id,
      returnUrl: 'https://example.com/return',
      cancelUrl: 'https://example.com/cancel',
      notifyUrl: 'https://example.com/notify',
    });

    const ref = `top_${String(payment._id)}`;

    vi.spyOn(OneGateLib, 'getOneGateClient').mockReturnValue({
      getTransaction: vi.fn().mockResolvedValue({
        id: 9999,
        successful: 0 as const,
        status: 'failed',
        amount: '5.00',
        displayAmount: 'R5.00',
        currency: 'ZAR',
        merchant_reference: ref,
        gateway_reference: 'gw-ref',
        payment_key: 'pk',
        created: '2026-05-14',
        refunded_amount: '0.00',
        refunded: 0 as const,
        service: 'Direct',
        gateway: 'Imbeko',
        gateway_response_parameters: {},
      }),
    } as never);

    const res = await request(app)
      .post('/api/webhooks/onegate')
      .send({ callpay_transaction_id: 9999, merchant_reference: ref, amount: '5.00' });

    expect(res.status).toBeLessThan(400);

    const walletAfter = await Wallet.findById(wallet._id);
    expect(walletAfter?.balance).toBe(0); // NOT credited

    const paymentAfter = await OnlinePayment.findById(payment._id);
    expect(paymentAfter?.status).toBe('pending'); // NOT completed
  });
});
