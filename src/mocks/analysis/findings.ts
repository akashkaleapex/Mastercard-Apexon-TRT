import type { EventFinding } from "@/types/analysis";
import { getEventMetrics } from "@/mocks/events/metrics";

const findings: Record<string, Omit<EventFinding, "metrics" | "trend">> = {
  "TRT-2025-892": {
    eventId: "TRT-2025-892",
    summary:
      "Transaction activity is concentrated across a small merchant group and rises above the selected comparison window. Review recent gate and routing context before deciding on next steps.",
    confidence: 82,
    coveragePercent: 100,
    coverageNote: "All expected event fields are available.",
    missingData: [],
    gateName: "Gate 1",
    gateProximityPercent: 91,
    gateNote: "Current observed rate compared with the configured reference.",
    timeWindowStart: "2026-10-26T08:00:00.000Z",
    timeWindowEnd: "2026-10-26T14:00:00.000Z",
    impactedMerchants: [
      { name: "Merchant group 01", transactions: 5120, sharePercent: 28 },
      { name: "Merchant group 02", transactions: 3860, sharePercent: 21 },
      { name: "Merchant group 03", transactions: 2940, sharePercent: 16 },
    ],
    evidence: [
      {
        id: "EVD-892-01",
        label: "Velocity comparison",
        detail: "Observed hourly volume peaks at 1,760 against an 850 comparison value.",
      },
      {
        id: "EVD-892-02",
        label: "Merchant concentration",
        detail: "Three leading merchant groups account for 65% of the event volume.",
      },
    ],
    drivers: [
      "Hourly activity increases across the selected event window.",
      "The leading merchant groups account for a concentrated share of volume.",
      "The observed rate is near the Gate 1 reference value.",
    ],
  },
  "TRT-2024-112": {
    eventId: "TRT-2024-112",
    summary:
      "Activity remains moderately above the selected comparison range, with transactions distributed across several merchant groups. Review the event context before taking action.",
    confidence: 67,
    coveragePercent: 100,
    coverageNote: "All expected event fields are available.",
    missingData: [],
    gateName: "Gate 2",
    gateProximityPercent: 72,
    gateNote: "Current observed rate compared with the configured reference.",
    timeWindowStart: "2026-10-26T06:00:00.000Z",
    timeWindowEnd: "2026-10-26T12:00:00.000Z",
    impactedMerchants: [
      { name: "Merchant group 01", transactions: 2980, sharePercent: 32 },
      { name: "Merchant group 02", transactions: 2210, sharePercent: 24 },
      { name: "Merchant group 03", transactions: 1540, sharePercent: 16 },
    ],
    evidence: [
      {
        id: "EVD-112-01",
        label: "Hourly volume",
        detail: "The event peak is 780 transactions per hour in the selected window.",
      },
      {
        id: "EVD-112-02",
        label: "Merchant spread",
        detail: "The three leading groups account for 72% of event volume.",
      },
    ],
    drivers: [
      "Activity rises gradually and eases near the end of the selected window.",
      "No single merchant group accounts for a majority of event volume.",
    ],
  },
  "TRT-2024-087": {
    eventId: "TRT-2024-087",
    summary:
      "The supplied event data shows elevated activity, but an expected comparison set is unavailable. Interpret the observed concentration cautiously until the missing context is reviewed.",
    confidence: 41,
    coveragePercent: 68,
    coverageNote: "Comparison history is not available for this event.",
    missingData: ["Comparable historical window", "Gate reference metadata"],
    gateName: "Gate reference unavailable",
    gateProximityPercent: null,
    gateNote: "Gate proximity cannot be calculated from the supplied data.",
    timeWindowStart: "2026-10-25T10:00:00.000Z",
    timeWindowEnd: "2026-10-25T14:00:00.000Z",
    impactedMerchants: [
      { name: "Merchant group 01", transactions: 4820, sharePercent: 40 },
      { name: "Merchant group 02", transactions: 3010, sharePercent: 25 },
      { name: "Merchant group 03", transactions: 2190, sharePercent: 18 },
    ],
    evidence: [
      {
        id: "EVD-087-01",
        label: "Observed volume",
        detail: "The supplied event window contains 12,140 transactions.",
      },
      {
        id: "EVD-087-02",
        label: "Coverage gap",
        detail: "No comparable history or gate reference was supplied for this event.",
      },
    ],
    drivers: [
      "Hourly volume peaks at 1,920 in the supplied window.",
      "The leading merchant groups account for a concentrated share of volume.",
      "No baseline is available to assess the change against historical activity.",
    ],
  },
  "TRT-2023-451": {
    eventId: "TRT-2023-451",
    summary:
      "The available event window shows activity close to its selected comparison range, with a lower merchant concentration than the other reviewed events.",
    confidence: null,
    coveragePercent: 100,
    coverageNote: "Event data is available; no confidence score was provided.",
    missingData: ["Analysis confidence score"],
    gateName: "Gate 1",
    gateProximityPercent: 48,
    gateNote: "Current observed rate compared with the configured reference.",
    timeWindowStart: "2026-10-25T04:00:00.000Z",
    timeWindowEnd: "2026-10-25T10:00:00.000Z",
    impactedMerchants: [
      { name: "Merchant group 01", transactions: 820, sharePercent: 28 },
      { name: "Merchant group 02", transactions: 610, sharePercent: 21 },
      { name: "Merchant group 03", transactions: 430, sharePercent: 15 },
    ],
    evidence: [
      {
        id: "EVD-451-01",
        label: "Baseline comparison",
        detail: "Observed hourly volume remains close to the selected comparison values.",
      },
    ],
    drivers: [
      "Observed volume stays near the comparison range for most of the window.",
      "No analysis confidence score is available for this event.",
    ],
  },
};

export function getEventFinding(eventId: string): EventFinding | undefined {
  const finding = findings[eventId];
  const metrics = getEventMetrics(eventId);

  if (!finding || !metrics) return undefined;

  return {
    ...finding,
    metrics: metrics.summary,
    trend: metrics.trend,
  };
}

export function hasEventBaseline(eventId: string) {
  return getEventMetrics(eventId)?.baselineAvailable ?? false;
}