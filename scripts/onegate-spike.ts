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

async function main() {
  console.log('Spike 1: GET /organisation/{id}/services');
  const services = await axios.get(`${BASE}/api/v2/organisation/${ORG}/services`, { headers: signHeaders() });
  console.log('Services:', JSON.stringify(services.data, null, 2));
}

main().catch((err) => { console.error(err.response?.data ?? err); process.exit(1); });
