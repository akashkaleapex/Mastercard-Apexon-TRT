export type EventSeverity = "Critical" | "High" | "Medium" | "Low";

export type EventStatus =
  | "Ready for review"
  | "Analysis prepared"
  | "Data incomplete";

export type EventSource = "TRT signal" | "TRT report";

export type TrtEvent = {
  id: string;
  severity: EventSeverity;
  receivedAt: string;
  status: EventStatus;
  source: EventSource;
  merchantCount: number;
  panCount: number;
  demoConfidence: number | null;
};