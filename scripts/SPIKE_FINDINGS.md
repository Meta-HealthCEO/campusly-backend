# OneGate Tokenisation Spike — Findings

**Date run:** 2026-05-13
**Card used:** 4229989999000012 / CVV 871 / 12/31 / 3DS via Visa ACS simulator (Yes button)

## TL;DR

**Decision gate:** **(a)** — proceed with the plan, but with **two material adjustments**:

1. **Switch from Checkout Widget v4 to hosted-page redirect flow** (Approach A from the spec).
   The widget triggers a 3DS challenge in an iframe-within-iframe which the browser
   sandboxes — the inner iframe can't POST the 3DS method form back to its parent,
   so the modal hangs/goes blank after card submission. Full-page redirect to
   `/pay/hosted` works perfectly because 3DS challenges happen at top-window level.
2. **All POST/PUT bodies must be `application/x-www-form-urlencoded`**, not JSON.
   OneGate's Yii backend doesn't accept JSON — fields are reported as "blank".

Plus one production-readiness flag (see Question 5).

---

## Five questions this spike must answer

### 1. Does the widget's `onComplete` payload include a token guid we can charge later?

**Inconclusive — pivoting to hosted-redirect flow.** The v4 widget could not be completed end-to-end because of an iframe-within-iframe 3DS issue:

- The widget script (`EftSecureCheckout`) loads correctly with `serviceUrl: 'https://payments.onegate.co.za/rpp-transaction/create-from-key'`.
- The card-entry modal renders.
- On submit, 3DS is triggered via a hidden `<iframe>` posting a `3DSMethodData` form to `https://3ds-acs.test.modirum.com/mdpayacs/3ds-method`. That nested iframe can't communicate with our top-level page (browser sandbox enforcement).
- Conclusion: the v4 widget is fine for non-3DS flows (EFT, Apple/Google Pay) but the 3DS credit-card flow needs full-page redirect.

### 2. Does the webhook payload include the token guid?

**Not tested directly** — but the `success_url` redirect (which is what the hosted flow returns the user to) includes the `transaction_id`, which we then look up via `GET /gateway-transaction/{id}` to retrieve all token data. The webhook will follow the same pattern (notify_url POST with `callpay_transaction_id`, we re-fetch via lookup endpoint — the spec already prescribed this).

### 3. If neither does, do we need to call `/api/v2/customer-token` separately?

**Tested.** The `/api/v2/customer-token` endpoint requires a **new** `merchant_reference` — passing the reference of an existing payment returns `"Merchant reference already exists in database"`. So this endpoint is NOT the mechanism for converting an existing payment into a saved card.

**Actual mechanism:** The first successful payment via `/payment-key`+hosted-page returns a transaction whose **top-level `token` field IS the customer-token GUID**. Use that directly with `/customer-token/{guid}/pay` for recurring charges. No separate tokenisation call needed.

### 4. Is the R1 charge actually settled (visible in OneGate dashboard) or just authorised?

**Settled.** `successful: 1`, `status: "complete"`, `responseText: "Approved"` on the lookup. `is_demo_transaction: 1` confirms UAT mode. The R1 amount was processed end-to-end.

The **R1+refund** pattern is therefore viable: we charge R1 on signup to capture the card+token, then immediately refund.

### 5. Can we refund the R1 charge immediately?

**Not tested in this spike** (would have required another full payment cycle). Endpoint is documented; format is `PUT /api/v2/gateway-transaction/{id}/refund` with optional `amount` field. Will be implemented and tested in Task 1.8 + manual UAT during Phase 9.

---

## Decision gate

- [x] **(a) R1 + refund works → proceed with the plan**, with the adjustments below.

## Material adjustments to plan/spec

### Adjustment 1 — Flow: Widget → Hosted Redirect

Spec §2 and the entire frontend Checkout design (Tasks 5.5, 6.1–6.3) need to swap from Approach B (widget) to Approach A (redirect):

**Before (Widget v4):**
```ts
new EftSecureCheckout({ serviceUrl, paymentKey, onComplete }).init();
```

**After (hosted redirect):**
```ts
window.location.href = paymentKeyResponse.url;
// User completes card+3DS on OneGate
// OneGate redirects to success_url with ?transaction_id=...&status=complete
// Our /subscription/success page reads query params, calls backend to reconcile
```

UX is slightly worse (user leaves Campusly to pay) but it's the only flow that handles 3DS reliably. This is what every SA payment integration (PayFast, Yoco, Peach) does.

### Adjustment 2 — OneGate client uses form encoding

All POST/PUT calls to OneGate must send `Content-Type: application/x-www-form-urlencoded`. Spec/plan Task 1.8 already updated with this fix.

### Production-readiness flag

**The UAT demo card forces 3DS on recurring charges too** — a recurring charge via `/customer-token/{guid}/pay` returns `type: "3ds_redirect"` requiring user redirect. This is the demo card's behaviour; **production cards should support MIT (Merchant Initiated Transaction) exemption** and bill silently.

**Before production launch:**
1. Confirm with OneGate/Callpay support that MIT exemption is enabled for our merchant account
2. Verify with at least one real card that recurring charges return `type: "result"` with `success: 1` inline (no 3DS redirect)
3. Design dunning to handle the "3DS challenge required on recurring" case as a fallback: mark the subscription as needing user re-verification, email a link, retry after they auth

For UAT testing, the spike script's `charge` command shows the 3DS redirect; the test path is to follow the redirect, click "Yes" on the ACS simulator, then confirm the transaction reconciles via lookup.

---

## Token format clarification

The transaction response has **three** token-shaped values; only the top-level `token` is usable with `/customer-token/{guid}/pay`:

| Field | Format | Use |
|---|---|---|
| `token` (top-level) | `71CDEE38-2157-4626-A60D-3B11EBEE3A4F` | ✅ Charge via `/customer-token/{this}/pay` |
| `gateway_response_parameters.card_token` | Same value | (mirror of `token`) |
| `gateway_response_parameters.gatewayCardToken` | `69777ccb-4a06-48f0-87ba-b9607d33f691` | ❌ Imbeko-internal — returns "No card tokenised" |

Always extract `transaction.token` (top-level) after the initial payment.

## Reference data captured during the spike

- **Initial successful txn:** `id: 175656359`, `merchant_reference: spike_1ghqchyu`, `token: 71CDEE38-2157-4626-A60D-3B11EBEE3A4F`
- **Recurring charge attempt:** `gateway_transaction_id: 175656747` (returned `3ds_redirect`)
- **Card details captured (for UI):** `card: "422998******0012"`, `cardName: "Visa"`. Expiry is in the gateway_response_parameters — to confirm exact field name during Task 1.8.

## Other findings

- **Demo card uses Visa ACS test simulator with Yes/No buttons**, not the "test123" auth code shown in the PDF. The PDF reflects an older 3DS1 flow; UAT now runs 3DS2 with a button simulator.
- **HTTPS required for `success_url`/`error_url`/`pending_url`/`notify_url`** — `http://localhost:*` is rejected with "URL is not a valid URL". For local dev we'll need an HTTPS tunnel (ngrok / cloudflared) or to test against a deployed environment.
- **CSP `frame-ancestors 'self'` warning is report-only** in UAT. Production may be enforcing — check before launch.
- **`file://` origin completely breaks** the widget's postMessage handshake. Frontend must be served over real HTTP origin (we'll do this naturally via Next.js dev server, but local file-system testing is impossible).
