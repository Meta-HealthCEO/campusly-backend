// campusly-backend/scripts/onegate-spike.ts
import 'dotenv/config';
import crypto from 'crypto';
import axios from 'axios';

const BASE = process.env.ONEGATE_BASE_URL ?? 'https://payments.onegate.co.za';
const ORG = process.env.ONEGATE_ORG_ID!;
const SALT = process.env.ONEGATE_SALT!;

function signHeaders(): Record<string, string> {
  const ts = Math.floor(Date.now() / 1000).toString();
  const token = crypto.createHash('sha256').update(`${SALT}_${ORG}_${ts}`).digest('hex');
  return { 'Auth-Token': token, 'Org-Id': ORG, 'Timestamp': ts };
}

async function listServices(): Promise<void> {
  console.log('Spike 1: GET /organisation/{id}/services');
  const services = await axios.get(`${BASE}/api/v2/organisation/${ORG}/services`, { headers: signHeaders() });
  console.log('Services:', JSON.stringify(services.data, null, 2));
}

async function mintKey(): Promise<string> {
  const ref = 'spike_' + Math.random().toString(36).slice(2, 10);
  // OneGate UAT rejects http://localhost URLs. Widget flow uses JS callbacks anyway,
  // so these only need to be valid public-looking URLs.
  const body = new URLSearchParams({
    payment_type: 'credit_card',
    amount: '1.00',
    merchant_reference: ref,
    success_url: 'https://example.com/spike/success',
    error_url: 'https://example.com/spike/error',
    pending_url: 'https://example.com/spike/pending',
    notify_url: 'https://example.com/spike/webhook',
  });
  const res = await axios.post(`${BASE}/api/v2/payment-key`, body.toString(), {
    headers: { ...signHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  console.log('Payment key response:', JSON.stringify(res.data, null, 2));
  return res.data.key as string;
}

async function listRecentTransactions(): Promise<void> {
  console.log(`\nSpike 3: GET /organisation/${ORG}/gateway-transaction (recent)`);
  const res = await axios.get(`${BASE}/api/v2/organisation/${ORG}/gateway-transaction`, {
    headers: signHeaders(),
    params: { per_page: 5, page: 1 },
  });
  console.log('Recent transactions:', JSON.stringify(res.data, null, 2));
}

async function inspectTransaction(id: string): Promise<void> {
  console.log(`\nSpike 4: GET /gateway-transaction/${id}`);
  const res = await axios.get(`${BASE}/api/v2/gateway-transaction/${id}`, { headers: signHeaders() });
  console.log('Transaction detail:', JSON.stringify(res.data, null, 2));
}

async function createCustomerToken(merchantReference: string): Promise<void> {
  console.log(`\nSpike 5a: POST /customer-token (merchant_reference=${merchantReference})`);
  const body = new URLSearchParams({ merchant_reference: merchantReference });
  const res = await axios.post(`${BASE}/api/v2/customer-token`, body.toString(), {
    headers: { ...signHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  console.log('Customer-token response:', JSON.stringify(res.data, null, 2));
}

async function chargeToken(guid: string, amount = 1.0): Promise<void> {
  console.log(`\nSpike 5: POST /customer-token/${guid}/pay (R${amount})`);
  const body = new URLSearchParams({
    amount: amount.toFixed(2),
    reference: 'tok_test_' + Math.random().toString(36).slice(2, 10),
    return_url: 'https://example.com/spike/recurring',
  });
  const res = await axios.post(`${BASE}/api/v2/customer-token/${guid}/pay`, body.toString(), {
    headers: { ...signHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  console.log('Charge result:', JSON.stringify(res.data, null, 2));
}

async function main(): Promise<void> {
  const cmd = process.argv[2] ?? 'mint';
  const arg = process.argv[3];

  switch (cmd) {
    case 'services':
      await listServices();
      break;
    case 'mint':
      await listServices();
      const key = await mintKey();
      console.log(`\nNext: open http://localhost:8000/onegate-widget-test.html, paste this key:\n  ${key}\n`);
      break;
    case 'recent':
      await listRecentTransactions();
      break;
    case 'tx':
      if (!arg) throw new Error('Usage: npx tsx scripts/onegate-spike.ts tx <transaction_id>');
      await inspectTransaction(arg);
      break;
    case 'tokenize':
      if (!arg) throw new Error('Usage: npx tsx scripts/onegate-spike.ts tokenize <merchant_reference>');
      await createCustomerToken(arg);
      break;
    case 'charge':
      if (!arg) throw new Error('Usage: npx tsx scripts/onegate-spike.ts charge <token_guid> [amount]');
      await chargeToken(arg, process.argv[4] ? parseFloat(process.argv[4]) : 1.0);
      break;
    default:
      throw new Error(`Unknown command: ${cmd}. Use: services | mint | recent | tx <id> | tokenize <ref> | charge <guid> [amount]`);
  }
}

main().catch((err) => { console.error(err.response?.data ?? err); process.exit(1); });
