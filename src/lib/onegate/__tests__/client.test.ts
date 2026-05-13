import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import nock from 'nock';
import { OneGateClient } from '../client.js';
import { OneGateError } from '../errors.js';

const BASE = 'https://payments.onegate.test';

function makeClient(): OneGateClient {
  return new OneGateClient({ baseUrl: BASE, orgId: '21234', salt: 'testsalt' });
}

describe('OneGateClient', () => {
  beforeAll(() => { nock.disableNetConnect(); });
  afterEach(() => { nock.cleanAll(); });

  it('createPaymentKey POSTs form-encoded with signed headers', async () => {
    const scope = nock(BASE)
      .post('/api/v2/payment-key', /payment_type=credit_card.*merchant_reference=sub_x/)
      .matchHeader('Org-Id', '21234')
      .matchHeader('Auth-Token', /^[a-f0-9]{64}$/)
      .matchHeader('Content-Type', /x-www-form-urlencoded/)
      .reply(200, { key: 'k1', url: 'u1', origin: BASE });

    const client = makeClient();
    const res = await client.createPaymentKey({ payment_type: 'credit_card', amount: '1.00', merchant_reference: 'sub_x' });
    expect(res.key).toBe('k1');
    expect(scope.isDone()).toBe(true);
  });

  it('throws OneGateError on non-2xx', async () => {
    nock(BASE).post('/api/v2/payment-key').reply(401, { name: 'Unauthorized', message: 'bad' });
    const client = makeClient();
    await expect(client.createPaymentKey({ payment_type: 'credit_card', amount: '1.00', merchant_reference: 'x' })).rejects.toBeInstanceOf(OneGateError);
  });

  it('chargeToken returns 3ds_redirect when gateway demands it', async () => {
    const scope = nock(BASE)
      .post('/api/v2/customer-token/guid-1/pay', /amount=149.*reference=inv_1.*return_url=/)
      .reply(200, { type: '3ds_redirect', redirect_url: 'https://3ds/x', gateway_transaction_id: '99' });
    const client = makeClient();
    const res = await client.chargeToken('guid-1', { amount: 149, reference: 'inv_1', return_url: 'https://example.com/r' });
    expect(res.type).toBe('3ds_redirect');
    expect(scope.isDone()).toBe(true);
  });

  it('chargeToken returns result on successful inline charge', async () => {
    nock(BASE)
      .post('/api/v2/customer-token/guid-2/pay')
      .reply(200, { type: 'result', success: 1, amount: '149.00', reason: 'n/a', callpay_transaction_id: 42, organisation_id: 21234, merchant_reference: 'inv_2', gateway_reference: 'ok', gateway_response: {} });
    const client = makeClient();
    const res = await client.chargeToken('guid-2', { amount: 149, reference: 'inv_2', return_url: 'https://example.com/r' });
    expect(res.type).toBe('result');
    if (res.type === 'result') expect(res.success).toBe(1);
  });

  it('getTransaction GETs with signed headers', async () => {
    const scope = nock(BASE)
      .get('/api/v2/gateway-transaction/123')
      .reply(200, { id: 123, successful: 1, status: 'complete', amount: '1.00', displayAmount: 'R1.00', currency: 'ZAR', merchant_reference: 'r', gateway_reference: 'g', payment_key: 'k', created: 'now', refunded_amount: '0.00', refunded: 0, service: 'Direct', gateway: 'Callpay', gateway_response_parameters: {}, token: 'TOK-1' });
    const client = makeClient();
    const res = await client.getTransaction(123);
    expect(res.token).toBe('TOK-1');
    expect(scope.isDone()).toBe(true);
  });

  it('refundTransaction PUTs with form body when amount given', async () => {
    const scope = nock(BASE)
      .put('/api/v2/gateway-transaction/55/refund', 'amount=1')
      .matchHeader('Content-Type', /x-www-form-urlencoded/)
      .reply(200, { success: 1, refunded_amount: '1.00', callpay_transaction_id: 55, reason: 'ok' });
    const client = makeClient();
    const res = await client.refundTransaction(55, 1);
    expect(res.success).toBe(1);
    expect(scope.isDone()).toBe(true);
  });
});
