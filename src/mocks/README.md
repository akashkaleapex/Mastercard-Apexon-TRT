# Synthetic UI Fixtures

Fixtures in this folder are deterministic demo data, not Mastercard event records. IDs use the `*-DEMO-*` prefix. Do not add PII, real account/cardholder data, credentials, or live service calls.

## Phase 2 fixtures

- `agent/status.ts`: demo-ready monitor state and a short simulated activity feed.
- `events/events.ts`: stable event rows for dashboard and inbox states.
- `shared/sources.ts`: labels that explicitly distinguish simulated sources.
- `shared/timestamps.ts`: fixed UTC timestamps and a single display formatter.

All source labels are synthetic. “Simulated signal” does not represent a SafetyNet connection. “Synthetic test dataset” does not enable file upload. Demo confidence values are illustrative only and must be labeled as demo values in the UI.