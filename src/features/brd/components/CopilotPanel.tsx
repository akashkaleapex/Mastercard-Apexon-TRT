import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Bot, CircleHelp, FileSearch, Send, ShieldCheck, Sparkles, X } from "lucide-react";

const suggestedQuestions = [
  "Why is this BIN Attack?",
  "Explain recommendation.",
  "Show strongest indicators.",
  "Show similar incidents.",
  "Generate validation questions.",
  "Generate UDT recommendation.",
];

type CopilotFinding = {
  title: string;
  text: string;
  confidence?: string;
  basis: string;
  evidence: string[];
  limitation: string;
};

const defaultResponse: CopilotFinding = {
  title: "Detected behavior",
  text: "Velocity is reported 380% above baseline. The masked transaction sample contains repeated cryptogram values. The merchant concentration claim conflicts with the displayed totals, so that indicator needs validation.",
  confidence: "94% model confidence",
  basis: "Confidence is copied from the current TRT sample record; it is not an independently validated probability.",
  evidence: ["Transaction Volume Trend · 380% spike", "Raw Transaction Grid · repeated sample cryptograms"],
  limitation: "The visible transaction rows are synthetic and do not include source event IDs. PAN concentration is a reported signal, not independently verifiable from this sample.",
};

export function CopilotPanel({ incidentId, onOpenEvidence, onOpenInvestigation }: { incidentId: string; onOpenEvidence: () => void; onOpenInvestigation: () => void }) {
  const copilotScrollRef = useRef<HTMLDivElement>(null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(defaultResponse);
  const [panelOpen, setPanelOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  function closePanel() {
    setPanelOpen(false);
    setMobileOpen(false);
  }

  function openMobilePanel() {
    setPanelOpen(true);
    setMobileOpen(true);
  }

  function askCopilot(prompt: string) {
    const normalized = prompt.toLowerCase();
    if (normalized.includes("why") || normalized.includes("flagged") || normalized.includes("classified")) {
      setResponse({
        title: "Why this was flagged",
        text: "The sample reports velocity 380% above baseline and contains repeated cryptogram values. PAN concentration is reported as a signal, while the merchant share conflicts with displayed totals and remains unverified.",
        confidence: "94% model confidence",
        basis: "Confidence is copied from the current TRT sample record; it is not an independently validated probability.",
        evidence: ["TRT summary · velocity spike", "Raw Transaction Grid · repeated sample cryptograms", "Key fraud signals · PAN concentration reported"],
        limitation: "The transaction rows are synthetic and do not include source event IDs. Confirm the conflicting merchant share before relying on that indicator.",
      });
    } else if (normalized.includes("similar")) {
      setResponse({
        title: "Historical comparison",
        text: "TRT-2025-1234 is the closest listed case, with a 92% similarity score. Its recorded outcome was Threshold Increased and its action was UDT submitted.",
        basis: "The similarity score and outcome are shown in the historical case fixture.",
        evidence: ["Historical Context · TRT-2025-1234"],
        limitation: "The historical record is not proof of the current event. The separate UDT recommendation fixture lists 89% similarity; reconcile the scoring before relying on it.",
      });
    } else if (normalized.includes("recommendation") || normalized.includes("udt")) {
      setResponse({
        title: "Recommended next action",
        text: "Continue SafetyNet Blocking is the current recommendation. A temporary threshold draft proposes 4,000 transactions/hour against a listed current threshold of 1,000.",
        confidence: "94% recommendation confidence",
        basis: "The recommendation fixture cites merchant concentration, velocity, PAN concentration, and crypto replay.",
        evidence: ["Recommendation · supporting indicators", "Recommendation · threshold draft", "Historical Context · TRT-2025-1234"],
        limitation: "No customer validation or merchant promotion notification is available. The recommendation similarity (89%) differs from the listed historical case similarity (92%).",
      });
    } else if (normalized.includes("validation")) {
      setResponse({
        title: "Validation required",
        text: "Confirm whether a ticket release or promotion was active, whether the affected card range was expected in India, and whether authentication or cryptogram handling changed during the incident window.",
        basis: "These checks address the current merchant, geography, and cryptogram indicators.",
        evidence: ["Recommendation · known uncertainties", "Raw Transaction Grid · sample cryptograms"],
        limitation: "No customer response is present in the sample case.",
      });
    } else if (normalized.includes("strongest") || normalized.includes("indicator")) {
      setResponse({
        title: "Supporting indicators",
        text: "The current sample reports a 380% velocity increase and 51 PANs responsible for 67% of traffic. Repeated cryptogram values appear in the synthetic rows; a geographic anomaly is marked not detected.",
        confidence: "94% model confidence",
        basis: "These values are drawn from the TRT summary, signal list, and transaction sample.",
        evidence: ["Transaction Volume Trend", "Key Fraud Signals", "Fraud Indicators", "Raw Transaction Grid"],
        limitation: "The listed Ticketmaster share (82%) conflicts with the displayed transaction aggregate (36.6%); merchant concentration is not confirmed.",
      });
    } else {
      setResponse(defaultResponse);
    }
    setQuestion("");
    if (copilotScrollRef.current) copilotScrollRef.current.scrollTop = 0;
  }

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (question.trim()) askCopilot(question.trim());
  }

  return (
    <>
      {mobileOpen && <button className="brd-copilot-scrim" aria-label="Close SafetyNet Copilot" onClick={closePanel} />}
      <button className={`brd-copilot-launcher${mobileOpen ? " brd-copilot-launcher-hidden" : ""}`} aria-expanded={mobileOpen} onClick={openMobilePanel}><Sparkles size={17} /><span>SafetyNet Copilot</span></button>
      {!panelOpen && <button className="brd-copilot-reopen" aria-label="Reopen Copilot panel" title="Open SafetyNet Copilot" onClick={() => setPanelOpen(true)}><Sparkles size={18} /></button>}
      <aside className={`brd-copilot${panelOpen ? "" : " brd-copilot-closed"}${mobileOpen ? " brd-copilot-mobile-open" : ""}`} aria-label="SafetyNet Investigation Copilot" aria-hidden={!panelOpen && !mobileOpen}>
      <header className="brd-copilot-header"><span className="brd-copilot-mark"><Sparkles size={17} /></span><div><strong>Investigation intelligence</strong><div className="brd-copilot-context"><span><i aria-hidden="true" />Context connected</span><button aria-label={`Open investigation ${incidentId}`} onClick={onOpenInvestigation}>{incidentId}<ArrowUpRight size={13} /></button></div></div><button className="brd-copilot-close" aria-label="Close Copilot panel" onClick={closePanel}><X size={17} /></button></header>
      <div className="brd-copilot-scroll" ref={copilotScrollRef} role="region" aria-label="Copilot investigation content" tabIndex={0}>
        <section className="brd-copilot-response" aria-live="polite"><div><Bot size={15} /> {response.title}{response.confidence && <span>{response.confidence}</span>}</div><p>{response.text}</p><div className="brd-copilot-basis"><strong>Basis</strong><span>{response.basis}</span></div><div className="brd-copilot-evidence"><strong>Supporting sources</strong><ul>{response.evidence.map((item) => <li key={item}>{item}</li>)}</ul><button onClick={onOpenEvidence}><FileSearch size={14} /> Inspect in workspace</button></div><div className="brd-copilot-limit"><strong>Known limitation</strong><span>{response.limitation}</span></div><small>Sample-based AI analysis. Analyst review required.</small></section>
        <div className="brd-copilot-prompts"><span>Start with a question</span>{suggestedQuestions.map((prompt, index) => <button className={index === 0 ? "brd-copilot-prompt-primary" : ""} key={prompt} onClick={() => askCopilot(prompt)}><span>{index === 0 && <CircleHelp size={15} aria-hidden="true" />}{prompt}</span><ArrowUpRight size={13} aria-hidden="true" /></button>)}</div>
      </div>
      <div className="brd-copilot-footer">
        <form className="brd-copilot-composer" onSubmit={submitQuestion}><input aria-label="Ask Copilot" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about this investigation..." /><button aria-label="Send question" type="submit"><Send size={15} /></button></form>
        <div className="brd-copilot-disclaimer"><ShieldCheck size={13} /> Analyst approval is required for all actions.</div>
      </div>
      </aside>
    </>
  );
}