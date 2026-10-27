export type CopilotTopic =
  | "summary"
  | "velocity"
  | "baseline"
  | "merchant"
  | "gate"
  | "coverage";

export type CopilotAnswer = {
  text: string;
  evidenceIds: string[];
};

type EventConversation = {
  suggestions: string[];
  answers: Partial<Record<CopilotTopic, CopilotAnswer>>;
};

const conversations: Record<string, EventConversation> = {
  "TRT-2025-892": {
    suggestions: [
      "Summarize this event.",
      "How does transaction velocity compare with the reference?",
      "Which merchant groups contribute most to the volume?",
      "What is the current Gate 1 proximity?",
    ],
    answers: {
      summary: {
        text: "Transaction activity is concentrated across a small merchant group and rises above the selected comparison window. Review recent gate and routing context before deciding on next steps.",
        evidenceIds: ["EVD-892-01", "EVD-892-02"],
      },
      velocity: {
        text: "Observed hourly volume peaks at 1,760 transactions, compared with a reference value of 850 for that interval. The event window ends at 14:00 UTC.",
        evidenceIds: ["EVD-892-01"],
      },
      baseline: {
        text: "A reference series is available for this event. At the observed peak, hourly volume is 1,760 compared with 850 in the reference series.",
        evidenceIds: ["EVD-892-01"],
      },
      merchant: {
        text: "The three leading merchant groups account for 65% of event volume. The largest listed group contributes 5,120 transactions, or 28%.",
        evidenceIds: ["EVD-892-02"],
      },
      gate: {
        text: "The event is associated with Gate 1. Its observed rate is at 91% of the configured reference, according to the event summary.",
        evidenceIds: ["EVD-892-01"],
      },
      coverage: {
        text: "All expected event fields are available. The analysis confidence shown for this event is 82%.",
        evidenceIds: ["EVD-892-01", "EVD-892-02"],
      },
    },
  },
  "TRT-2024-112": {
    suggestions: [
      "Summarize this event.",
      "What was the peak hourly volume?",
      "How is activity distributed across merchant groups?",
      "Is a comparison range available?",
    ],
    answers: {
      summary: {
        text: "Activity remains moderately above the selected comparison range and eases near the end of the event window. Transactions are distributed across several merchant groups.",
        evidenceIds: ["EVD-112-01", "EVD-112-02"],
      },
      velocity: {
        text: "The event reaches 780 transactions per hour in the selected window. The activity rises gradually and eases near the end of the period.",
        evidenceIds: ["EVD-112-01"],
      },
      baseline: {
        text: "A comparison series is available for this event. The observed hourly peak is 780 transactions; the event summary describes activity as moderately above the range.",
        evidenceIds: ["EVD-112-01"],
      },
      merchant: {
        text: "The three leading merchant groups account for 72% of event volume. No single group accounts for a majority.",
        evidenceIds: ["EVD-112-02"],
      },
      gate: {
        text: "The event summary associates this event with Gate 2 and reports 72% proximity to its configured reference.",
        evidenceIds: ["EVD-112-01"],
      },
      coverage: {
        text: "All expected event fields are available. The analysis confidence shown for this event is 67%.",
        evidenceIds: ["EVD-112-01", "EVD-112-02"],
      },
    },
  },
  "TRT-2024-087": {
    suggestions: [
      "Summarize this event.",
      "Is a historical baseline available?",
      "What data is missing?",
      "What does the supplied volume show?",
    ],
    answers: {
      summary: {
        text: "The supplied event data shows elevated activity, but a comparable historical window and gate reference metadata are unavailable. Interpret the observed concentration cautiously.",
        evidenceIds: ["EVD-087-01", "EVD-087-02"],
      },
      velocity: {
        text: "The supplied event window contains 12,140 transactions and peaks at 1,920 transactions per hour. There is no comparison series for this event.",
        evidenceIds: ["EVD-087-01", "EVD-087-02"],
      },
      baseline: {
        text: "No comparable historical window was supplied, so a baseline comparison cannot be made for this event.",
        evidenceIds: ["EVD-087-02"],
      },
      merchant: {
        text: "The three leading merchant groups account for 83% of the supplied event volume. This concentration should be interpreted with the missing comparison context in mind.",
        evidenceIds: ["EVD-087-01", "EVD-087-02"],
      },
      gate: {
        text: "Gate proximity is unavailable because gate reference metadata was not supplied.",
        evidenceIds: ["EVD-087-02"],
      },
      coverage: {
        text: "Data coverage is reported at 68%. The missing items are comparable historical window and gate reference metadata; the available analysis confidence is 41%.",
        evidenceIds: ["EVD-087-02"],
      },
    },
  },
  "TRT-2023-451": {
    suggestions: [
      "Summarize this event.",
      "How does the event compare with its baseline?",
      "What is the analysis confidence?",
      "Which merchant groups are most impacted?",
    ],
    answers: {
      summary: {
        text: "The available event window shows activity close to its selected comparison range, with a lower merchant concentration than the other reviewed events.",
        evidenceIds: ["EVD-451-01"],
      },
      velocity: {
        text: "Hourly volume ranges from 180 to 260 in the displayed series and remains close to the selected comparison values.",
        evidenceIds: ["EVD-451-01"],
      },
      baseline: {
        text: "A comparison series is available. The finding says observed hourly volume remains close to the selected comparison values.",
        evidenceIds: ["EVD-451-01"],
      },
      merchant: {
        text: "The three leading merchant groups contribute 28%, 21%, and 15% respectively. The leading group's transaction count is 820.",
        evidenceIds: ["EVD-451-01"],
      },
      gate: {
        text: "The event summary reports 48% proximity to the Gate 1 reference.",
        evidenceIds: ["EVD-451-01"],
      },
      coverage: {
        text: "Event data is available, but an analysis confidence score was not provided.",
        evidenceIds: ["EVD-451-01"],
      },
    },
  },
};

const topicMatchers: { topic: CopilotTopic; pattern: RegExp }[] = [
  { topic: "baseline", pattern: /baseline|reference|compar(e|ison)/i },
  { topic: "merchant", pattern: /merchant|pan|concentrat/i },
  { topic: "gate", pattern: /gate|threshold/i },
  { topic: "coverage", pattern: /confidence|coverage|missing|available data/i },
  { topic: "velocity", pattern: /velocity|volume|transaction|trend|spike|rate/i },
  { topic: "summary", pattern: /summari[sz]|overview|explain|why|reason/i },
];

export function getCopilotSuggestions(eventId: string): string[] {
  return conversations[eventId]?.suggestions ?? [];
}

export function getCopilotAnswer(eventId: string, prompt: string) {
  const conversation = conversations[eventId];
  const match = topicMatchers.find(({ pattern }) => pattern.test(prompt));

  if (!conversation || !match) return undefined;
  return conversation.answers[match.topic];
}