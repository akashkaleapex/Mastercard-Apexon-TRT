# TRT PoC UI Screen Implementation Plan

**Status:** Phases 1–6 implemented. Phase 2 inbox interaction verification remains pending.  
**Created:** 2026-10-27 11:35:15 +05:30  
**Plan owner:** Pending assignment  
**Source of truth:** Requirements and decisions listed in this document and [`requirements-traceability.md`](requirements-traceability.md).

## 1. Purpose and Boundary

This document defines a reviewable screen plan before implementation. It translates the call transcript, 23-slide proposal, UI mockups, and repository instructions into proposed screens, route structure, phased delivery, and mock-data organization.

The initial UI should be a synthetic-data PoC/demo. It must not connect to production data, contain PII, execute production rules, perform real-time blocking, or imply live integrations that have not been approved. The mockups are visual references, not proof that every illustrated capability is in the approved PoC scope.

## 2. Reviewed Inputs and Repository Baseline

- [`docs/requirements/call-transcript.md`](../requirements/call-transcript.md): experience-first, executive-ready workflow guidance; accuracy must be presented in the context of available data.
- [`docs/diagrams/Apexon_TRT_POC_proposal_Mastercard (1).pptx`](../diagrams/Apexon_TRT_POC_proposal_Mastercard%20(1).pptx): 23 slides. UI references include Agent Monitor/event notice (slides 4–5), analysis dashboard (slide 6), Co-Pilot (slide 7), and action recommendations (slide 8).
- [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md): React conventions, Tailwind/custom CSS guidance, shadcn/ui + Radix, Lucide React, accessibility, responsive behavior, UI states, and validation rules.
- [`requirements-traceability.md`](requirements-traceability.md): verbatim requirement excerpts, backlog, and unresolved conflicts.
- At plan creation, [`src/App.tsx`](../../src/App.tsx) contained only the Hello World starter and no router was configured.
- Current stack: React 19, Vite, TypeScript, Tailwind CSS v4, shadcn-compatible Button/Radix, Lucide React, and React Router. No API/data adapter or test framework is configured.

## 3. Planning Principles

1. Keep all pages inside one consistent application shell and make the event review the primary workflow.
2. Use shadcn/ui components with Radix primitives, Tailwind utilities, existing CSS tokens, and Lucide React icons. Add only components needed by the approved screens.
3. Use semantic HTML, keyboard-operable controls, visible focus, accessible labels, responsive layouts, and loading/empty/error/success states.
4. Make summaries scannable for business users. Put evidence, source, time window, confidence, and limitations near the claims they support.
5. Clearly distinguish AI suggestions, analyst decisions, drafts, and exported artifacts. Do not present a mock button as executing a live operational action.
6. Keep mock data synthetic and deterministic. Keep it separate from components so later API integration can replace the source without redesigning screens.
7. Treat unresolved choices as gates. Do not choose a cloud platform, external integration, production action, or trigger behavior by inference.
8. Use a white-and-orange visual theme across every phase: white page/surface backgrounds, neutral dark body text, orange primary actions and active navigation, and white text/icons on orange active controls. Keep orange selective, use existing theme tokens, and maintain accessible contrast on every screen.
9. Per the user's explicit presentation decision, do not show synthetic/demo/mock-data labels in the visible UI. Fixture data remains synthetic internally; records may appear live to screen viewers, and this presentation risk is acknowledged in the history log.

## 4. Proposed Navigation and Routes

Use `react-router-dom` as the proposed routing library because the PoC has several distinct screens and deep-linked event work. It is not currently installed; add it only after this plan and routing choice are approved.

| Route | Screen | Navigation behavior | Status |
| --- | --- | --- | --- |
| `/` | Redirect | Redirect to `/dashboard`. | Proposed |
| `/dashboard` | Agent Monitor | Agent readiness, recent activity, prepared events, and entry points. | In proposal mockup |
| `/events` | Event Inbox | Search/filter and open prepared events. | Proposed from event workflow |
| `/events/:eventId` | Event Analysis | Default event summary and analysis view. | In proposal mockup |
| `/events/:eventId/copilot` | Event Co-Pilot | Event-scoped chat and evidence. | In proposal mockup |
| `/events/:eventId/actions` | Action Review | Review or edit a recommendation draft; export/submit only as approved. | In proposal mockup; execution boundary unresolved |
| `/actions` | Action Queue | Track drafts and analyst decisions across events. | Proposed; confirm before implementation |
| `/memory` | Organizational Memory | Search historical events, decisions, and outcomes. | In proposal; retention/content unresolved |
| `/intake` | Event Intake | Upload synthetic sample/report if manual upload is approved. | Optional; input mode unresolved |
| `/settings` | Settings | Do not implement beyond a clearly disabled/placeholder nav entry unless settings requirements are supplied. | Unspecified |
| `*` | Not Found | Accessible not-found page with a route back to dashboard. | Required routing fallback |

The application shell should provide persistent primary navigation for Dashboard, Events, AI Co-Pilot (contextual to an event), Actions, Memory, and Settings. On small screens, collapse navigation accessibly; keep page title, event identifier, and key status visible. Breadcrumbs should identify the current event and subsection.

## 5. Screen Plans

### 5.1 Shared Application Shell

**Purpose:** Give every screen a stable, executive-ready frame.

**Sections:**
- Brand/product header and environment label such as `PoC Sandbox`.
- Primary navigation: Dashboard, Events, Actions, Memory, Settings (settings pending scope).
- Main content header with page title, breadcrumb/context, and primary page action.
- Optional notification/status area for agent state and current synthetic/demo mode.

**Interactions and states:** Active route indication; accessible mobile navigation; visible demo/synthetic-data label; keyboard focus; route-level loading and error handling.

### 5.2 Dashboard / Agent Monitor (`/dashboard`)

**Reference:** Proposal slides 4–5.

**Sections:**
- Agent status: readiness, last activity, current mode, and data environment.
- Activity feed: signal received, data prepared, analysis completed, and analyst handoff, each with a timestamp and status.
- Prepared events table: TRT/event ID, severity, received time, status, confidence/readiness, and `Review` link.
- Source-activity labels use the approved product wording. Mock provenance remains internal per the presentation decision; do not add visible synthetic/demo labels without a new decision.
- Primary actions: open Events; optionally begin sample upload if intake is approved.

**States:** No prepared events; agent idle; processing; source unavailable; event ready; failure/retry. All timestamps should use a consistent timezone/display convention.

### 5.3 Event Inbox (`/events`)

**Purpose:** Find and open events without navigating the dashboard feed.

**Sections:** Search; filters for severity, event status, date range, and source; sortable results table; result count and last-updated time.

**Row fields:** Event ID, severity, signal/received time, status, affected merchant/PAN counts when present, analysis confidence, and review action.

**States:** Empty inbox, no filter matches, loading, data error, and populated results. Filters should be shareable through URL query parameters if practical.

### 5.4 Event Analysis Dashboard (`/events/:eventId`)

**Reference:** Proposal slide 6.

**Sections:**
- Event header: event ID, severity, current status, signal time, source, and available time window.
- Gate/risk summary: gate proximity/status and confidence, with definitions/source visible.
- AI event summary: likely explanation, evidence links, confidence, data coverage, and explicit limitations.
- Metric strip: transaction volume, velocity, merchant/PAN concentration, and geographic spread when supplied by the fixture.
- Analysis area: trend/baseline chart with selected period, impacted merchants/PANs, triggers/change drivers, and contextual findings.
- Actions: open Co-Pilot, review recommendations, and export a structured report (mock export only until approved).

**States:** Partial/missing data; no comparable baseline; analysis pending/failed; low confidence. Chart/table values must remain traceable to fixture records and not be presented as real operational findings.

### 5.5 Event Co-Pilot (`/events/:eventId/copilot`)

**Reference:** Proposal slide 7.

**Sections:** Event context rail with key metrics/status; conversation transcript; suggested questions; message composer; evidence/source panel for answers.

**Interactions:** Submit a sample question and return a deterministic fixture response; expand evidence; copy response to report; create an action draft only if the action boundary is approved. Show unsupported-question and empty conversation states.

**Boundary:** Mock responses must be labeled as demo content and must not imply a connected LLM or factual answer over data not included in the mock fixture.

**Implementation status:** Event-scoped Co-Pilot implemented with event-keyed suggested questions and deterministic responses linked to existing evidence IDs. Unsupported questions return a bounded answer without evidence. Responses can be added to and removed from page-local report notes. No LLM, server persistence, external query, or action draft is connected. Build, type-check, lint, supported/unsupported response, evidence, report-note add/remove, and mobile overflow checks pass.

### 5.6 Action Review (`/events/:eventId/actions`)

**Reference:** Proposal slide 8.

**Recommendation choices:** Block/monitor, whitelist, threshold update, or no action, as shown in the proposal. Display confidence, explanation, evidence, and selected/recommended status.

**Review form sections:** Target gate; duration; current/proposed value; affected merchants/PANs; AI-generated justification; analyst notes; approver; decision/status timeline.

**Actions:** Select/edit recommendation; save draft; export UDT/action packet; send/email only if that behavior is explicitly approved. The default PoC action should be a local draft/record, not a live operational change.

**States:** Draft, awaiting review, approved/rejected/modified, export complete/error, and validation error. Do not use a success state that suggests real systems were changed when only mock state changed.

### 5.7 Action Queue (`/actions`)

**Status:** Proposed screen; confirm it is needed before implementation.

**Sections:** Cross-event decision queue, status and owner filters, event ID, recommendation type, created/updated timestamp, approver, and link back to event/action review.

**State/data boundary:** Derive entries from synthetic action records. Do not duplicate the event-level source of truth.

### 5.8 Organizational Memory (`/memory`)

**Reference:** Proposal slides 3, 10, 12, and 16.

**Sections:** Search/filter historical event records; event pattern/similarity; prior evidence and recommendation; analyst decision; recorded outcome; timestamps and source.

**Boundary:** Start as read-only synthetic history. Knowledge graph behavior, persistence, permitted contents, retention, access, and delete behavior require stakeholder decisions. Do not label mock fixture data as learned production memory.

### 5.9 Event Intake (`/intake`)

**Reference:** Proposal slides 2 and 5; proposal also describes an autonomous signal-led flow.

**Conditional sections:** Upload/drop zone for an approved sample file; accepted format and size; validation summary; field mapping/preview; processing status; link to created event.

**Boundary:** Only implement if upload is approved as a primary or fallback path. The current plan assumes local mock parsing for a demo, not cloud storage, external transaction pulls, or real signal subscription.

### 5.10 Settings (`/settings`)

The proposal shows Settings in navigation but does not define its behavior. Keep the route disabled or omit it until users define the settings. Do not invent profile, threshold, integration, or security controls.

## 6. Proposed Mock-Data Organization

Create feature-separated fixtures under `src/mocks/`. Components should consume typed selectors/adapters rather than importing raw fixture arrays throughout the UI.

```text
src/
  mocks/
    README.md                 # Synthetic-data rules, scenario index, ownership
    shared/
      timestamps.ts          # Fixed clock and display-time fixtures
      sources.ts              # Simulated source labels/status
    agent/
      status.ts               # Agent status and activity feed
    events/
      events.ts               # Event records and inbox fixtures
      transactions.ts         # Synthetic transaction rows, if screens need detail
      metrics.ts              # Metric summaries and time-series/baseline points
    analysis/
      findings.ts             # Rationale, evidence references, confidence/limits
    copilot/
      conversations.ts        # Sample prompts, answers, and evidence references
    actions/
      recommendations.ts      # Recommendation variants and action draft state
    memory/
      records.ts              # Synthetic prior events, decisions, outcomes
```

**Mock-data rules:**
- Use only synthetic/anonymized examples; no customer/cardholder data or real identifiers.
- Use stable IDs and deterministic timestamps so routes and screenshots stay reproducible.
- Keep records internally consistent: event IDs, metric totals, action references, and evidence IDs must agree across screens.
- Include representative scenarios: complete/high-confidence, partial-data/low-confidence, no baseline, and action pending. The specific scenario set should be approved.
- Keep source and confidence metadata with each relevant finding; do not fabricate provenance.
- Add typed interfaces in a shared domain/types location when implementation begins; avoid defining the same record shape separately in components.
- Keep synthetic provenance in fixtures and source code; do not expose synthetic/demo labels in visible screens per the user-approved presentation decision. This means fixture-backed records may appear live.
- No secrets, environment credentials, or external service calls in mock modules.

## 7. Implementation Phases and Gates

Phases are dependency ordered, not a newly approved calendar commitment. The proposal contains different week-by-week schedules (slides 18 and 20); do not assign calendar dates or claim those schedules are reconciled until stakeholders confirm.

### Phase 0 — Decisions and Screen Sign-off

**Includes:** Resolve trigger/integration mode, cloud assumptions, data/upload path, recommendation execution boundary, memory/privacy/retention, acceptance criteria, screen navigation, and which mockups are in PoC scope. Approve this screen plan and fixture scenarios.

**Exit gate:** Decisions recorded with owner/date; no unresolved decision blocks the selected demo path.

### Phase 1 — App Shell, Routes, and UI Foundations

**Includes:** Add the approved router; app shell/navigation; route fallback; shared page header, status, tables, tabs, dialogs, badges, and form patterns as needed; responsive and accessibility foundations; typed mock-data conventions and fixed-clock timestamps.

**Screens:** Shared shell and placeholder routes only.

**Exit gate:** Navigation works by link and direct URL; responsive shell and keyboard flow pass review; lint/typecheck/build pass.

**Status:** Complete. React Router routes render the shared responsive shell and phase-labeled placeholders. The dashboard redirect, event-context routes, and not-found route were smoke-tested. Product workflows and mock data remain unimplemented.

### Phase 2 — Dashboard, Event Inbox, and Approved Intake

**Includes:** Agent Monitor, event list/filter, prepared-event status, and upload/intake only if Phase 0 approves it. Implement local deterministic progress/status transitions; no external integrations.

**Mock files:** `agent/status.ts`, `shared/timestamps.ts`, `shared/sources.ts`, `events/events.ts`; optionally an intake scenario in `events/`.

**Exit gate:** User can navigate from dashboard/inbox to a known synthetic event; statuses and timestamps are consistent.

**Implementation status:** Agent Monitor and Event Inbox implemented with deterministic fixtures, UTC timestamp formatting, URL-backed search/filters/sort, and event links. Intake remains excluded pending approval. Build, type-check, lint, and dashboard render checks pass. Browser automation could not retain page IDs for inbox interaction/mobile checks; the exit gate is not fully verified.

### Phase 3 — Event Analysis Dashboard

**Includes:** Event header, summary, metrics, baseline chart, impacted entities, gate context, evidence, confidence/limitations, export affordance.

**Mock files:** `events/metrics.ts`, optional `events/transactions.ts`, `analysis/findings.ts`.

**Exit gate:** Displayed metrics and evidence references reconcile with the selected event fixture; missing-data and low-confidence states are visible.

**Implementation status:** Event Analysis route implemented for all four event records with summary, coverage/confidence/gate context, metric strip, hourly trend/reference chart, observed indicators, impacted merchant groups, evidence, and local JSON export. Matched-baseline and missing-baseline routes were inspected; the partial-data route visibly reports unavailable comparison and gate metadata. Build, type-check, lint, and mobile no-overflow check pass. Unknown-event and export interactions were not browser-verified.

### Phase 4 — Event Co-Pilot

**Includes:** Event-aware chat layout, suggested prompts, deterministic fixture responses, evidence/source panel, copy-to-report. Action-draft creation remains gated by the Phase 0 decision.

**Mock files:** `copilot/conversations.ts` and related `analysis/findings.ts` references.

**Exit gate:** Demo responses are clearly synthetic, tied to the correct event, and show evidence/unsupported-answer states.

### Phase 5 — Action Review and Decision Record

**Includes:** Recommendation choices, confidence/rationale, editable form, analyst decision, draft lifecycle, and approved export behavior. No production execution.

**Mock files:** `actions/recommendations.ts`, action decision fixtures, shared timestamps.

**Exit gate:** Draft/decision state is auditable and clearly distinct from operational execution; validation and error states work.

**Implementation status:** Event-scoped Action Review implemented with the five proposal action choices, conditional fields, required-field gating, event evidence/context, page-local draft and decision history, and local JSON action-packet download. No action is sent to another system and no rules are executed. TypeScript/build/lint and browser draft/decision/mobile checks pass. The browser harness did not emit a download event, but the click handler was verified to create and activate a JSON Blob link.

### Phase 6 — Memory, Final Integration, and Demo Readiness

**Includes:** Read-only synthetic memory/history, cross-screen consistency, route/deep-link review, accessibility and narrow/wide viewport checks, empty/error/loading states, and demo script aligned with approved requirements.

**Mock files:** `memory/records.ts`, with consistent event/action references.

**Exit gate:** Dashboard-to-event-to-Co-Pilot/action/history flow is coherent; tests, lint, type-check, build, and agreed viewport checks pass.

**Implementation status:** Added a read-only searchable/filterable history view with linked event, decision, outcome, and expandable evidence records. Records remain static fixtures; no persistence, retention, access-control, or knowledge-graph behavior was added. Added Vitest/Testing Library and cross-screen regression tests, plus a presenter runbook. All 3 tests, type-check, lint, and build pass. Browser checks confirm evidence expansion, event navigation, and 390px table containment; Event Inbox Clear Filters browser verification remains pending.

## 8. Proposed Code Organization (After Plan Approval)

```text
src/
  app/
    router.tsx
    AppShell.tsx
  components/
    layout/
    ui/                       # shadcn/ui components
  features/
    dashboard/
    events/
    copilot/
    actions/
    memory/
    intake/                   # only if approved
  mocks/                      # feature-separated synthetic data above
  types/                      # shared typed domain contracts
  lib/                        # cn and small shared utilities
```

Keep screens and feature components near their feature. Shared UI components should be genuinely reused; do not build a generic framework ahead of the approved needs. Routing, mock data, and presentation should be separable so a later approved API adapter can replace fixtures.

## 9. Open Decisions Before Phase 1

Use [`requirements-traceability.md`](requirements-traceability.md) for the full conflict record. The following are implementation blockers:

1. Is SafetyNet signal detection simulated, file/email-driven, or connected to an approved test integration?
2. Which cloud/provider is the authoritative PoC target? The deck mixes Azure and AWS and includes mislabeled services.
3. Is upload a primary path, fallback, or out of scope for the first demo?
4. Which recommendations can be saved/exported/emailed, and is any submit action only a local draft/decision record?
5. Is a cross-event Action Queue required, or are event-scoped review screens sufficient?
6. What is included in Memory, who can see it, and what are retention/deletion rules?
7. Which proposal timeline is approved, and what demo acceptance criteria/data scenarios are expected?
8. Does Settings need a real screen in this PoC?

## 10. Timestamped Decision and Change Log

Record dates/times with timezone. Add one row for every change to scope, screen content, route, fixture behavior, or acceptance criteria. Link each change to a source, decision owner, and affected phase.

| Timestamp (+05:30) | Type | Change/decision | Source or owner | Affected phase/status |
| --- | --- | --- | --- | --- |
| 2026-10-27 11:35:15 | Plan created | Initial phased screen, routes, mock-data, and review gates drafted. No application behavior changed. | Transcript, proposal slides, Copilot instructions, traceability note | Phase 0 review pending |
| 2026-10-27 11:42:52 | Phase complete | Added React Router, persistent shell, responsive primary navigation, event-context routes, phase-labeled screen placeholders, and not-found route. Verified all planned routes; build, lint, mobile overflow, and editor diagnostics pass. | User approved proceeding phase by phase | Phase 1 complete; Phase 2 pending |
| 2026-10-27 11:48:09 | Theme decision | Set the shared visual system to white surfaces, neutral dark text, orange primary/active navigation, and white text/icons on orange. This visual rule applies to every future phase. | User direction | Phase 1 updated; Phase 2 not started |
| 2026-10-27 12:00:58 | Phase 2 implementation | Added synthetic Agent Monitor and Event Inbox, typed fixtures, UTC formatting, URL-backed filters/sort, and shared event table. Intake and integrations remain out of scope. | Approved Phase 2 plan | Build/typecheck/lint pass; browser filter/mobile verification pending |
| 2026-10-27 12:09:39 | UI data-label decision | Removed visible demo/synthetic/mock-data notices and wording; records continue to come from internal fixtures and may appear live to viewers. | User selection; presentation risk acknowledged | Applies to all UI phases |
| 2026-10-27 12:28:49 | Phase 3 implementation | Added event analysis using event-specific metric, trend, finding, evidence, coverage, and gate fixtures; lazy-loaded Recharts; summary export. | Approved Phase 3 plan | Build/typecheck/lint and route snapshots pass; unknown-event/export interactions not browser-verified |
| 2026-10-27 12:38:17 | Phase 4 implementation | Added event-scoped Co-Pilot suggestions and evidence-linked deterministic responses, unsupported-question handling, and page-local report notes. | Approved Phase 4 plan | Build/typecheck/lint and response/evidence/report/mobile browser checks pass; no LLM or persistence added |
| 2026-10-27 12:43:35 | Co-Pilot UX refinement | Reduced heading height and description, placed chat before compact event context on mobile, tightened question suggestions, and balanced the report panel grid at desktop. | User feedback | 390px no-overflow and desktop 2/3-column layout checks pass |
| 2026-10-27 12:55:40 | Reference-inspired chatbot UI | Moved the Co-Pilot title into a focused chat header; added compact event metrics/gate/merchant context, prompt chips, analyst bubbles, pill composer, and contextual active navigation. | User-provided UI reference | Build/typecheck/lint pass; desktop and 390px layout checks show no overflow |
| 2026-10-27 13:01:48 | Co-Pilot internal scroll | Constrained the Co-Pilot shell to the viewport and moved long conversation history into an independently scrollable chat region; event context and report notes scroll within their own panels. | User feedback | At 390×844, document has no overflow or scroll offset; conversation overflows and scrolls inside its 243px viewport; lint/diagnostics pass |
| 2026-10-27 13:12:10 | Phase 5 action review | Added proposal action choices, conditional review form, validation, page-local draft/decision history, evidence context, and JSON packet export. No production execution or external submission. | Approved Phase 5 plan | TypeScript/build/lint pass; draft, approved decision, history, and mobile checks pass; Blob link activation verified, download event not surfaced by browser harness |
| 2026-10-27 13:20:34 | Phase 6 memory/history | Added read-only event history with URL-backed search/filters, decisions, outcomes, linked evidence, and event routes. Records remain static fixtures; persistence and retention are not implemented. | Approved Phase 6 plan | Build/typecheck/lint pass; evidence expansion, event navigation, and mobile table containment pass; Clear Filters browser click remains unverified |
| 2026-10-27 13:42:21 | Phase 6 readiness | Added Vitest/Testing Library, regression tests for Memory, Action Review, and Co-Pilot, and a route-by-route presenter runbook. | Phase 6 exit gate | All 3 tests, typecheck, lint, and build pass; Event Inbox Clear Filters browser interaction remains pending |
| Pending | Decision | SafetyNet trigger and integration mode | Pending owner | Blocks Phase 0 exit |
| Pending | Decision | Cloud architecture and service stack | Pending owner | Blocks architecture setup |
| Pending | Decision | Upload and recommendation execution boundary | Pending owner | Blocks Phases 2 and 5 |
| Pending | Decision | Memory scope, retention, and access | Pending owner | Blocks Phase 6 |

## 11. Plan Review Checklist

- [ ] Confirm the 10 routes/screens and remove out-of-scope screens.
- [ ] Confirm shared navigation labels and event-detail sub-navigation.
- [ ] Confirm trigger, upload, cloud, action, memory, and timeline decisions.
- [ ] Confirm synthetic scenarios and fixture fields with domain SMEs.
- [ ] Confirm each phase's exit criteria and acceptance owner.
- [ ] Record approvals and modifications in the timestamped log before implementation starts.