export type EventMetricSummary = {
  transactionCount: number;
  transactionsPerHour: number;
  merchantConcentrationPercent: number;
  panConcentrationPercent: number;
  geographicRegions: number;
};

export type EventTrendPoint = {
  timestamp: string;
  current: number;
  baseline: number | null;
};

export type AnalysisEvidence = {
  id: string;
  label: string;
  detail: string;
};

export type EventFinding = {
  eventId: string;
  summary: string;
  confidence: number | null;
  coveragePercent: number;
  coverageNote: string;
  missingData: string[];
  gateName: string;
  gateProximityPercent: number | null;
  gateNote: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  metrics: EventMetricSummary;
  trend: EventTrendPoint[];
  impactedMerchants: { name: string; transactions: number; sharePercent: number }[];
  evidence: AnalysisEvidence[];
  drivers: string[];
};