import externalEventsFixture from "./data/mock-external-events.json";
import historicalCasesFixture from "./data/mock-historical-cases.json";
import recommendationsFixture from "./data/mock-recommendations.json";
import transactionsFixture from "./data/mock-transactions.json";
import trtCasesFixture from "./data/mock-trt-cases.json";

// All issuers, merchants, acquirers, cards and figures are synthetic.
// Each figure is defined once here; screens derive counts and labels from these sources.

export type TRTCase = {
  id: string;
  pattern: string;
  issuer: string;
  ica: string;
  cid: string;
  bin: string;
  country: string;
  channel: string;
  status: string;
  severity: "High" | "Medium" | "Low";
  source: string;
  signal: string;
  inputCheck: string;
  assistantView: string;
  repeatOf?: string;
  description?: string;
  createdAt: string;
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
  responseCode: string;
  declineSource: string;
};

export type HistoricalCase = {
  id: string;
  pattern: string;
  similarity: number;
  outcome: string;
  merchant: string;
  action: string;
  lesson: string;
  opened: string;
  txns: number;
  declined: string;
  duration: string;
};

export const MAIN_CASE_ID = "TRT-2026-7821";
export const REPEAT_CASE_ID = "TRT-2026-7826";
export const CLOSED_STATUSES = ["Decision Recorded", "Linked"];

export const trtCases: TRTCase[] = trtCasesFixture as TRTCase[];
export const historicalCases: HistoricalCase[] = historicalCasesFixture;
export const externalEvents = externalEventsFixture;
export const recommendation = recommendationsFixture;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-10-29T11:15:00Z" → "29-Oct-2026 11:15 UTC" */
export function formatCreated(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getUTCDate())}-${MONTHS[date.getUTCMonth()]}-${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;
}

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

/** TRTs created per day across all monitored ICAs, split by attack type (day totals: 18, 23, 20, 31, 25, 36, 27). */
export const trtTrend: { day: string; byPattern: Record<string, number> }[] = [
  { day: "Oct 23", byPattern: { "BIN Attack": 9, "ASI Attack": 3, "Merchant Attack": 2, "Velocity Attack": 2, Others: 2 } },
  { day: "Oct 24", byPattern: { "BIN Attack": 12, "ASI Attack": 4, "Merchant Attack": 3, "Velocity Attack": 2, Others: 2 } },
  { day: "Oct 25", byPattern: { "BIN Attack": 10, "ASI Attack": 4, "Merchant Attack": 2, "Velocity Attack": 2, Others: 2 } },
  { day: "Oct 26", byPattern: { "BIN Attack": 16, "ASI Attack": 6, "Merchant Attack": 4, "Velocity Attack": 3, Others: 2 } },
  { day: "Oct 27", byPattern: { "BIN Attack": 13, "ASI Attack": 4, "Merchant Attack": 3, "Velocity Attack": 3, Others: 2 } },
  { day: "Oct 28", byPattern: { "BIN Attack": 19, "ASI Attack": 6, "Merchant Attack": 4, "Velocity Attack": 4, Others: 3 } },
  { day: "Oct 29", byPattern: { "BIN Attack": 14, "ASI Attack": 5, "Merchant Attack": 3, "Velocity Attack": 3, Others: 2 } },
];

export const statusColors: Record<string, string> = {
  "Review Required": "#b3261e", Open: "#9a5b00", Investigating: "#2b4fa8", "Decision Recorded": "#1c6b45", Linked: "#4b5a75",
};

export const patternColors: Record<string, string> = {
  "BIN Attack": "#b3261e", "ASI Attack": "#2b4fa8", "Merchant Attack": "#9a5b00", "Velocity Attack": "#4b5a75", Others: "#dce0e7",
};

export const transactionCountries = [
  { name: "India", share: 71, color: "#2b4fa8" },
  { name: "USA", share: 10, color: "#4b5a75" },
  { name: "Singapore", share: 8, color: "#9a5b00" },
  { name: "UK", share: 6, color: "#1c6b45" },
  { name: "Australia", share: 5, color: "#dce0e7" },
];

export const merchantDistribution = [
  { merchant: "StageGate Tickets", count: 53210, share: 36.6 },
  { merchant: "Tunestream Audio", count: 42000, share: 28.9 },
  { merchant: "Reelhouse Video", count: 21120, share: 14.5 },
  { merchant: "Stride Athletic", count: 13421, share: 9.2 },
  { merchant: "Marketly Online", count: 7834, share: 5.4 },
];

// ---------- TRT-2026-7821 · signals (facts with source fields + pattern attribute result) ----------

export type SignalState = "Detected" | "Needs Validation" | "Not Detected";
export const signals: { title: string; detail: string; state: SignalState; fields: string }[] = [
  { title: "Crypto Replay", detail: "Repeated cryptographic values across transactions", state: "Detected", fields: "A91C-7F2D on 41,870 transactions · cryptogram, pan_hash" },
  { title: "PAN Concentration", detail: "51 PANs responsible for 67% of traffic", state: "Detected", fields: "97,305 of 145,231 transactions; 12,480 distinct PANs · pan_hash" },
  { title: "Merchant Share Mismatch", detail: "82% signal claim vs 36.6% in displayed totals", state: "Needs Validation", fields: "StageGate Tickets 53,210 transactions · merchant_id" },
  { title: "Velocity Spike", detail: "380% increase over baseline", state: "Detected", fields: "145,231 vs 30,256 prior day; peak 38,800 at 10:30 · ts_utc" },
  { title: "Geo Anomaly", detail: "No material deviation from expected geography", state: "Not Detected", fields: "71% domestic (India) · merchant_country" },
  { title: "BIN Concentration", detail: "91% of transactions on BIN 414720", state: "Detected", fields: "132,160 vs 27,300 prior day · bin6" },
  { title: "ADC Mismatch", detail: "ADC result mismatched on 38,220 transactions", state: "Detected", fields: "adc_indicator" },
  { title: "Short Burst", detail: "Activity spans about 4 hours, longer than a typical burst", state: "Needs Validation", fields: "08:00–12:00 UTC · ts_utc" },
];

export const interpretation =
  "The signals fit replayed cryptograms on a small set of PANs in BIN 414720 (Crypto Replay, PAN Concentration, ADC Mismatch), on top of a volume spike (Velocity Spike, BIN Concentration). This reading does not identify who is behind the activity and does not confirm fraud.";

export const dataGaps = [
  "Mastercard's BIN-attack pattern document has not been supplied; the match uses the Apexon working catalogue (A1).",
  "The contributor signal (82%) and the extract totals (36.6%) disagree on StageGate Tickets' share.",
  "No customer validation received.",
  "No merchant promotion notification available.",
  "The baseline is one prior day; longer merchant or account-range history is not supplied (BR-34).",
];

// ---------- TRT-2026-7821 · intake & validation ----------

export const caseContext = [
  { label: "Notification", value: "SafetyNet TRT: ICA 3305 transaction volume 4.8× prior-day baseline; top BIN 414720, top channel POS" },
  { label: "Trigger source", value: "Automated (xMatters). Notification fields are assumed until Mastercard shares a sample (artefact A7)." },
  { label: "Data source", value: "Approved BEARS transaction extract (synthetic stand-in)" },
];

export type WindowId = "2h" | "4h" | "4h15";
export const extractionWindows: { id: WindowId; label: string; text: string }[] = [
  { id: "2h", label: "2 hours (usual start)", text: "10:00–12:00 UTC (2 h)" },
  { id: "4h", label: "4 hours (current extract)", text: "08:00–12:00 UTC (4 h)" },
  { id: "4h15", label: "Extend +15 min", text: "07:45–12:00 UTC (4 h 15 min)" },
];

export type ScopeId = "ICA" | "CID";
export const investigationScopes: { id: ScopeId; label: string; text: string }[] = [
  { id: "ICA", label: "ICA 3305", text: "ICA 3305" },
  { id: "CID", label: "Indus Financial Group (CID, needs approval)", text: "CID · pending approval" },
];

export const validationChecks: { result: "pass" | "warn"; title: string; detail: string }[] = [
  { result: "pass", title: "Extract readable", detail: "145,231 rows, 38 columns" },
  { result: "pass", title: "Time coverage", detail: "08:00:00–11:59:59 UTC, no gap longer than 5 minutes" },
  { result: "pass", title: "Masking", detail: "card numbers masked to first 6 / last 4; no full card numbers in any field" },
  { result: "pass", title: "Scope matches notification", detail: "ICA 3305 and BIN 414720 present" },
  { result: "pass", title: "Decline source present", detail: "every declined row has a decline source; no stand-in (91) codes" },
  { result: "pass", title: "No truncation", detail: "row limit not reached; the grid shows a 50-row sample" },
  { result: "warn", title: "adc_indicator blank on 312 rows", detail: "ADC evidence marked partial" },
  { result: "warn", title: "cryptogram blank on 1,104 rows", detail: "replay counts use the rows that have a value" },
];

export const patternMapping: { attribute: string; fields: string; status: "Mapped" | "Partial" | "Placeholder" }[] = [
  { attribute: "BIN / account-range concentration", fields: "bin6, account_range8", status: "Mapped" },
  { attribute: "PAN concentration", fields: "pan_hash", status: "Mapped" },
  { attribute: "Cryptogram reuse", fields: "cryptogram", status: "Partial" },
  { attribute: "ADC result", fields: "adc_indicator", status: "Partial" },
  { attribute: "Response and decline ownership", fields: "response_code, decline_source, safetynet_rule_id", status: "Mapped" },
  { attribute: "Merchant concentration", fields: "merchant_id, mcc", status: "Partial" },
  { attribute: "Velocity", fields: "ts_utc, 30-minute buckets", status: "Mapped" },
  { attribute: "Geography", fields: "merchant_country, issuer_country", status: "Mapped" },
  { attribute: "Baseline comparison", fields: "same window, prior day", status: "Mapped" },
  { attribute: "Reason-code meanings", fields: "reference table", status: "Placeholder" },
];

// ---------- TRT-2026-7821 · evidence ----------

export const evidenceMetrics = [
  { label: "Transactions Reviewed", value: "145,231", note: "prior day, same window: 30,256" },
  { label: "SafetyNet Declined", value: "118,721", note: "88.2% of declines · prior day: 960" },
  { label: "Issuer Declined", value: "15,948", note: "11.8% of declines · prior day: 280" },
  { label: "Approved", value: "10,562", note: "prior day: 29,016" },
];

export const volumeTrend = [
  { time: "08:00", transactions: 7400, prior: 4300 },
  { time: "09:00", transactions: 11800, prior: 4100 },
  { time: "10:00", transactions: 24900, prior: 4500 },
  { time: "10:30", transactions: 38800, prior: 4400 },
  { time: "11:00", transactions: 32400, prior: 4200 },
  { time: "11:30", transactions: 18600, prior: 4300 },
  { time: "12:00", transactions: 9900, prior: 4456 },
];

export const keyMoments = [
  { time: "09:40", text: "repeated cryptogram A91C-7F2D first seen" },
  { time: "10:05", text: "first SafetyNet decline (rule SN-CRY-REP-03, placeholder ID)" },
  { time: "10:30", text: "volume peak" },
  { time: "11:15", text: "TRT notification received" },
];

export const declineCodes = [
  { code: "05", meaning: "Do not honour (118,721 from SafetyNet)", now: 121031, prior: 610 },
  { code: "14", meaning: "Invalid card number", now: 8912, prior: 220 },
  { code: "54", meaning: "Expired card / wrong expiry", now: 2104, prior: 160 },
  { code: "51", meaning: "Insufficient funds", now: 1822, prior: 230 },
  { code: "63", meaning: "Security violation (cryptogram)", now: 800, prior: 20 },
];

export const topContributors = [
  { dimension: "BIN", value: "414720", txns: 132160, prior: 27300, share: "91.0%", declineRate: "93.1%" },
  { dimension: "Channel", value: "POS", txns: 118400, prior: 21050, share: "81.5%", declineRate: "94.0%" },
];

// ---------- TRT-2026-7821 · historical context ----------

export const otherExplanations: { explanation: string; result: "Not supported" | "Not checked"; why: string }[] = [
  { explanation: "Issuer outage or routing change", result: "Not supported", why: "No 91 / 92 / 96 codes; the issuer approved 10,562 transactions" },
  { explanation: "Public event lookup", result: "Not checked", why: "External context lookup is not enabled for the PoC (BR-32); the events above were supplied manually" },
];

export const outcomeExamples = [
  { caseId: "TRT-2026-7824", category: "Normal · consider whitelist", relevance: "Low", title: "Consistent with a ticket on-sale, not an attack", detail: "Volume at one ticketing merchant at four price points, 98% domestic cards, few invalid-card declines. Suggested: consider whitelisting for the event window via UDT." },
  { caseId: "TRT-2026-7825", category: "Inconclusive · extend or validate", relevance: "Medium", title: "Weak signal inside the window", detail: "+39% transactions and 21 invalid-card declines spread over merchants. Suggested: extend the window in 15-minute steps (BR-16), then seek issuer validation." },
  { caseId: "TRT-2026-7827", category: "Not fraud · operational (proposed)", relevance: "Medium", title: "Declines come from the issuer, not SafetyNet", detail: "OCC ticket: 61 of 62 declines issuer-sourced, 0 SafetyNet. Suggested: tell OCC / L1 these are not SafetyNet declines (BRD s.6b)." },
  { caseId: "TRT-2026-7828", category: "Outside PoC scope · manual review", relevance: "Low", title: "ATM cash-out signals, not a BIN-attack case", detail: "ATM withdrawals on one prepaid BIN in 9 countries. The PoC supports the BIN-attack pattern only (AC-06); evidence summary only." },
];

// ---------- TRT-2026-7821 · recommendation & decision ----------

export type OptionId = "block" | "validate" | "investigate" | "whitelist";
export const nextStepOptions: { id: OptionId; title: string; label: string; body: string; outside: string }[] = [
  { id: "block", title: "Suspected fraudulent activity · keep control, consider a block request", label: "Suggested", body: "Crypto replay, PAN concentration and ADC mismatch fit the pattern, and no benign explanation fits. Scope and duration are in the UDT request summary above.", outside: "the analyst raises a UDT request through BEARS." },
  { id: "validate", title: "Seek customer validation", label: "Also relevant", body: "The issuer can confirm whether the 51 concentrated PANs belong to genuine customers.", outside: "the L1 team contacts the issuer through the existing customer process." },
  { id: "investigate", title: "Investigate further", label: "Optional", body: "Resolve the merchant-share disagreement, extend the window, or switch to CID scope. Link TRT-2026-7826 first.", outside: "the extract is re-run with the approved window or scope." },
  { id: "whitelist", title: "Normal activity · consider whitelisting or a threshold change", label: "Not supported", body: "A ticket release may explain part of the volume, but not the repeated cryptograms or ADC mismatches.", outside: "a whitelist or threshold request would go through UDT." },
];

export type Verdict = "accept" | "amend" | "reject";
export const verdicts: { id: Verdict; label: string; past: string }[] = [
  { id: "accept", label: "Accept", past: "accepted" },
  { id: "amend", label: "Amend", past: "amended" },
  { id: "reject", label: "Reject", past: "rejected" },
];
export type Usefulness = "useful" | "partly" | "not";
export const usefulnessOptions: { id: Usefulness; label: string }[] = [
  { id: "useful", label: "Useful" }, { id: "partly", label: "Partly" }, { id: "not", label: "Not useful" },
];
export type FixArea = "facts" | "match" | "benign" | "rec";
export const fixAreas: { id: FixArea; label: string }[] = [
  { id: "facts", label: "Facts" }, { id: "match", label: "Pattern match" }, { id: "benign", label: "Benign checks" }, { id: "rec", label: "Recommendation" },
];

export const draftRationale =
  "Cryptogram replay on BIN 414720, 08:00–12:00 UTC: 51 PANs carry 97,305 of 145,231 transactions and cryptogram A91C-7F2D repeats 41,870 times. Keep the SafetyNet control, request a block on BIN 414720 at StageGate Tickets and Tunestream Audio through UDT, and ask the issuer to validate the concentrated PANs.";

// ---------- TRT-2026-7821 · audit & evaluation ----------

export type AuditEvent = { time: string; event: string; detail: string; actor: string };

const count = <T,>(items: T[], test: (item: T) => boolean) => items.filter(test).length;
export const baseAuditEvents: AuditEvent[] = [
  { time: "11:15:00", event: "TRT notification received", detail: "xMatters · ICA 3305, BIN 414720", actor: "System" },
  { time: "11:17:10", event: "Extract loaded", detail: "145,231 rows · 08:00–12:00 · ICA scope", actor: "Requested by analyst · read-only access (BR-21)" },
  { time: "11:17:12", event: "Input validation", detail: `ready with ${count(validationChecks, (check) => check.result === "warn")} non-blocking warnings`, actor: "System" },
  { time: "11:18:40", event: "Pattern-to-data mapping", detail: `${count(patternMapping, (row) => row.status === "Mapped")} mapped, ${count(patternMapping, (row) => row.status === "Partial")} partial, ${count(patternMapping, (row) => row.status === "Placeholder")} placeholder`, actor: "System" },
  { time: "11:21:05", event: "Assessment generated", detail: `pattern consistent with BIN attack · ${count(signals, (signal) => signal.state === "Detected")} of ${signals.length} signals detected`, actor: "Assistant · [model version] · [prompt version]" },
  { time: "11:25:00", event: "Analyst review started", detail: "Case assigned to Alex Morgan", actor: "System" },
];

export const runContext = [
  { label: "Data source", value: "Synthetic extract · Apexon generator v0.1 (replace with approved extract, A2)" },
  { label: "Queries", value: "Contributor [version] · transaction [version] (G-10)" },
  { label: "Time zone", value: "UTC" },
  { label: "Pattern guidance", value: "Apexon working catalogue v0.1 · Mastercard document pending (A1)" },
  { label: "Reason codes", value: "Illustrative reference v0.1 · pending (A4)" },
  { label: "Model / prompt", value: "[model version] / [prompt version]" },
  { label: "Sensitive data", value: "Masked card numbers only; none in prompts or logs" },
  { label: "Retention", value: "[per Mastercard policy] (G-16)" },
];

export const smeBenchmark = [
  { item: "Outcome category", sme: "Suspected fraud · consider block", assistant: "Suspected fraud · consider block", result: "Agree" },
  { item: "Key signals", sme: "PAN concentration; cryptogram replay", assistant: "Same two, plus ADC mismatch and velocity", result: "Agree" },
  { item: "Benign alternative", sme: "Ticket release considered, not sufficient", assistant: "Ticket release partly fits; others not supported", result: "Agree" },
  { item: "Next step", sme: "Block request via UDT; customer validation", assistant: "Block request via UDT; customer validation", result: "Agree" },
  { item: "Uncertainty stated", sme: "Expected", assistant: `${dataGaps.length} data gaps listed`, result: "Agree" },
];

export const scorecard = [
  { label: "Cases reviewed", value: "[n] of [agreed]" },
  { label: "Agreement with SME", value: "[x%]" },
  { label: "Analyst time per case", value: "[before] → [after]" },
  { label: "Pass threshold", value: "[to be agreed]" },
];
