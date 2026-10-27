export type ActionKind =
  | "block"
  | "monitor"
  | "whitelist"
  | "threshold-update"
  | "no-action";

export type ActionRecordStatus =
  | "Draft"
  | "Awaiting approval"
  | "Approved"
  | "Modified"
  | "Rejected";

export type ActionDecision = "Awaiting approval" | "Approved" | "Modified" | "Rejected";

export type ActionOption = {
  kind: ActionKind;
  label: string;
};

export type ActionDraft = {
  eventId: string;
  action: ActionKind;
  targetGate: string;
  duration: string;
  affectedMerchant: string;
  currentValue: string;
  proposedValue: string;
  rationale: string;
  approver: string;
  status: ActionRecordStatus;
  updatedAt: string;
};