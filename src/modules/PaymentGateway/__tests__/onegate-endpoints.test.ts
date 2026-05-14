import { afterEach, beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { signTestToken } from '../../../test-utils/auth.js';
import { Invoice } from '../../Fee/model.js';
import { Wallet } from '../../Wallet/model.js';
import { OnlinePayment } from '../model.js';
import * as OneGateLib from '../../../lib/onegate/index.js';

const TEST_URI = process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test';

const mockOneGateClient = {
  createPaymentKey: vi.fn().mockResolvedValue({
    key: 'pk_test_xxx',
    url: 'https://payments.onegate.co.za/checkout/pk_test_xxx',
    origin: 'https://payments.onegate.co.za',
  }),
};

function spyOnClient() {
  vi.spyOn(OneGateLib, 'getOneGateClient').mockReturnValue(mockOneGateClient as never);
}

describe('OneGate parent payment endpoints', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) await mongoose.connect(TEST_URI);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    mockOneGateClient.createPaymentKey.mockResolvedValue({
      key: 'pk_test_xxx',
      url: 'https://payments.onegate.co.za/checkout/pk_test_xxx',
      origin: 'https://payments.onegate.co.za',
    });
    await Promise.all([
      Invoice.deleteMany({}),
      Wallet.deleteMany({}),
      OnlinePayment.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ─── Fee Payment ────────────────────────────────────────────────────────────

  describe('POST /api/payment-gateway/onegate/fee-payment', () => {
    it('creates an OnlinePayment and returns OneGate redirectUrl', async () => {
      const schoolId = new mongoose.Types.ObjectId();
      const studentId = new mongoose.Types.ObjectId();
      const feeScheduleId = new mongoose.Types.ObjectId();

      const inv = await Invoice.create({
        schoolId,
        studentId,
        feeScheduleId,
        invoiceNumber: `INV-${Date.now()}`,
        items: [{ description: 'Tuition', amount: 150000 }],
        totalAmount: 150000,
        paidAmount: 0,
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lateFeeAmount: 0,
        discountAmount: 0,
        writeOffAmount: 0,
      });

      spyOnClient();

      const token = signTestToken({
        id: String(new mongoose.Types.ObjectId()),
        schoolId: String(schoolId),
        role: 'parent',
      });

      const res = await request(app)
        .post('/api/payment-gateway/onegate/fee-payment')
        .set('Authorization', `Bearer ${token}`)
        .send({
          invoiceIds: [String(inv._id)],
          returnUrl: 'campusly://payment-return',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.paymentId).toBeDefined();
      expect(res.body.data.redirectUrl).toBe(
        'https://payments.onegate.co.za/checkout/pk_test_xxx',
      );
      expect(res.body.data.expiresAt).toBeDefined();

      const stored = await OnlinePayment.findById(res.body.data.paymentId);
      expect(stored?.status).toBe('pending');
      expect(stored?.provider).toBe('onegate');
      expect(stored?.paymentType).toBe('fee_payment');
      expect(stored?.externalTransactionId).toBe('pk_test_xxx');
    });

    it('rejects already-paid invoices with 400', async () => {
      const schoolId = new mongoose.Types.ObjectId();
      const studentId = new mongoose.Types.ObjectId();
      const feeScheduleId = new mongoose.Types.ObjectId();

      const inv = await Invoice.create({
        schoolId,
        studentId,
        feeScheduleId,
        invoiceNumber: `INV-PAID-${Date.now()}`,
        items: [{ description: 'Tuition', amount: 150000 }],
        totalAmount: 150000,
        paidAmount: 150000,
        status: 'paid',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lateFeeAmount: 0,
        discountAmount: 0,
        writeOffAmount: 0,
      });

      spyOnClient();

      const token = signTestToken({
        id: String(new mongoose.Types.ObjectId()),
        schoolId: String(schoolId),
        role: 'parent',
      });

      const res = await request(app)
        .post('/api/payment-gateway/onegate/fee-payment')
        .set('Authorization', `Bearer ${token}`)
        .send({
          invoiceIds: [String(inv._id)],
          returnUrl: 'campusly://payment-return',
        });

      expect(res.status).toBe(400);
    });

    it('rejects invoices from another school (multi-tenant) with 400', async () => {
      const schoolA = new mongoose.Types.ObjectId();
      const schoolB = new mongoose.Types.ObjectId();
      const studentId = new mongoose.Types.ObjectId();
      const feeScheduleId = new mongoose.Types.ObjectId();

      const inv = await Invoice.create({
        schoolId: schoolB,
        studentId,
        feeScheduleId,
        invoiceNumber: `INV-OTHER-${Date.now()}`,
        items: [{ description: 'Tuition', amount: 150000 }],
        totalAmount: 150000,
        paidAmount: 0,
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lateFeeAmount: 0,
        discountAmount: 0,
        writeOffAmount: 0,
      });

      spyOnClient();

      const token = signTestToken({
        id: String(new mongoose.Types.ObjectId()),
        schoolId: String(schoolA),
        role: 'parent',
      });

      const res = await request(app)
        .post('/api/payment-gateway/onegate/fee-payment')
        .set('Authorization', `Bearer ${token}`)
        .send({
          invoiceIds: [String(inv._id)],
          returnUrl: 'campusly://payment-return',
        });

      expect(res.status).toBe(400);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app)
        .post('/api/payment-gateway/onegate/fee-payment')
        .send({ invoiceIds: ['507f1f77bcf86cd799439011'], returnUrl: 'campusly://payment-return' });

      expect(res.status).toBe(401);
    });

    it('returns 400 on schema-invalid body (empty invoiceIds)', async () => {
      const token = signTestToken({ role: 'parent' });
      const res = await request(app)
        .post('/api/payment-gateway/onegate/fee-payment')
        .set('Authorization', `Bearer ${token}`)
        .send({ invoiceIds: [], returnUrl: 'campusly://payment-return' });

      expect(res.status).toBe(400);
    });

    it('passes a fee_-prefixed merchant_reference to OneGate', async () => {
      const schoolId = new mongoose.Types.ObjectId();
      const inv = await Invoice.create({
        schoolId, studentId: new mongoose.Types.ObjectId(), feeScheduleId: new mongoose.Types.ObjectId(),
        invoiceNumber: `INV-REF-${Date.now()}`, items: [{ description: 'Tuition', amount: 100000 }],
        totalAmount: 100000, paidAmount: 0, status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lateFeeAmount: 0, discountAmount: 0, writeOffAmount: 0,
      });
      spyOnClient();
      const token = signTestToken({ id: String(new mongoose.Types.ObjectId()), schoolId: String(schoolId), role: 'parent' });
      await request(app)
        .post('/api/payment-gateway/onegate/fee-payment')
        .set('Authorization', `Bearer ${token}`)
        .send({ invoiceIds: [String(inv._id)], returnUrl: 'campusly://payment-return' })
        .expect(200);
      expect(mockOneGateClient.createPaymentKey).toHaveBeenCalledTimes(1);
      const arg = mockOneGateClient.createPaymentKey.mock.calls[0][0] as { merchant_reference: string };
      expect(arg.merchant_reference).toMatch(/^fee_[a-f0-9]{24}$/);
    });
  });

  // ─── Wallet Topup ───────────────────────────────────────────────────────────

  describe('POST /api/payment-gateway/onegate/wallet-topup', () => {
    it('creates an OnlinePayment and returns OneGate redirectUrl', async () => {
      const schoolId = new mongoose.Types.ObjectId();
      const studentId = new mongoose.Types.ObjectId();

      const wallet = await Wallet.create({
        schoolId,
        studentId,
        balance: 0,
        dailyLimit: 10000,
        currency: 'ZAR',
        autoTopUpEnabled: false,
        isActive: true,
        isDeleted: false,
      });

      spyOnClient();

      const token = signTestToken({
        id: String(new mongoose.Types.ObjectId()),
        schoolId: String(schoolId),
        role: 'parent',
      });

      const res = await request(app)
        .post('/api/payment-gateway/onegate/wallet-topup')
        .set('Authorization', `Bearer ${token}`)
        .send({
          walletId: String(wallet._id),
          amount: 5000,
          returnUrl: 'campusly://payment-return',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.paymentId).toBeDefined();
      expect(res.body.data.redirectUrl).toBe(
        'https://payments.onegate.co.za/checkout/pk_test_xxx',
      );
      expect(res.body.data.expiresAt).toBeDefined();

      const stored = await OnlinePayment.findById(res.body.data.paymentId);
      expect(stored?.status).toBe('pending');
      expect(stored?.provider).toBe('onegate');
      expect(stored?.paymentType).toBe('wallet_topup');
      expect(stored?.externalTransactionId).toBe('pk_test_xxx');
    });

    it('rejects amount <= 0 with 400', async () => {
      const token = signTestToken({ role: 'parent' });
      const res = await request(app)
        .post('/api/payment-gateway/onegate/wallet-topup')
        .set('Authorization', `Bearer ${token}`)
        .send({
          walletId: '507f1f77bcf86cd799439011',
          amount: 0,
          returnUrl: 'campusly://payment-return',
        });

      expect(res.status).toBe(400);
    });

    it('rejects wallet from another school with 404', async () => {
      const schoolA = new mongoose.Types.ObjectId();
      const schoolB = new mongoose.Types.ObjectId();
      const studentId = new mongoose.Types.ObjectId();

      const wallet = await Wallet.create({
        schoolId: schoolB,
        studentId,
        balance: 0,
        dailyLimit: 10000,
        currency: 'ZAR',
        autoTopUpEnabled: false,
        isActive: true,
        isDeleted: false,
      });

      spyOnClient();

      const token = signTestToken({
        id: String(new mongoose.Types.ObjectId()),
        schoolId: String(schoolA),
        role: 'parent',
      });

      const res = await request(app)
        .post('/api/payment-gateway/onegate/wallet-topup')
        .set('Authorization', `Bearer ${token}`)
        .send({
          walletId: String(wallet._id),
          amount: 5000,
          returnUrl: 'campusly://payment-return',
        });

      expect(res.status).toBe(404);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app)
        .post('/api/payment-gateway/onegate/wallet-topup')
        .send({
          walletId: '507f1f77bcf86cd799439011',
          amount: 5000,
          returnUrl: 'campusly://payment-return',
        });

      expect(res.status).toBe(401);
    });

    it('passes a top_-prefixed merchant_reference to OneGate for wallet topup', async () => {
      const schoolId = new mongoose.Types.ObjectId();
      const wallet = await Wallet.create({
        schoolId, studentId: new mongoose.Types.ObjectId(),
        balance: 0, dailyLimit: 10000, currency: 'ZAR',
        autoTopUpEnabled: false, isActive: true, isDeleted: false,
      });
      spyOnClient();
      const token = signTestToken({ id: String(new mongoose.Types.ObjectId()), schoolId: String(schoolId), role: 'parent' });
      await request(app)
        .post('/api/payment-gateway/onegate/wallet-topup')
        .set('Authorization', `Bearer ${token}`)
        .send({ walletId: String(wallet._id), amount: 5000, returnUrl: 'campusly://payment-return' })
        .expect(200);
      expect(mockOneGateClient.createPaymentKey).toHaveBeenCalledTimes(1);
      const arg = mockOneGateClient.createPaymentKey.mock.calls[0][0] as { merchant_reference: string };
      expect(arg.merchant_reference).toMatch(/^top_[a-f0-9]{24}$/);
    });
  });
});
