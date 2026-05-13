import { Plan } from './model.js';

interface PlanSeed {
  code: string;
  name: string;
  subscriberType: 'teacher';
  amountExclTax: number;
  taxRate: number;
  currency: string;
  interval: 'month' | 'year' | null;
  trialDays: number;
  entitlements: {
    aiGeneration: boolean;
    paperGeneration: boolean;
    maxClasses: number | null;
    advancedAnalytics: boolean;
  };
  isActive: boolean;
  displayOrder: number;
  description: string;
}

const PLANS: PlanSeed[] = [
  {
    code: 'free',
    name: 'Free',
    subscriberType: 'teacher',
    amountExclTax: 0,
    taxRate: 0,
    currency: 'ZAR',
    interval: null,
    trialDays: 0,
    entitlements: { aiGeneration: false, paperGeneration: false, maxClasses: 1, advancedAnalytics: false },
    isActive: true,
    displayOrder: 0,
    description: 'Free for individual teachers getting started',
  },
  {
    code: 'pro_monthly',
    name: 'Pro Monthly',
    subscriberType: 'teacher',
    amountExclTax: 14900,
    taxRate: 0,
    currency: 'ZAR',
    interval: 'month',
    trialDays: 14,
    entitlements: { aiGeneration: true, paperGeneration: true, maxClasses: null, advancedAnalytics: true },
    isActive: true,
    displayOrder: 1,
    description: 'Full Pro access, billed monthly',
  },
  {
    code: 'pro_annual',
    name: 'Pro Annual',
    subscriberType: 'teacher',
    amountExclTax: 149000,
    taxRate: 0,
    currency: 'ZAR',
    interval: 'year',
    trialDays: 14,
    entitlements: { aiGeneration: true, paperGeneration: true, maxClasses: null, advancedAnalytics: true },
    isActive: true,
    displayOrder: 2,
    description: 'Full Pro access, billed annually (2 months free)',
  },
];

export async function seedPlans(): Promise<void> {
  for (const plan of PLANS) {
    await Plan.findOneAndUpdate({ code: plan.code }, { $set: plan }, { upsert: true });
  }
}

// CLI mode: detect direct invocation via tsx. On Windows, process.argv[1] uses backslashes
// while import.meta.url is a file:// URL with forward slashes — normalise both before comparing.
const invokedPath = process.argv[1]?.replace(/\\/g, '/') ?? '';
const moduleUrl = import.meta.url;
if (invokedPath && (moduleUrl === `file:///${invokedPath}` || moduleUrl === `file://${invokedPath}` || moduleUrl.endsWith(invokedPath))) {
  (async () => {
    const dotenv = await import('dotenv');
    dotenv.config();
    const m = await import('mongoose');
    const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/campusly';
    await m.default.connect(uri);
    console.log(`Connected to ${uri}`);
    await seedPlans();
    console.log('Plans seeded');
    await m.default.disconnect();
  })().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
