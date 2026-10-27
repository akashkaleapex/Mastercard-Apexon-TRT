# Mastercard Apexon TRT

React + TypeScript PoC UI for reviewing transaction-risk events, event analysis, analyst decisions, and event history.

## Requirements

- Node.js 20.19+ or 22.12+
- npm, included with Node.js

## Install and Run

From the repository root:

```sh
npm install
npm run dev
```

Vite prints the local URL when the server starts, normally `http://localhost:5173/`.

In Windows PowerShell, the normal commands above may be blocked if the `npm.ps1` shim is restricted by execution policy. In that case, run the equivalent Windows command shim:

```powershell
npm.cmd install
npm.cmd run dev
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create the production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript project checks |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest and Testing Library suite |

## Routes

| Route | Screen |
| --- | --- |
| `/` | Redirects to Dashboard |
| `/dashboard` | Agent Monitor |
| `/events` | Event Inbox with search, filters, and sorting |
| `/events/:eventId` | Event Analysis |
| `/events/:eventId/copilot` | Event-scoped AI Co-Pilot |
| `/events/:eventId/actions` | Local Action Review |
| `/memory` | Read-only Organizational Memory |
| `/actions` | Planned Action Queue placeholder |
| `/intake` | Conditional Event Intake placeholder |
| `/settings` | Unspecified Settings placeholder |

## Project Structure

```text
src/
  app/                 # Router and shared application shell
  components/ui/        # shadcn-compatible UI primitives
  features/             # Dashboard, events, actions, Co-Pilot, memory
  lib/                  # Shared UI utilities
  mocks/                # Feature-separated static fixture records
  test/                 # Vitest setup
  types/                # Shared event, analysis, action, and memory types
```

The UI uses React Router, Tailwind CSS v4, Radix UI/shadcn-compatible components, Lucide React, and Recharts. The theme is white with orange primary and active states.

## Data and Integration Boundaries

- The bundled records in `src/mocks/` are static synthetic fixtures, even though the UI does not label them as synthetic. They are not live Mastercard data; do not add PII, account/cardholder information, credentials, or real event identifiers.
- The Co-Pilot uses deterministic event-keyed responses. It is not connected to an LLM or external service.
- Action drafts and decisions are page-local. Downloading an action packet creates a local JSON file; it does not send email or execute an operational rule.
- Organizational Memory is static and read-only. Persistence, access control, retention, and knowledge-graph behavior have not been defined.
- No SafetyNet signal, transaction store, email, cloud service, or production system is connected. Upload and production deployment are not implemented.

## Tests and Demo

The integration tests cover Memory filtering/evidence links, Action Review required fields and decision history, and Co-Pilot evidence-linked and unsupported responses:

```powershell
npm.cmd test
```

See [`docs/history-tracking/phase-6-demo-runbook.md`](docs/history-tracking/phase-6-demo-runbook.md) for a route-by-route walkthrough and presentation boundaries. Requirements, decisions, and implementation history are recorded in [`docs/history-tracking/requirements-traceability.md`](docs/history-tracking/requirements-traceability.md) and [`docs/history-tracking/ui-screen-implementation-plan.md`](docs/history-tracking/ui-screen-implementation-plan.md).