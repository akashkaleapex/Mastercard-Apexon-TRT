import {
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  Bot,
  BookOpenText,
  Check,
  CircleHelp,
  FilePlus2,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCopilotAnswer, getCopilotSuggestions } from "@/mocks/copilot/conversations";
import { getEventFinding } from "@/mocks/analysis/findings";
import { getDemoEvents } from "@/mocks/events/events";
import { formatDemoTimestamp } from "@/mocks/shared/timestamps";
import type { AnalysisEvidence } from "@/types/analysis";

type ConversationMessage = {
  id: number;
  role: "analyst" | "assistant";
  content: string;
  timestamp: string;
  evidence: AnalysisEvidence[];
};

type ReportNote = {
  id: number;
  content: string;
  eventId: string;
};

const unsupportedAnswer =
  "I can answer questions about this event's summary, transaction volume, comparison baseline, merchant concentration, gate context, and data coverage. Try one of the suggested questions.";

function formatMessageTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function CopilotPage() {
  const { eventId = "" } = useParams();
  const event = getDemoEvents().find((item) => item.id === eventId);
  const finding = getEventFinding(eventId);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [reportNotes, setReportNotes] = useState<ReportNote[]>([]);
  const [reportStatus, setReportStatus] = useState("");
  const [showReport, setShowReport] = useState(false);
  const messageEndRef = useRef<HTMLLIElement>(null);
  const suggestions = getCopilotSuggestions(eventId);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages]);

  if (!event || !finding) {
    return (
      <section className="screen-page" aria-labelledby="copilot-not-found-title">
        <p className="page-eyebrow">Workspace / Co-Pilot</p>
        <h1 className="analysis-page-title" id="copilot-not-found-title">Event not found</h1>
        <p className="page-description">The requested event could not be opened.</p>
        <Button asChild className="back-to-events" variant="outline">
          <Link to="/events">Back to event inbox</Link>
        </Button>
      </section>
    );
  }

  const selectedEvent = event;
  const selectedFinding = finding;

  function submitQuestion(question: string) {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    const timestamp = new Date().toISOString();
    const answer = getCopilotAnswer(selectedEvent.id, trimmedQuestion);
    const evidence = answer
      ? selectedFinding.evidence.filter((item) => answer.evidenceIds.includes(item.id))
      : [];

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "analyst",
        content: trimmedQuestion,
        timestamp,
        evidence: [],
      },
      {
        id: Date.now() + 1,
        role: "assistant",
        content: answer?.text ?? unsupportedAnswer,
        timestamp: new Date(Date.now() + 1).toISOString(),
        evidence,
      },
    ]);
    setPrompt("");
    setReportStatus("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(prompt);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitQuestion(prompt);
    }
  }

  function copyToReport(message: ConversationMessage) {
    if (reportNotes.some((note) => note.content === message.content && note.eventId === selectedEvent.id)) {
      setReportStatus("This response is already in the report notes.");
      return;
    }

    setReportNotes((current) => [
      ...current,
      { id: Date.now(), content: message.content, eventId: selectedEvent.id },
    ]);
    setReportStatus("Response added to report notes.");
    setShowReport(true);
  }

  function removeReportNote(noteId: number) {
    setReportNotes((current) => current.filter((note) => note.id !== noteId));
    setReportStatus("Report note removed.");
  }

  return (
    <section className="screen-page copilot-page" aria-labelledby="copilot-title">
      <div className="copilot-breadcrumb">
        <Link to={`/events/${event.id}`}>Event analysis</Link>
        <ArrowLeft aria-hidden="true" />
        <span>{event.id}</span>
      </div>

      <div className={`copilot-workspace${showReport ? " copilot-report-open" : ""}`}>
        <aside className="copilot-context" aria-label="Current event context">
          <div className="copilot-context-heading">
            <div className="copilot-context-icon"><BookOpenText aria-hidden="true" /></div>
            <div>
              <span className="context-eyebrow">EVENT CONTEXT</span>
              <strong>{event.id}</strong>
            </div>
          </div>

          <div className="context-summary-metrics">
            <div>
              <span>PANs</span>
              <strong>{event.panCount.toLocaleString("en-US")}</strong>
            </div>
            <div>
              <span>Transactions</span>
              <strong>{finding.metrics.transactionCount.toLocaleString("en-US")}</strong>
            </div>
          </div>

          <div className="context-gate-summary">
            <span className={`context-severity severity-${event.severity.toLowerCase()}`} />
            <span>{finding.gateProximityPercent === null ? "Gate unavailable" : `${finding.gateName}: ${finding.gateProximityPercent}%`}</span>
            <strong>{event.severity}</strong>
          </div>

          <dl className="context-metrics">
            <div>
              <dt>Status</dt>
              <dd>{event.status}</dd>
            </div>
            <div>
              <dt>Received</dt>
              <dd>{formatDemoTimestamp(event.receivedAt)}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{finding.confidence === null ? "Not available" : `${finding.confidence}%`}</dd>
            </div>
          </dl>

          <section className="context-merchants" aria-labelledby="context-merchants-title">
            <h2 id="context-merchants-title">Top merchant groups</h2>
            {finding.impactedMerchants.slice(0, 3).map((merchant) => (
              <div className="context-merchant-row" key={merchant.name}>
                <span>{merchant.name}</span>
                <strong>{merchant.sharePercent}%</strong>
              </div>
            ))}
          </section>

          {finding.missingData.length > 0 && (
            <div className="context-data-gap">
              <CircleHelp aria-hidden="true" />
              <span>Some event context is unavailable.</span>
            </div>
          )}

          <Link className="context-analysis-link" to={`/events/${event.id}`}>
            Open event analysis
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </aside>

        <section className="copilot-conversation" aria-label="Event conversation">
          <div className="conversation-header">
            <div className="conversation-title">
              <span className="conversation-title-icon"><Bot aria-hidden="true" /></span>
              <div>
                <h1 id="copilot-title">AI Co-Pilot</h1>
                <p>Ask about this event and its evidence.</p>
              </div>
            </div>
            <Button
              className="chat-header-report"
              variant="ghost"
              size="sm"
              onClick={() => setShowReport((visible) => !visible)}
              aria-expanded={showReport}
            >
              <FilePlus2 aria-hidden="true" />
              Report notes
              <span className="report-count">{reportNotes.length}</span>
            </Button>
          </div>

          <div className="conversation-scroll" aria-live="polite" aria-relevant="additions text">
            {messages.length === 0 ? (
              <div className="conversation-empty">
                <div className="suggestion-heading">
                  <h2>Suggested questions</h2>
                  <p>Choose a prompt or ask your own.</p>
                </div>
                <div className="suggested-questions" aria-label="Suggested questions">
                  {suggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => submitQuestion(suggestion)}>
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ol className="conversation-messages">
                {messages.map((message) => (
                  <li className={`conversation-message message-${message.role}`} key={message.id}>
                    <div className="message-author">
                      {message.role === "analyst" ? "You" : "Co-Pilot"}
                      <time dateTime={message.timestamp}>{formatMessageTime(message.timestamp)}</time>
                    </div>
                    <p className="message-content">{message.content}</p>

                    {message.role === "assistant" && (
                      <div className="assistant-message-actions">
                        {message.evidence.length > 0 && (
                          <details className="response-evidence">
                            <summary>
                              <BookOpenText aria-hidden="true" />
                              Evidence · {message.evidence.length}
                            </summary>
                            <ul>
                              {message.evidence.map((evidence) => (
                                <li key={evidence.id}>
                                  <span>{evidence.id}</span>
                                  <strong>{evidence.label}</strong>
                                  <p>{evidence.detail}</p>
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => copyToReport(message)}>
                          {reportNotes.some((note) => note.content === message.content && note.eventId === event.id)
                            ? <Check aria-hidden="true" />
                            : <FilePlus2 aria-hidden="true" />}
                          Copy to report
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
                <li ref={messageEndRef} aria-hidden="true" />
              </ol>
            )}
          </div>

          <form className="copilot-composer" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="copilot-prompt">Ask about this event</label>
            <div className="composer-input-shell">
              <textarea
                id="copilot-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder="Ask anything about this event..."
                rows={1}
                maxLength={500}
              />
              <Button
                className="composer-send"
                type="submit"
                size="icon"
                disabled={!prompt.trim()}
                aria-label="Send message"
                title="Send message"
              >
                <ArrowUp aria-hidden="true" />
              </Button>
            </div>
            <div className="composer-footer">
              <span>Enter to send · Shift + Enter for a new line</span>
              <span>{event.id}</span>
            </div>
          </form>
        </section>

        {showReport && (
          <aside className="report-notes-panel" aria-labelledby="report-notes-title">
            <div className="report-panel-heading">
              <div>
                <p className="page-eyebrow">Event report</p>
                <h2 id="report-notes-title">Report notes</h2>
              </div>
              <span>{reportNotes.length}</span>
            </div>
            <p className="report-panel-description">Responses you add here stay in this page until you leave.</p>
            {reportStatus && <p className="report-status" role="status">{reportStatus}</p>}
            {reportNotes.length === 0 ? (
              <div className="report-empty-state">
                <FilePlus2 aria-hidden="true" />
                <p>No notes added yet.</p>
                <span>Use “Copy to report” on a response to add it here.</span>
              </div>
            ) : (
              <ol className="report-note-list">
                {reportNotes.map((note) => (
                  <li key={note.id}>
                    <p>{note.content}</p>
                    <button type="button" onClick={() => removeReportNote(note.id)} aria-label="Remove report note">
                      <Trash2 aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </aside>
        )}
      </div>
      <p className="sr-only" role="status">{reportStatus}</p>
    </section>
  );
}