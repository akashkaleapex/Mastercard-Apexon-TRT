# TRT PoC Requirements and Implementation Trace

**Review date:** 2026-10-27  
**Review status:** Requirements review completed; Phases 1–6 UI are implemented. Inbox Clear Filters browser interaction remains unverified.

## Sources Reviewed

- [`docs/requirements/call-transcript.md`](../requirements/call-transcript.md): meeting transcript excerpt, 33:49–37:51.
- [`docs/diagrams/Apexon_TRT_POC_proposal_Mastercard (1).pptx`](../diagrams/Apexon_TRT_POC_proposal_Mastercard%20(1).pptx): 23 slides, including proposal scope, architecture diagrams, workflow diagrams, and UI mockups.
- [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md): implementation, React/UI, and validation rules.
- [`src/App.tsx`](../../src/App.tsx) and [`package.json`](../../package.json): current application baseline.

`docs/api/` contains no files in the reviewed workspace.

## Exact Wording and Meaning

| Source | Exact wording | Requirement or implication |
| --- | --- | --- |
| Transcript, Sanjoy Ghosh, 34:08 | “think production not only about the architecture, think production also from an experienced standpoint.” | The PoC should feel credible and production-minded in both architecture and user experience; this is not permission to deploy production integrations that the proposal excludes. |
| Transcript, Sanjoy Ghosh, 34:08 | “for them, experience matters A lot.” | Stakeholders are described as business-oriented; prioritize an understandable, polished workflow. |
| Transcript, Sanjoy Ghosh, 35:30–35:59 | “every screen that you build, your screen should be top-notch” and “your dashboard, your navigation should be should be like world class ... clean ... executive ready, clean” | Build a coherent executive-ready dashboard and navigation, not disconnected technical screens. Ellipses indicate omitted transcript text. |
| Transcript, Sanjoy Ghosh, 35:07–35:19 | “In POC, you can only get to a certain accuracy” and “accuracy is a directly proportional to the data. The volume of data” | Make data limitations and confidence understandable; do not imply accuracy beyond the available sample data. The quotation preserves the transcript’s wording. |
| Proposal, slide 2, In-Scope Capabilities | “Automatic TRT data collection upon Signal detection (transaction pulls, report assembly, context gathering)” | Prepare event context from a TRT signal. The extent of live data-source integration needs clarification because external integrations are also listed as out of scope. |
| Proposal, slide 2, In-Scope Capabilities | “Agent-initiated workflow starting from TRT Signal” | Provide a signal-led workflow rather than making manual file upload the only entry point. |
| Proposal, slide 2, In-Scope Capabilities | “UI to upload and process event data with visual TRT dashboard” | Keep upload/process support and a visual dashboard in scope, including as a possible PoC/demo path. |
| Proposal, slide 2, In-Scope Capabilities | “Event-level analysis and contextual enrichment with root cause explanation” | Show event metrics, context, likely causes, gate proximity, and rationale. |
| Proposal, slide 2, In-Scope Capabilities | “Recommended actions generation and TRT workflow acceleration” | Produce suggested operational actions; distinguish recommendation/draft from executing a production rule. |
| Proposal, slide 2, In-Scope Capabilities | “AI-powered chat-bot for interactive querying of event data” | Provide event-aware natural-language follow-up questions. |
| Proposal, slide 2, Out of Scope | “Fraud detection / anomaly detection”; “Real-time streaming or production deployment”; “Integration with external systems (Splunk, Safety Net)”; “Automated rule execution in production” | Do not silently expand the PoC into fraud detection, production streaming/deployment, live integrations, or production rule execution. Resolve the SafetyNet trigger/integration ambiguity before designing the trigger path. |
| Proposal, slide 3, User Journey | “The agent gets auto triggered from the SafetyNetSignals itself and does the data pull — no human trigger required.” | Intended flow: trigger, fetch fresh transactions, assemble report, analyze/enrich, draft actions, then hand off to an analyst. A demo simulation may be needed if live integration is excluded. |
| Proposal, slide 3, Analyst flow | “Review Event”; “Interrogate”; “Decide & Action”; “Feedback” | The analyst reviews prepared insights, asks questions, approves/modifies/exports an action packet, and records the outcome for future learning. Human review remains part of the described flow. |
| Proposal, slide 9, Solution Themes | “Volumes, velocity, merchant / PAN concentration, geo spread.” | Dashboard/analysis metrics should include these dimensions when present in the supplied data. |
| Proposal, slide 9, Solution Themes | “Likely root causes, gate interactions, false-positive indicators.” | Provide contextual analysis and decision support, not only raw counts. |
| Proposal, slide 9, Solution Themes | “Block / monitor, whitelist, threshold update, or no action.” | These are recommendation categories; approval/execution boundaries still need a decision. |
| Proposal, slide 9, Solution Themes | “Structured report and prefilled forms (UDT / threshold / whitelist).” | Support exportable, prefilled action/report artifacts. |
| Proposal, slide 17, Key Assumptions | “PoC uses synthetic/anonymized TRT data; no production access; no PII; encryption in transit/at rest.” | Treat synthetic/anonymized data, no production access, no PII, and encryption as baseline constraints. |
| Proposal, slide 17, Dependencies | “10-20 historical TRT reports”; “3-5 analysts for evaluation sessions” | Mastercard inputs and analyst participation are dependencies, not data the app can invent. |
| Proposal, slide 17, Reaffirmed Constraints | “Out of scope: Fraud detection, real-time streaming”; “Automated production rule deployment”; “Splunk/X-Matters/Bears integration”; “Real-time transaction blocking” | Keep production actions and listed external integrations out of the PoC unless stakeholders revise scope. |
| Copilot instructions, Before implementing any feature | “Read the relevant requirements”; “Review the internal call transcript”; “Review the flow diagrams” | Use these artifacts as controlling context before implementation. |
| Copilot instructions, Implementation rules | “Do not invent requirements that are not documented.”; “If the transcript and requirements conflict, identify the conflict and ask for clarification.” | Conflicts listed below are unresolved questions, not implementation assumptions. |
| Copilot instructions, React and UI implementation | “For new React UI, use shadcn/ui components with their Radix UI primitives and Tailwind CSS”; “Use Lucide React as the default icon library” | Follow the established React stack for future screens; preserve accessibility, responsive behavior, visual hierarchy, and complete states. |

## Diagram and Mockup Findings

| Slide(s) | Diagram or screen | Requirements represented |
| --- | --- | --- |
| 2–3 | Scope and user journey | Autonomous signal preparation followed by analyst review, co-pilot interrogation, action decision, and feedback. |
| 4–5 | Agent Monitor and event notification mockups | Agent status/health/source, activity feed, query activity, prepared events, confidence/readiness, analyst notification, and review/open-analysis actions. Slide 5 also shows manual Excel upload as a fallback. |
| 6 | Event analysis dashboard mockup | Event severity and gate proximity, explainable AI summary, confidence, PAN/transaction/merchant/geo metrics, impacted merchants, baseline chart, export, co-pilot, and recommendation actions. |
| 7 | AI Co-Pilot mockup | Event context beside chat; suggested questions; evidence-linked answers; send, copy-to-report, create-action-draft, and save-to-memory actions. |
| 8 | Action recommendation screen | Block/monitor, whitelist, threshold update, and no-action choices; confidence and selection; target gate, duration, current/proposed values, impacted merchants, rationale, approver, status, UDT export, email, and submit-decision controls. |
| 9–10 | Capability and solution-flow diagrams | Signal/data ingestion, metrics/context, explainable recommendations, dashboard/chat/drill-down, action assistance, memory, and governance. |
| 11–16 | Azure/AWS architecture and orchestration diagrams | Triggering, data processing/query, agent reasoning, experience layer, action/export, security, audit, and memory. These are labeled illustrative; see conflicts below. |
| 18–20 | Timeline, roadmap, deployment strategy | A 10-week PoC, phased build/transfer, milestones, UAT/handover, then later governance and production gates. The detailed schedules differ and require confirmation. |
| 21–22 | Differentiator slides | Domain customization, speed, explainability, memory, integration, cost control, flexibility, support, security, scalability, and production path. Treat as positioning/design context, not independently testable functional requirements. |

## Implementation Backlog

All product items below are **not implemented** in the current starter. They are derived from the reviewed requirements and diagrams, not authorization to begin implementation.

| ID | Proposed work | Acceptance evidence to define |
| --- | --- | --- |
| TRT-01 | Confirm PoC scope, event trigger source, cloud stack, data package, and approval boundary. | Stakeholder decisions recorded for the open questions below. |
| TRT-02 | Establish event intake for the approved demo path, supporting the agreed signal trigger and/or upload fallback. | A representative synthetic event can enter the workflow; no excluded live integration is required. |
| TRT-03 | Normalize supplied event/report data and prepare a reviewable event record. | Sample inputs produce a traceable event with validation errors and missing-data states. |
| TRT-04 | Build the event dashboard for event status, gate/metric summaries, impacted entities, trends/baselines, and contextual explanation. | Values map to the sample data; empty/loading/error states and data provenance are visible. |
| TRT-05 | Generate evidence-linked analysis and confidence-aware recommendations. | Recommendations show rationale, supporting evidence, and limitations; no autonomous production action occurs. |
| TRT-06 | Add analyst review and action-draft workflow for the agreed action types. | Analyst can select/edit a draft and record approval/decision; submission/export behavior follows the agreed boundary. |
| TRT-07 | Add event-aware Co-Pilot questions and answers. | Answers are grounded in the event data and expose evidence/provenance; unsupported questions are handled clearly. |
| TRT-08 | Record analyst decisions, feedback, and event history for the agreed memory/audit scope. | History links event, evidence, recommendation, analyst decision, and outcome; access/retention are defined. |
| TRT-09 | Apply authentication, authorization, privacy, encryption, and audit requirements for the agreed demo environment. | Security controls and synthetic-data assumptions are documented and testable. |
| TRT-10 | Validate user experience and delivery. | Responsive executive-ready screens, accessible keyboard interactions, tests, lint, type-check, and build pass. |

## Conflicts and Questions to Resolve

1. **SafetyNet trigger versus excluded integration:** Slides 2–3 require automatic triggering/data pulls from SafetyNet, while slide 2 excludes “Integration with external systems (Splunk, Safety Net).” Is the PoC trigger simulated, supplied as a file/email, or connected to a test SafetyNet interface?
2. **Trigger source:** Slides 3 and 12/14/16 describe SafetyNet signals, schedules, threshold alerts, manual kickoff, and email monitoring. Which trigger(s) are in the PoC, and is email monitoring real or illustrative?
3. **Cloud architecture:** Slides 11 and 17 describe Azure/Apexon-hosted assumptions; slides 13/15 describe AWS; slide 20 mixes Azure sandbox with S3, Glue, Athena, DynamoDB, and Bedrock. Which provider/services are authoritative? Slide 13 is titled AWS but calls the service “Azure Glue” and labels the overview “Complete Azure service architecture.”
4. **External data systems:** SafetyNet, Bears, EventHub, Splunk, X-Matters, and transaction stores appear across diagrams, but slide 17 excludes several integrations. Which data is synthetic/mock versus integrated in the PoC?
5. **Upload fallback:** Slide 2 includes upload/process UI, slide 3 describes autonomous preparation, and slide 5 says manual Excel upload remains a fallback. Is upload a supported primary input, fallback, or both?
6. **Action execution:** Slides 3, 8, and 9 describe approve/modify/export, submit decision, and one-click actions, while production rule execution and real-time blocking are out of scope. Which actions only create drafts/exports, and which systems may receive email or files?
7. **Schedule:** Slide 18 milestones describe ingestion/UI (weeks 1–2), analysis/recommendations (weeks 3–5), co-pilot/dashboard (weeks 5–7), and memory/audit/demo (weeks 8–10). Slide 20 instead describes weeks 1–4 build and weeks 5–10 transfer/UAT. Confirm the delivery plan and acceptance milestones.
8. **Data and evaluation:** Confirm the 10–20 historical reports, approved anonymization/synthetic-data process, representative scenarios, acceptance criteria, baseline metrics, and analyst availability.
9. **Memory and retention:** “Organizational Memory,” “persistent fraud knowledge graph,” and event/decision tracking appear in the deck, but storage scope, permitted data, retention, access, and deletion rules are unspecified.

Per the Copilot instructions, do not resolve these conflicts by assumption; obtain stakeholder clarification before implementing affected integrations or behaviors.

## Current Repository Baseline

- At the original review baseline, `src/App.tsx` rendered only a centered “Hello, world!” Button with a Lucide icon.
- The repository has Vite, React, TypeScript, Tailwind CSS, shadcn-compatible Button/Radix setup, Lucide React, React Router, and ESLint configuration.
- Phase 1 provides the shared shell and route structure.
- Phase 2 adds an Agent Monitor and Event Inbox backed by typed fixtures; search, severity/status/source/date filters, sorting, and event links are present. Inbox browser interaction remains unverified.
- Phase 3 adds the event analysis route with event-specific summary, coverage/confidence/gate context, metrics, velocity chart, indicators, impacted merchant groups, evidence, and local JSON export.
- Phase 4 adds an event-scoped Co-Pilot with deterministic evidence-linked responses, bounded unsupported-question handling, and page-local report notes. No LLM, persistence, or external integration is connected.
- Phase 5 adds local action review for documented choice types, conditional fields, validation, decision history, and JSON packet download. It does not execute rules or submit actions externally.
- Phase 6 adds read-only memory/history with URL-backed search/filters, linked events, decisions/outcomes, and expandable evidence. Records are static fixtures; persistence, retention, and knowledge-graph behavior remain unresolved and unimplemented.
- `package.json` now includes build/lint/typecheck/test scripts; Vitest and Testing Library cover Memory, Action Review, and Co-Pilot integration paths.
- [`phase-6-demo-runbook.md`](phase-6-demo-runbook.md) documents the presenter path and behavior boundaries.

## Implementation History

| Timestamp (+05:30) | Change | Verification |
| --- | --- | --- |
| 2026-10-27 11:42:52 | Phase 1 shell and route placeholders implemented; no business or integration behavior added. | Production build and lint pass; all planned routes render; 390px mobile route check has no horizontal page overflow. |
| 2026-10-27 11:48:09 | Applied the user-requested white-and-orange theme to the shared shell; recorded it as the theme for future phases. Phase 2 remains paused. | Production build and lint pass; computed active-nav colors are orange with white text; 390px viewport has no page overflow. |
| 2026-10-27 12:00:58 | Phase 2 Agent Monitor and Event Inbox implemented with deterministic fixture files and URL-backed filters; no live integration or intake added. | TypeScript/build/lint pass and dashboard snapshot renders. Inbox interaction and mobile browser verification remain unconfirmed because the browser automation page session was unavailable. |
| 2026-10-27 12:09:39 | Removed visible demo/synthetic/mock-data wording from the UI at the user's direction; underlying fixture records remain synthetic and can appear live to screen viewers. | Source scan finds no visible disclosure copy; build and lint pass. Presentation risk acknowledged. |
| 2026-10-27 12:28:49 | Phase 3 event analysis screen and event-specific metric/finding fixtures implemented; no analysis service or external query added. | TypeScript/build/lint pass; high-coverage and partial-data route snapshots confirm chart, evidence, and unavailable-baseline states; mobile viewport has no page overflow. |
| 2026-10-27 12:38:17 | Phase 4 event-scoped Co-Pilot, deterministic evidence-linked answers, unsupported-question handling, and local report-note interactions implemented. | TypeScript/build/lint pass; supported answer, evidence expansion, report-note add/remove, unsupported response, and 390px no-overflow checks pass. No LLM or server persistence. |
| 2026-10-27 12:43:35 | Refined Co-Pilot hierarchy: reduced heading, moved conversation first on mobile, compacted event context, and balanced optional report panel at desktop. | Desktop grid and 390px mobile checks pass with no page overflow. |
| 2026-10-27 12:55:40 | Applied the user-provided chatbot visual reference: compact event context, dedicated dark chat header, prompt chips, orange analyst bubbles, pill composer, and active contextual navigation. | Build/typecheck/lint pass; browser confirms active Co-Pilot navigation and 390px no-overflow. |
| 2026-10-27 13:01:48 | Locked the Co-Pilot to viewport height and made conversation history, event context, and report notes scroll within their own panels rather than expanding the document. | At 390×844, document scroll height equals viewport height; long chat history overflows the internal conversation scroller; screenshot, lint, and editor diagnostics pass. |
| 2026-10-27 13:12:10 | Implemented Phase 5 event-scoped Action Review with local draft/decision state, action-specific required fields, evidence context, and JSON action-packet export; no external execution. | TypeScript/build/lint pass; draft save, approval history, and 390px layout pass. Browser harness did not emit download event, but Blob URL creation and download-link click were observed. |
| 2026-10-27 13:20:34 | Implemented Phase 6 read-only memory/history with search, filters, event links, decision/outcome records, and expandable evidence. No persistence or knowledge graph. | Build/typecheck/lint pass; evidence expansion, cross-navigation, and mobile table containment pass. Browser automation timed out on Clear Filters click. |
| 2026-10-27 13:42:21 | Completed Phase 6 readiness with Vitest/Testing Library regression tests for Memory, Action Review, and Co-Pilot plus a route-based demo runbook. | 3/3 tests, typecheck, lint, and production build pass; Event Inbox Clear Filters browser interaction remains pending. |

## Suggested Decision/History Log

Record each resolution before implementation using this compact entry:

| Field | Value to record |
| --- | --- |
| Decision ID | Stable ID, e.g. `TRT-DEC-001` |
| Question | Link to the numbered conflict above |
| Exact source wording | Relevant excerpt and slide/timestamp |
| Decision | Stakeholder-approved resolution; do not paraphrase away constraints |
| Owner/date | Decision maker and date |
| Impact | Backlog IDs, affected flows, dependencies, and out-of-scope changes |
| Verification | Acceptance evidence, test, or demo scenario |