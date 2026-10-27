import type { TrtEvent } from "@/types/events";

const events: TrtEvent[] = [
  {
    id: "TRT-2025-892",
    severity: "High",
    receivedAt: "2026-10-26T14:32:00.000Z",
    status: "Ready for review",
    source: "TRT signal",
    merchantCount: 7,
    panCount: 28,
    demoConfidence: 82,
  },
  {
    id: "TRT-2024-112",
    severity: "Medium",
    receivedAt: "2026-10-26T11:18:00.000Z",
    status: "Analysis prepared",
    source: "TRT report",
    merchantCount: 3,
    panCount: 12,
    demoConfidence: 67,
  },
  {
    id: "TRT-2024-087",
    severity: "Critical",
    receivedAt: "2026-10-25T16:45:00.000Z",
    status: "Data incomplete",
    source: "TRT signal",
    merchantCount: 5,
    panCount: 19,
    demoConfidence: 41,
  },
  {
    id: "TRT-2023-451",
    severity: "Low",
    receivedAt: "2026-10-25T09:06:00.000Z",
    status: "Ready for review",
    source: "TRT report",
    merchantCount: 2,
    panCount: 6,
    demoConfidence: null,
  },
];

export function getDemoEvents(): TrtEvent[] {
  return events;
}