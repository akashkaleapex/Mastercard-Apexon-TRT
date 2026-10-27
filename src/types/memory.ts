import type { ActionKind } from "@/types/actions";
import type { EventSeverity, EventSource } from "@/types/events";

export type MemoryRecord = {
  eventId: string;
  reviewedAt: string;
  severity: EventSeverity;
  source: EventSource;
  pattern: string;
  decision: ActionKind;
  outcome: string;
  summary: string;
  confidence: number | null;
  evidenceIds: string[];
};