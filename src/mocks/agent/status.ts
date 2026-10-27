import { DEMO_LAST_UPDATED_AT } from "@/mocks/shared/timestamps";

export const demoAgentStatus = {
  state: "Monitoring",
  mode: "Event preparation",
  lastUpdatedAt: DEMO_LAST_UPDATED_AT,
  preparedEvents: 4,
  awaitingReview: 2,
};

export const demoAgentActivity = [
  {
    id: "ACT-DEMO-01",
    title: "Signal received",
    detail: "TRT-2025-892 · TRT signal",
    timestamp: "2026-10-26T14:32:00.000Z",
    status: "Ready",
  },
  {
    id: "ACT-DEMO-02",
    title: "Event context prepared",
    detail: "TRT-2024-112 · TRT report",
    timestamp: "2026-10-26T11:18:00.000Z",
    status: "Prepared",
  },
  {
    id: "ACT-DEMO-03",
    title: "Additional data required",
    detail: "TRT-2024-087 · Review data coverage",
    timestamp: "2026-10-25T16:45:00.000Z",
    status: "Needs review",
  },
] as const;

export function getDemoAgentStatus() {
  return demoAgentStatus;
}

export function getDemoAgentActivity() {
  return demoAgentActivity;
}