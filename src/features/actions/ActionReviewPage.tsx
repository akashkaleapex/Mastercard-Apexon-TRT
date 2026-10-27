import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeft,
  Ban,
  Check,
  CircleOff,
  Clock3,
  Eye,
  FileCheck2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getEventFinding } from "@/mocks/analysis/findings";
import { getDemoEvents } from "@/mocks/events/events";
import { getActionOptions, getActionLabel } from "@/mocks/actions/recommendations";
import { formatDemoTimestamp } from "@/mocks/shared/timestamps";
import type { ActionDecision, ActionDraft, ActionKind, ActionRecordStatus } from "@/types/actions";

const actionIcons = {
  block: Ban,
  monitor: Eye,
  whitelist: ShieldCheck,
  "threshold-update": SlidersHorizontal,
  "no-action": CircleOff,
} satisfies Record<ActionKind, typeof Ban>;

const decisionOptions: ActionDecision[] = [
  "Awaiting approval",
  "Approved",
  "Modified",
  "Rejected",
];

type DecisionHistoryItem = {
  status: ActionRecordStatus;
  timestamp: string;
};

function downloadActionPacket(draft: ActionDraft, eventSeverity: string) {
  const contents = JSON.stringify({
    packetType: "TRT analyst action record",
    eventId: draft.eventId,
    eventSeverity,
    action: getActionLabel(draft.action),
    targetGate: draft.targetGate,
    duration: draft.duration,
    affectedMerchant: draft.affectedMerchant,
    currentValue: draft.currentValue,
    proposedValue: draft.proposedValue,
    analystRationale: draft.rationale,
    approver: draft.approver,
    status: draft.status,
    updatedAt: draft.updatedAt,
    execution: "Not executed by this application",
  }, null, 2);
  const file = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${draft.eventId}-action-packet.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ActionReviewPage() {
  const { eventId = "" } = useParams();
  const event = getDemoEvents().find((item) => item.id === eventId);
  const finding = getEventFinding(eventId);
  const [selectedAction, setSelectedAction] = useState<ActionKind | "">("");
  const [targetGate, setTargetGate] = useState("");
  const [duration, setDuration] = useState("");
  const [affectedMerchant, setAffectedMerchant] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [proposedValue, setProposedValue] = useState("");
  const [rationale, setRationale] = useState("");
  const [approver, setApprover] = useState("");
  const [decision, setDecision] = useState<ActionDecision>("Awaiting approval");
  const [draft, setDraft] = useState<ActionDraft | null>(null);
  const [history, setHistory] = useState<DecisionHistoryItem[]>([]);
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    setSelectedAction("");
    setTargetGate(finding?.gateName === "Gate reference unavailable" ? "" : finding?.gateName ?? "");
    setDuration("");
    setAffectedMerchant("");
    setCurrentValue("");
    setProposedValue("");
    setRationale("");
    setApprover("");
    setDecision("Awaiting approval");
    setDraft(null);
    setHistory([]);
    setValidationMessage("");
  }, [eventId, finding?.gateName]);

  if (!event || !finding) {
    return (
      <section className="screen-page" aria-labelledby="action-not-found-title">
        <p className="page-eyebrow">Workspace / actions</p>
        <h1 className="analysis-page-title" id="action-not-found-title">Event not found</h1>
        <p className="page-description">The requested event could not be opened.</p>
        <Button asChild className="back-to-events" variant="outline">
          <Link to="/events">Back to event inbox</Link>
        </Button>
      </section>
    );
  }

  const selectedEvent = event;
  const selectedFinding = finding;
  const selectedOption = getActionOptions().find((option) => option.kind === selectedAction);
  const requiresDuration =
    selectedAction === "block" || selectedAction === "monitor" || selectedAction === "whitelist";
  const isReadyToRecord = Boolean(
    selectedAction &&
    rationale.trim() &&
    (selectedAction === "no-action" || targetGate.trim()) &&
    (!requiresDuration || duration) &&
    (selectedAction !== "whitelist" || affectedMerchant) &&
    (selectedAction !== "threshold-update" || (currentValue.trim() && proposedValue.trim())),
  );

  function createDraft(status: ActionRecordStatus): ActionDraft | undefined {
    if (!selectedAction) {
      setValidationMessage("Select an action before saving this record.");
      return undefined;
    }

    if (selectedAction !== "no-action" && !targetGate.trim()) {
      setValidationMessage("Enter a target gate for this action.");
      return undefined;
    }

    if (requiresDuration && !duration) {
      setValidationMessage("Select a duration for this action.");
      return undefined;
    }

    if (selectedAction === "whitelist" && !affectedMerchant) {
      setValidationMessage("Select an affected merchant group.");
      return undefined;
    }

    if (selectedAction === "threshold-update" && (!currentValue.trim() || !proposedValue.trim())) {
      setValidationMessage("Enter both current and proposed threshold values.");
      return undefined;
    }

    if (!rationale.trim()) {
      setValidationMessage("Add an analyst rationale before saving this record.");
      return undefined;
    }

    return {
      eventId: selectedEvent.id,
      action: selectedAction,
      targetGate: targetGate.trim(),
      duration,
      affectedMerchant,
      currentValue,
      proposedValue,
      rationale: rationale.trim(),
      approver: approver.trim(),
      status,
      updatedAt: new Date().toISOString(),
    };
  }

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextDraft = createDraft("Draft");
    if (!nextDraft) return;

    setDraft(nextDraft);
    setHistory((items) => [...items, { status: "Draft", timestamp: nextDraft.updatedAt }]);
    setValidationMessage("Draft saved in this workspace.");
  }

  function recordDecision() {
    const nextDraft = createDraft(decision);
    if (!nextDraft) return;

    setDraft(nextDraft);
    setHistory((items) => [...items, { status: decision, timestamp: nextDraft.updatedAt }]);
    setValidationMessage("Analyst decision recorded in this workspace.");
  }

  return (
    <section className="screen-page action-review-page" aria-labelledby="action-review-title">
      <div className="action-review-breadcrumb">
        <Link to={`/events/${selectedEvent.id}`}>Event analysis</Link>
        <ArrowLeft aria-hidden="true" />
        <span>{selectedEvent.id}</span>
      </div>

      <div className="action-review-heading">
        <div>
          <p className="page-eyebrow">Analyst review</p>
          <h1 id="action-review-title">Action review</h1>
          <p className="page-description">Prepare a decision record for {selectedEvent.id}.</p>
        </div>
        <span className="action-status-badge">
          <Clock3 aria-hidden="true" />
          {draft?.status ?? "Not started"}
        </span>
      </div>

      <div className="action-review-grid">
        <div className="action-review-main">
          <section className="action-review-section" aria-labelledby="action-options-title">
            <div className="action-section-heading">
              <div>
                <h2 id="action-options-title">Available decisions</h2>
                <p>Select the action to include in the analyst record.</p>
              </div>
              <span className={`severity-label severity-${selectedEvent.severity.toLowerCase()}`}>
                <span aria-hidden="true" className="severity-dot" />
                {selectedEvent.severity}
              </span>
            </div>

            <fieldset className="action-choice-group">
              <legend className="sr-only">Choose an action</legend>
              {getActionOptions().map((option) => {
                const Icon = actionIcons[option.kind];

                return (
                  <label
                    className={`action-choice${selectedAction === option.kind ? " action-choice-selected" : ""}`}
                    key={option.kind}
                  >
                    <input
                      type="radio"
                      name="action-kind"
                      value={option.kind}
                      checked={selectedAction === option.kind}
                      onChange={() => {
                        setSelectedAction(option.kind);
                        setValidationMessage("");
                      }}
                    />
                    <span className="action-choice-icon"><Icon aria-hidden="true" /></span>
                    <span className="action-choice-label">{option.label}</span>
                    {selectedAction === option.kind && <Check className="action-choice-check" aria-hidden="true" />}
                  </label>
                );
              })}
            </fieldset>
          </section>

          <form className="action-review-section action-details-form" onSubmit={saveDraft}>
            <div className="action-section-heading">
              <div>
                <h2>Decision details</h2>
                <p>{selectedOption ? `${selectedOption.label} record` : "Select an action to prepare a record."}</p>
              </div>
              {draft && <span className="action-saved-indicator"><Check aria-hidden="true" />Saved</span>}
            </div>

            <div className="action-form-grid">
              {selectedAction !== "no-action" && (
                <label className="action-field">
                  <span>Target gate <span className="required-marker">*</span></span>
                  <input value={targetGate} onChange={(inputEvent) => setTargetGate(inputEvent.target.value)} placeholder="Enter gate" required />
                </label>
              )}

              {selectedAction !== "no-action" && selectedAction !== "threshold-update" && (
                <label className="action-field">
                  <span>Duration</span>
                  <select value={duration} onChange={(inputEvent) => setDuration(inputEvent.target.value)}>
                    <option value="">Select duration</option>
                    <option value="24 hours">24 hours</option>
                    <option value="48 hours">48 hours</option>
                    <option value="7 days">7 days</option>
                  </select>
                </label>
              )}

              {selectedAction === "whitelist" && (
                <label className="action-field action-field-wide">
                  <span>Affected merchant group</span>
                  <select value={affectedMerchant} onChange={(inputEvent) => setAffectedMerchant(inputEvent.target.value)}>
                    <option value="">Select merchant group</option>
                    {selectedFinding.impactedMerchants.map((merchant) => (
                      <option key={merchant.name} value={merchant.name}>{merchant.name}</option>
                    ))}
                  </select>
                </label>
              )}

              {selectedAction === "threshold-update" && (
                <>
                  <label className="action-field">
                    <span>Current value</span>
                    <input inputMode="decimal" value={currentValue} onChange={(inputEvent) => setCurrentValue(inputEvent.target.value)} placeholder="Enter current value" />
                  </label>
                  <label className="action-field">
                    <span>Proposed value</span>
                    <input inputMode="decimal" value={proposedValue} onChange={(inputEvent) => setProposedValue(inputEvent.target.value)} placeholder="Enter proposed value" />
                  </label>
                </>
              )}

              <label className="action-field action-field-wide">
                <span>Analyst rationale <span className="required-marker">*</span></span>
                <textarea value={rationale} onChange={(inputEvent) => setRationale(inputEvent.target.value)} placeholder="Describe the evidence and reasoning for this decision" rows={3} required />
              </label>

              <label className="action-field action-field-wide">
                <span>Approver</span>
                <input value={approver} onChange={(inputEvent) => setApprover(inputEvent.target.value)} placeholder="Enter approver name" />
              </label>

              <label className="action-field">
                <span>Analyst decision</span>
                <select value={decision} onChange={(inputEvent) => setDecision(inputEvent.target.value as ActionDecision)}>
                  {decisionOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>

            {validationMessage && <p className="action-form-status" role="status">{validationMessage}</p>}

            <div className="action-form-footer">
              <span>Decision records update this workspace only.</span>
              <div>
                <Button type="submit" variant="outline" disabled={!isReadyToRecord}>
                  <FileCheck2 aria-hidden="true" />
                  Save draft
                </Button>
                <Button type="button" onClick={recordDecision} disabled={!isReadyToRecord}>
                  <Check aria-hidden="true" />
                  Record decision
                </Button>
              </div>
            </div>
          </form>
        </div>

        <aside className="action-review-aside">
          <section className="action-review-section" aria-labelledby="action-context-title">
            <div className="action-section-heading">
              <div>
                <h2 id="action-context-title">Event context</h2>
                <p>Evidence and analysis for this decision.</p>
              </div>
            </div>
            <div className="action-context-summary">
              <p>{selectedFinding.summary}</p>
              <dl>
                <div><dt>Analysis confidence</dt><dd>{selectedFinding.confidence === null ? "Not available" : `${selectedFinding.confidence}%`}</dd></div>
                <div><dt>Gate proximity</dt><dd>{selectedFinding.gateProximityPercent === null ? "Unavailable" : `${selectedFinding.gateProximityPercent}%`}</dd></div>
                <div><dt>Impacted merchants</dt><dd>{selectedEvent.merchantCount}</dd></div>
              </dl>
            </div>
            <ul className="action-evidence-list">
              {selectedFinding.evidence.map((item) => (
                <li key={item.id}>
                  <span>{item.id}</span>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="action-review-section decision-history-section" aria-labelledby="decision-history-title">
            <div className="action-section-heading">
              <div>
                <h2 id="decision-history-title">Decision history</h2>
                <p>Status changes in this workspace.</p>
              </div>
              {draft && <span className="action-status-badge">{draft.status}</span>}
            </div>
            {history.length === 0 ? (
              <p className="decision-empty">No decision has been recorded.</p>
            ) : (
              <ol className="decision-history-list">
                {history.map((item, index) => (
                  <li key={`${item.timestamp}-${index}`}>
                    <span className="decision-history-marker" aria-hidden="true" />
                    <div>
                      <strong>{item.status}</strong>
                      <time dateTime={item.timestamp}>{formatDemoTimestamp(item.timestamp)}</time>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <Button
            className="action-export-button"
            variant="outline"
            disabled={!draft}
            onClick={() => draft && downloadActionPacket(draft, selectedEvent.severity)}
          >
            <ArrowDownToLine aria-hidden="true" />
            Download action packet
          </Button>
          <p className="action-boundary-note"><AlertTriangle aria-hidden="true" />No operational rules are changed.</p>
        </aside>
      </div>
    </section>
  );
}