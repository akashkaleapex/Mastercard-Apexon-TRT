import type { EventMetricSummary, EventTrendPoint } from "@/types/analysis";

type EventMetrics = {
  summary: EventMetricSummary;
  baselineAvailable: boolean;
  trend: EventTrendPoint[];
};

const metricsByEvent: Record<string, EventMetrics> = {
  "TRT-2025-892": {
    summary: {
      transactionCount: 18420,
      transactionsPerHour: 1535,
      merchantConcentrationPercent: 38,
      panConcentrationPercent: 24,
      geographicRegions: 6,
    },
    baselineAvailable: true,
    trend: [
      { timestamp: "08:00", current: 720, baseline: 680 },
      { timestamp: "09:00", current: 840, baseline: 710 },
      { timestamp: "10:00", current: 930, baseline: 760 },
      { timestamp: "11:00", current: 1120, baseline: 790 },
      { timestamp: "12:00", current: 1480, baseline: 820 },
      { timestamp: "13:00", current: 1760, baseline: 850 },
      { timestamp: "14:00", current: 1535, baseline: 810 },
    ],
  },
  "TRT-2024-112": {
    summary: {
      transactionCount: 9360,
      transactionsPerHour: 780,
      merchantConcentrationPercent: 29,
      panConcentrationPercent: 18,
      geographicRegions: 4,
    },
    baselineAvailable: true,
    trend: [
      { timestamp: "06:00", current: 510, baseline: 490 },
      { timestamp: "07:00", current: 570, baseline: 520 },
      { timestamp: "08:00", current: 620, baseline: 550 },
      { timestamp: "09:00", current: 710, baseline: 580 },
      { timestamp: "10:00", current: 780, baseline: 600 },
      { timestamp: "11:00", current: 745, baseline: 590 },
      { timestamp: "12:00", current: 690, baseline: 560 },
    ],
  },
  "TRT-2024-087": {
    summary: {
      transactionCount: 12140,
      transactionsPerHour: 1734,
      merchantConcentrationPercent: 46,
      panConcentrationPercent: 31,
      geographicRegions: 3,
    },
    baselineAvailable: false,
    trend: [
      { timestamp: "10:00", current: 910, baseline: null },
      { timestamp: "11:00", current: 1140, baseline: null },
      { timestamp: "12:00", current: 1680, baseline: null },
      { timestamp: "13:00", current: 1920, baseline: null },
      { timestamp: "14:00", current: 1734, baseline: null },
    ],
  },
  "TRT-2023-451": {
    summary: {
      transactionCount: 2880,
      transactionsPerHour: 240,
      merchantConcentrationPercent: 18,
      panConcentrationPercent: 11,
      geographicRegions: 2,
    },
    baselineAvailable: true,
    trend: [
      { timestamp: "04:00", current: 180, baseline: 210 },
      { timestamp: "05:00", current: 205, baseline: 220 },
      { timestamp: "06:00", current: 230, baseline: 225 },
      { timestamp: "07:00", current: 260, baseline: 230 },
      { timestamp: "08:00", current: 240, baseline: 235 },
      { timestamp: "09:00", current: 220, baseline: 240 },
      { timestamp: "10:00", current: 205, baseline: 230 },
    ],
  },
};

export function getEventMetrics(eventId: string): EventMetrics | undefined {
  return metricsByEvent[eventId];
}