import externalEventsFixture from "./data/mock-external-events.json";
import historicalCasesFixture from "./data/mock-historical-cases.json";
import recommendationsFixture from "./data/mock-recommendations.json";
import transactionsFixture from "./data/mock-transactions.json";
import trtCasesFixture from "./data/mock-trt-cases.json";

export type TRTCase = {
  id: string;
  pattern: string;
  ica: string;
  cid: string;
  country: string;
  channel: string;
  status: string;
  confidence: number;
  priority: string;
  createdAt: string;
  created: string;
};

export type Transaction = {
  timestamp: string;
  merchant: string;
  amount: number;
  pan: string;
  country: string;
  issuer: string;
  acquirer: string;
  adc: string;
  cryptogram: string;
};

export type HistoricalCase = {
  id: string;
  pattern: string;
  similarity: number;
  outcome: string;
  merchant: string;
  action: string;
  lesson: string;
};

export const trtCases: TRTCase[] = trtCasesFixture;
export const historicalCases: HistoricalCase[] = historicalCasesFixture;
export const externalEvents = externalEventsFixture;
export const recommendation = recommendationsFixture;

export const transactionRows: Transaction[] = Array.from({ length: 50 }, (_, index) => {
  const seed = transactionsFixture[index % transactionsFixture.length];
  const secondsAfterStart = index * 13;
  const timestamp = new Date(Date.parse(seed.timestamp) + secondsAfterStart * 1000).toISOString();
  const panSuffix = String(1024 + index * 37).slice(-4);

  return {
    ...seed,
    timestamp,
    pan: seed.pan.replace(/\d{4}$/, panSuffix),
  };
});

export const dashboardMetrics = [
  { label: "Active TRTs", value: "27", tone: "red" },
  { label: "Awaiting Review", value: "5", tone: "gold" },
  { label: "Pending Validation", value: "4", tone: "blue" },
  { label: "UDT Pending", value: "3", tone: "green" },
  { label: "Closed Today", value: "16", tone: "slate" },
];

export const trtTrend = [
  { day: "Oct 23", count: 18 },
  { day: "Oct 24", count: 23 },
  { day: "Oct 25", count: 20 },
  { day: "Oct 26", count: 31 },
  { day: "Oct 27", count: 25 },
  { day: "Oct 28", count: 36 },
  { day: "Oct 29", count: 27 },
];

export const patternDistribution = [
  { name: "BIN Attack", share: 52, color: "#b3261e" },
  { name: "ASI Attack", share: 18, color: "#2b4fa8" },
  { name: "Merchant Attack", share: 12, color: "#9a5b00" },
  { name: "Velocity Attack", share: 10, color: "#4b5a75" },
  { name: "Others", share: 8, color: "#dce0e7" },
];

export const transactionCountries = [
  { name: "India", share: 71, color: "#2b4fa8" },
  { name: "USA", share: 10, color: "#4b5a75" },
  { name: "Singapore", share: 8, color: "#9a5b00" },
  { name: "UK", share: 6, color: "#1c6b45" },
  { name: "Australia", share: 5, color: "#dce0e7" },
];

export const merchantDistribution = [
  { merchant: "Ticketmaster", count: 53210, share: 36.6 },
  { merchant: "Spotify", count: 42000, share: 28.9 },
  { merchant: "Netflix", count: 21120, share: 14.5 },
  { merchant: "Nike", count: 13421, share: 9.2 },
  { merchant: "Amazon", count: 7834, share: 5.4 },
];

export const fraudIndicators = [
  { signal: "Crypto Replay", severity: "Critical", status: "Found" },
  { signal: "PAN Concentration", severity: "High", status: "Found" },
  { signal: "Velocity Burst", severity: "Critical", status: "Found" },
  { signal: "Merchant Concentration", severity: "High", status: "Found" },
  { signal: "Geo Anomaly", severity: "Low", status: "Not Found" },
];

export const timelineEvents = [
  { time: "09:15", title: "TRT Created", detail: "Automated trigger received" },
  { time: "09:17", title: "Data Pull Started", detail: "BEARS transaction window requested" },
  { time: "09:21", title: "AI Analysis Completed", detail: "Evidence and historical matching ready" },
  { time: "09:25", title: "Analyst Review Started", detail: "Case assigned to Alex Morgan" },
];