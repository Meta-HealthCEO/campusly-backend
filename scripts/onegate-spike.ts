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
  const res = await axios.post(`${BASE}/api/v2/payment-key`, {
    payment_type: 'credit_card',
    amount: '1.00',
    merchant_reference: ref,
    success_url: 'http://localhost:3500/spike/success',
    error_url: 'http://localhost:3500/spike/error',
    pending_url: 'http://localhost:3500/spike/pending',
    notify_url: 'http://localhost:4500/api/webhooks/onegate-spike',
  }, { headers: signHeaders() });
  console.log('Payment key response:', JSON.stringify(res.data, null, 2));
  return res.data.key as string;
}

async function main(): Promise<void> {
  await listServices();
  const key = await mintKey();
  console.log(`\nNext: open scripts/onegate-widget-test.html in a browser, paste this key into the prompt:\n  ${key}\n`);
}

main().catch((err) => { console.error(err.response?.data ?? err); process.exit(1); });
