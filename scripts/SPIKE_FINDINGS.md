# OneGate Tokenisation Spike — Findings

**Date run:** <FILL IN>
**Card used:** 4229989999000012 / CVV 871 / 12/31 / 3DS test123

## Five questions this spike must answer

1. **Does the widget's `onComplete` payload include a token guid we can charge later?**
   - Observation:
   - Conclusion:

2. **Does the webhook payload (POSTed to `notify_url`) include the token guid?**
   - Observation:
   - Conclusion:

3. **If neither does, do we need to call `/api/v2/customer-token` separately, and if so what does it accept?**
   - Observation:
   - Conclusion:

4. **Is the R1 charge actually settled (visible in OneGate dashboard) or just authorised?**
   - Observation:
   - Conclusion:

5. **Can we refund the R1 charge immediately via `PUT /api/v2/gateway-transaction/{id}/refund`?**
   - Observation:
   - Conclusion:

## Decision gate

Based on findings, one of:

- [ ] **(a) R1 + refund works** → proceed with the plan as written.
- [ ] **(b) Widget doesn't return token** → revise spec: tokenise via `/customer-token` after charge, or capture token separately. Update Phase 2 accordingly.
- [ ] **(c) Tokenisation requires PCI form on our side** → STOP. Renegotiate gateway or skip trial.

## Other findings

(Notes on anything else observed during the spike.)
