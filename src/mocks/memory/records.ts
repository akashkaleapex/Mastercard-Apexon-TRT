import type { MemoryRecord } from "@/types/memory";

const records: MemoryRecord[] = [
  {
    eventId: "TRT-2025-892",
    reviewedAt: "2026-10-26T15:10:00.000Z",
    severity: "High",
    source: "TRT signal",
    pattern: "Velocity increase with concentrated merchant volume",
    decision: "monitor",
    outcome: "Monitoring completed; no further change was recorded.",
    summary: "The observed hourly peak was above the selected reference, and three merchant groups accounted for 65% of event volume.",
    confidence: 82,
    evidenceIds: ["EVD-892-01", "EVD-892-02"],
  },
  {
    eventId: "TRT-2024-112",
    reviewedAt: "2026-10-26T12:05:00.000Z",
    severity: "Medium",
    source: "TRT report",
    pattern: "Gradual volume increase across several merchant groups",
    decision: "monitor",
    outcome: "Activity eased near the end of the reviewed window.",
    summary: "The event peak reached 780 transactions per hour and remained distributed across several merchant groups.",
    confidence: 67,
    evidenceIds: ["EVD-112-01", "EVD-112-02"],
  },
  {
    eventId: "TRT-2024-087",
    reviewedAt: "2026-10-25T17:20:00.000Z",
    severity: "Critical",
    source: "TRT signal",
    pattern: "Elevated volume with no comparable historical window",
    decision: "no-action",
    outcome: "Review deferred while comparison history and gate metadata were unavailable.",
    summary: "The event window contained 12,140 transactions, but a baseline and gate reference were not available.",
    confidence: 41,
    evidenceIds: ["EVD-087-01", "EVD-087-02"],
  },
  {
    eventId: "TRT-2023-451",
    reviewedAt: "2026-10-25T10:35:00.000Z",
    severity: "Low",
    source: "TRT report",
    pattern: "Volume remained close to the selected comparison range",
    decision: "no-action",
    outcome: "Closed without an additional change.",
    summary: "Observed hourly volume remained close to comparison values; no confidence score was provided.",
    confidence: null,
    evidenceIds: ["EVD-451-01"],
  },
];

export function getMemoryRecords(): MemoryRecord[] {
  return records;
}