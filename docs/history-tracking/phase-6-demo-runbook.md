# TRT PoC Phase 6 Demo Runbook

**Status:** Presenter guide for the implemented synthetic-data UI.  
**Last updated:** 2026-10-27  
**Typical walkthrough:** 5–7 minutes

## Before the Walkthrough

- Start the app from the repository root with `npm run dev`.
- Begin at `/dashboard` and use the prepared-event links to keep the route flow natural.
- The screens use static fixture data internally. No SafetyNet, transaction store, email, LLM, memory service, or production system is connected. Keep narration aligned with the actual behavior; do not describe fixture values as live measurements.
- Action drafts, decisions, and report notes are held in page state and are not persisted to a server. Downloading an action packet creates a local JSON file; it does not execute or submit the action.
- Use only the bundled example event IDs and synthetic values. Do not enter real PAN, customer, merchant, credentials, or personal data.

## Walkthrough

### 1. Agent Monitor — `/dashboard`

Show the event-preparation overview, recent activity, available intake channels, and prepared-event table. Point out the status, received time, severity, and confidence fields. Open the inbox from `View event inbox`.

### 2. Event Inbox — `/events`

Search by event ID, filter by severity/status/source/date, change sort order, and clear the filters. Open `TRT-2024-087` to show the partial-data scenario, or `TRT-2025-892` for the event with a comparison baseline.

### 3. Event Analysis — `/events/:eventId`

For `TRT-2024-087`, show the 68% coverage, unavailable gate reference, observed-only velocity chart, missing comparison window, and evidence IDs. For `TRT-2025-892`, show the observed/reference trend and the merchant-concentration evidence. Use `Ask Co-Pilot` to continue.

### 4. AI Co-Pilot — `/events/:eventId/copilot`

Choose a suggested question. Expand the evidence link under its answer, then try an unsupported question to show the bounded response. Use `Copy to report` and open `Report notes`; note entries remain in page state and can be removed.

### 5. Action Review — `/events/:eventId/actions`

Select an action choice. Show that `Save draft` is disabled until the action’s required details and rationale are complete. Save a draft, choose an analyst decision, and record it to the local status history. Download the JSON action packet. Explicitly state that no rule is executed and no external approval or email is sent.

### 6. Organizational Memory — `/memory`

Search or filter event history, expand evidence, and follow an event link back to analysis. This is a read-only fixture history, not persistent learned memory.

## Demo Boundaries and Known Gaps

- No file upload, external signal trigger, transaction query, production action, or service integration is available.
- The Co-Pilot uses deterministic event-keyed responses; it is not connected to an LLM.
- Memory records are static fixtures. Retention, access control, persistence, and knowledge-graph behavior remain undecided.
- Memory Clear Filters is covered by its page test. The separate Event Inbox Clear Filters browser interaction remains unverified.
- The proposal’s Azure/AWS architecture and timeline conflicts remain unresolved; do not present either as the selected implementation plan.