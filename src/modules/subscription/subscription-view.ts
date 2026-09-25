// What of a school's subscription a signed-in user may see (ruling R4).
// Every member of a school reads its subscription (/auth/me, /subscriptions/me),
// so every response that carries one goes through subscriptionForViewer.
import { isBillingOwner, type BillingViewer } from '../../middleware/require-billing-owner.js';

/** Never leave the server. */
const SECRET_FIELDS = ['cardTokenGuid', 'gatewayCustomerRef', 'processingLockedAt'];
/** Only whoever pays sees the card, why a payment failed, and when it is retried. */
const OWNER_FIELDS = [
  'cardLastFour', 'cardBrand', 'cardExpiryMonth', 'cardExpiryYear',
  'lastFailureReason', 'retryCount', 'nextRetryAt',
];

export function subscriptionForViewer(
  sub: { toObject: () => Record<string, unknown> } | null,
  viewer: BillingViewer,
): Record<string, unknown> | null {
  if (!sub) return null;
  const hidden = isBillingOwner(viewer) ? SECRET_FIELDS : [...SECRET_FIELDS, ...OWNER_FIELDS];
  return Object.fromEntries(Object.entries(sub.toObject()).filter(([key]) => !hidden.includes(key)));
}
