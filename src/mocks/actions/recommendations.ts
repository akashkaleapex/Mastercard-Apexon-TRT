import type { ActionOption, ActionKind } from "@/types/actions";

const actionOptions: ActionOption[] = [
  { kind: "block", label: "Block" },
  { kind: "monitor", label: "Monitor" },
  { kind: "whitelist", label: "Whitelist" },
  { kind: "threshold-update", label: "Update threshold" },
  { kind: "no-action", label: "No action" },
];

export function getActionOptions(): ActionOption[] {
  return actionOptions;
}

export function getActionLabel(kind: ActionKind) {
  return actionOptions.find((option) => option.kind === kind)?.label ?? "Action";
}