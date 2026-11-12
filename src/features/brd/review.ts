import {
  MAIN_CASE_ID,
  REPEAT_CASE_ID,
  draftRationale,
  extractionWindows,
  fixAreas,
  investigationScopes,
  nextStepOptions,
  trtCases,
  usefulnessOptions,
  verdicts,
  type AuditEvent,
  type FixArea,
  type OptionId,
  type ScopeId,
  type TRTCase,
  type Usefulness,
  type Verdict,
  type WindowId,
} from "@/features/brd/data";

/** Analyst review state for TRT-2026-7821. Lives in BRDWorkspace so it survives tab switches. */
export type ReviewState = {
  window: WindowId;
  scope: ScopeId;
  cidApprovalRequested: boolean;
  option: OptionId;
  verdict: Verdict;
  useful: Usefulness;
  fixes: FixArea[];
  rationale: string;
  recordedAt: string | null;
  repeat: "linked" | "separate" | null;
  corrections: { fact: string; note: string; time: string }[];
  manualCases: TRTCase[];
  events: AuditEvent[];
  clock: number;
};

export type ReviewAction =
  | { type: "setWindow"; window: WindowId }
  | { type: "setScope"; scope: ScopeId }
  | { type: "requestCidApproval" }
  | { type: "selectOption"; option: OptionId }
  | { type: "setVerdict"; verdict: Verdict }
  | { type: "setUseful"; useful: Usefulness }
  | { type: "toggleFix"; fix: FixArea }
  | { type: "setRationale"; rationale: string }
  | { type: "recordDecision" }
  | { type: "setRepeat"; repeat: "linked" | "separate" }
  | { type: "addCorrection"; fact: string; note: string }
  | { type: "addManualCase"; issuer: string; ica: string; bin: string; description: string }
  | { type: "log"; event: string; detail: string };

// Session actions are stamped on a simulated UTC clock that starts after analyst review began (11:25).
const CLOCK_START = 11 * 3600 + 26 * 60;
const REPEAT_ARRIVAL = 13 * 3600 + 40 * 60;

export function formatClock(seconds: number) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(seconds / 3600) % 24)}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
}

export const initialReview: ReviewState = {
  window: "4h",
  scope: "ICA",
  cidApprovalRequested: false,
  option: "block",
  verdict: "accept",
  useful: "useful",
  fixes: [],
  rationale: draftRationale,
  recordedAt: null,
  repeat: null,
  corrections: [],
  manualCases: [],
  events: [],
  clock: CLOCK_START,
};

function stamp(state: ReviewState, event: Omit<AuditEvent, "time">, minimum = 0) {
  const clock = Math.max(state.clock + 37, minimum);
  const time = formatClock(clock);
  return { clock, time, events: [...state.events, { ...event, time }] };
}

const labelOf = (items: { id: string; label: string }[], id: string) => items.find((item) => item.id === id)?.label ?? id;

export function reviewReducer(state: ReviewState, action: ReviewAction): ReviewState {
  switch (action.type) {
    case "setWindow": {
      if (state.window === action.window) return state;
      const text = extractionWindows.find((item) => item.id === action.window)!.text;
      return { ...state, window: action.window, ...stamp(state, { event: "Extraction window changed", detail: text, actor: "Analyst · extract re-run requested (BR-16)" }) };
    }
    case "setScope": {
      if (state.scope === action.scope) return state;
      const text = investigationScopes.find((item) => item.id === action.scope)!.text;
      return { ...state, scope: action.scope, ...stamp(state, { event: "Investigation scope changed", detail: text, actor: "Analyst" }) };
    }
    case "requestCidApproval":
      if (state.cidApprovalRequested) return state;
      return { ...state, cidApprovalRequested: true, ...stamp(state, { event: "CID scope approval requested", detail: "Indus Financial Group · 3 ICAs (BR-20)", actor: "Analyst · awaiting approver" }) };
    case "selectOption":
      return { ...state, option: action.option, recordedAt: null };
    case "setVerdict":
      return { ...state, verdict: action.verdict, recordedAt: null };
    case "setUseful":
      return { ...state, useful: action.useful };
    case "toggleFix":
      return { ...state, fixes: state.fixes.includes(action.fix) ? state.fixes.filter((fix) => fix !== action.fix) : [...state.fixes, action.fix] };
    case "setRationale":
      return { ...state, rationale: action.rationale, recordedAt: null };
    case "recordDecision": {
      const option = nextStepOptions.find((item) => item.id === state.option)!;
      const verdict = verdicts.find((item) => item.id === state.verdict)!.past;
      const fixes = state.fixes.length ? `corrections: ${state.fixes.map((fix) => labelOf(fixAreas, fix).toLowerCase()).join(", ")}` : "no corrections";
      const stamped = stamp(state, {
        event: "Analyst decision recorded",
        detail: `${verdict} · next step: ${option.title}`,
        actor: `Alex Morgan · rationale saved · feedback: ${labelOf(usefulnessOptions, state.useful).toLowerCase()}, ${fixes}`,
      });
      return { ...state, recordedAt: stamped.time, clock: stamped.clock, events: stamped.events };
    }
    case "setRepeat": {
      if (state.repeat === action.repeat) return state;
      const linked = action.repeat === "linked";
      return {
        ...state,
        repeat: action.repeat,
        ...stamp(state, {
          event: linked ? "Repeat trigger linked" : "Repeat trigger kept as a separate case",
          detail: linked ? `${REPEAT_CASE_ID} attached to ${MAIN_CASE_ID}` : `${REPEAT_CASE_ID} will be investigated on its own`,
          actor: "Analyst",
        }, REPEAT_ARRIVAL),
      };
    }
    case "addCorrection": {
      const stamped = stamp(state, { event: "Correction flagged", detail: `${action.fact}: ${action.note}`, actor: "Analyst · sent for assistant evaluation" });
      return { ...state, ...stamped, corrections: [...state.corrections, { fact: action.fact, note: action.note, time: stamped.time }] };
    }
    case "addManualCase": {
      const all = [...trtCases, ...state.manualCases];
      const next = Math.max(...all.map((item) => Number(item.id.slice(-4)))) + 1;
      const now = new Date();
      const pad = (value: number) => String(value).padStart(2, "0");
      const manual: TRTCase = {
        id: `TRT-2026-${pad(next)}`,
        pattern: "Others",
        issuer: action.issuer,
        ica: action.ica,
        cid: "—",
        bin: action.bin,
        country: "—",
        channel: "—",
        status: "Open",
        severity: "Medium",
        source: "OCC ticket",
        signal: "Not yet measured",
        inputCheck: "Extract pending",
        assistantView: "Awaiting extract",
        description: action.description,
        createdAt: now.toISOString(),
      };
      return { ...state, manualCases: [manual, ...state.manualCases] };
    }
    case "log":
      return { ...state, ...stamp(state, { event: action.event, detail: action.detail, actor: "Analyst" }) };
  }
}

/** Queue rows with session changes applied (manual OCC cases, recorded decision, repeat linking). */
export function casesWithReview(review: ReviewState): TRTCase[] {
  return [...review.manualCases, ...trtCases].map((item) => {
    if (item.id === MAIN_CASE_ID && review.recordedAt) return { ...item, status: "Decision Recorded" };
    if (item.id === REPEAT_CASE_ID && review.repeat === "linked") return { ...item, assistantView: "Linked to 7821", status: "Linked" };
    if (item.id === REPEAT_CASE_ID && review.repeat === "separate") return { ...item, assistantView: "Separate case (not a repeat)" };
    return item;
  });
}

function windowText(review: ReviewState) {
  return extractionWindows.find((item) => item.id === review.window)!.text;
}

export function buildUdtSummary(review: ReviewState) {
  const option = nextStepOptions.find((item) => item.id === review.option)!;
  return [
    `${MAIN_CASE_ID} · Indus Commercial Bank India (ICA 3305) · BIN 414720`,
    `Window: ${windowText(review)} · Scope: ${investigationScopes.find((item) => item.id === review.scope)!.text}`,
    `Assessment: pattern consistent with a BIN attack, ${verdicts.find((item) => item.id === review.verdict)!.past} by the analyst. Not a confirmed fraud finding.`,
    `Next step: ${option.title}`,
    "",
    "Rationale:",
    review.rationale.trim(),
    "",
    "Prepared in the SafetyNet TRT PoC (synthetic data, advisory only). Copying submits nothing.",
  ].join("\n");
}

export function buildAuditRecord(review: ReviewState, baseEvents: AuditEvent[]) {
  return JSON.stringify({
    caseId: MAIN_CASE_ID,
    note: "Synthetic PoC audit record. Session times use the demo clock (UTC).",
    window: windowText(review),
    scope: investigationScopes.find((item) => item.id === review.scope)!.text,
    decision: review.recordedAt
      ? { recordedAt: review.recordedAt, verdict: review.verdict, nextStep: review.option, rationale: review.rationale, usefulness: review.useful, corrections: review.fixes }
      : null,
    repeatHandling: review.repeat,
    factCorrections: review.corrections,
    timeline: [...baseEvents, ...review.events],
  }, null, 2);
}
