import { Fragment, useState, type FormEvent, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, AlertTriangle, ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, BadgeCheck, Check, CircleAlert, Columns3, Copy, Download, FileCheck2, Info, Link2, Plus, Search, ShieldAlert, Target, UserRound } from "lucide-react";
import {
  CLOSED_STATUSES,
  MAIN_CASE_ID,
  REPEAT_CASE_ID,
  baseAuditEvents,
  caseContext,
  dataGaps,
  declineCodes,
  evidenceMetrics,
  externalEvents,
  extractionWindows,
  fixAreas,
  formatCreated,
  historicalCases,
  interpretation,
  investigationScopes,
  keyMoments,
  merchantDistribution,
  nextStepOptions,
  otherExplanations,
  outcomeExamples,
  patternColors,
  statusColors,
  patternMapping,
  recommendation,
  runContext,
  scorecard,
  signals,
  smeBenchmark,
  topContributors,
  transactionCountries,
  transactionRows,
  trtTrend,
  usefulnessOptions,
  validationChecks,
  verdicts,
  volumeTrend,
  type Transaction,
  type HistoricalCase,
  type TRTCase,
} from "@/features/brd/data";
import { buildAuditRecord, buildUdtSummary, casesWithReview, type ReviewAction, type ReviewState } from "@/features/brd/review";

type ReviewProps = { review: ReviewState; dispatch: (action: ReviewAction) => void };

const severityClass = (severity: string) => (severity === "High" ? "critical" : severity === "Medium" ? "high" : "low");
const windowText = (review: ReviewState) => extractionWindows.find((item) => item.id === review.window)!.text;
const scopeText = (review: ReviewState) => investigationScopes.find((item) => item.id === review.scope)!.text;

function downloadText(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = filename;
  downloadLink.click();
  URL.revokeObjectURL(url);
}

/** Single- or multi-select built from the existing decision-option style. */
function OptionGroup<T extends string>({ label, name, options, isSelected, onSelect, multiple = false }: { label: string; name: string; options: { id: T; label: ReactNode }[]; isSelected: (id: T) => boolean; onSelect: (id: T) => void; multiple?: boolean }) {
  return (
    <div className="brd-option-group">
      <span className="brd-option-group-label" id={`${name}-label`}>{label}</span>
      <div className="brd-decision-actions" role={multiple ? "group" : "radiogroup"} aria-labelledby={`${name}-label`}>
        {options.map((option) => {
          const selected = isSelected(option.id);
          return (
            <label className={`brd-decision-option${selected ? " brd-decision-selected" : ""}`} key={option.id}>
              <input type={multiple ? "checkbox" : "radio"} name={name} value={option.id} checked={selected} onChange={() => onSelect(option.id)} />
              <span className="brd-decision-radio" aria-hidden="true">{selected && <Check size={13} strokeWidth={2.5} />}</span>
              <span className="brd-decision-option-label">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

const ALL_ATTACKS = "All attacks";
const DEFAULT_ATTACK = "BIN Attack";

export function TRTDashboard({ cases, onQueue, onOpenTRT }: { cases: TRTCase[]; onQueue: (pattern?: string) => void; onOpenTRT: (id: string) => void }) {
  const attackTypes = [...new Set(cases.map((item) => item.pattern))];
  const [attack, setAttack] = useState(attackTypes.includes(DEFAULT_ATTACK) ? DEFAULT_ATTACK : ALL_ATTACKS);
  const isAll = attack === ALL_ATTACKS;
  const scoped = isAll ? cases : cases.filter((item) => item.pattern === attack);
  const active = scoped.filter((item) => !CLOSED_STATUSES.includes(item.status));
  const dashboardMetrics = [
    { label: "Active TRTs", value: active.length, tone: "red" },
    { label: "Awaiting Review", value: active.filter((item) => item.status === "Review Required" || item.status === "Open").length, tone: "gold" },
    { label: "Investigating", value: active.filter((item) => item.status === "Investigating").length, tone: "blue" },
    { label: "Decision Recorded", value: scoped.filter((item) => item.status === "Decision Recorded").length, tone: "green" },
    { label: "Linked Repeats", value: scoped.filter((item) => item.status === "Linked").length, tone: "slate" },
  ];
  // All attacks: mix by attack type. One attack: mix by case status (a single-slice donut would say nothing).
  const distribution = (isAll
    ? Object.entries(patternColors).map(([name, color]) => ({ name, color, count: scoped.filter((item) => item.pattern === name).length }))
    : Object.entries(statusColors).map(([name, color]) => ({ name, color, count: scoped.filter((item) => item.status === name).length })))
    .filter((item) => item.count > 0)
    .map((item) => ({ ...item, share: Math.round((item.count / scoped.length) * 100) }));
  const trend = trtTrend.map((day) => ({ day: day.day, count: isAll ? Object.values(day.byPattern).reduce((sum, value) => sum + value, 0) : day.byPattern[attack] ?? 0 }));
  const highRisk = active.filter((item) => item.severity === "High");
  const showsMainCase = scoped.some((item) => item.id === MAIN_CASE_ID);
  const timelineEvents = showsMainCase
    ? [0, 1, 4, 5].map((index) => ({ ...baseAuditEvents[index], time: baseAuditEvents[index].time.slice(0, 5) }))
    : [...scoped].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4).map((item) => ({ time: item.createdAt.slice(11, 16), event: `${item.id} received`, detail: `${item.source} · ${item.issuer} · ${item.assistantView}` }));
  const priorityCase = showsMainCase ? MAIN_CASE_ID : (highRisk[0] ?? active[0] ?? scoped[0])?.id;
  const scopeLabel = isAll ? "all attack types" : attack;

  return (
    <div className="brd-page">
      <div className="brd-page-heading">
        <div><p className="brd-eyebrow">SAFETYNET OPERATIONS</p><h1>TRT Dashboard</h1><p>Operational overview for active transaction risk tickets · {scopeLabel}.</p></div>
        <div className="brd-heading-actions">
          <label className="brd-filter"><span>Attack type</span><select aria-label="Attack type" value={attack} onChange={(event) => setAttack(event.target.value)}><option>{ALL_ATTACKS}</option>{attackTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <button className="brd-button brd-button-primary" onClick={() => onQueue(isAll ? undefined : attack)}>Open TRT Queue <ArrowUpRight size={15} /></button>
        </div>
      </div>
      <section className="brd-metrics" aria-label="TRT metrics">
        {dashboardMetrics.map((metric) => <article className={`brd-metric brd-tone-${metric.tone}`} key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}
      </section>
      <div className="brd-chart-grid">
        <section className="brd-surface brd-chart-surface">
          <div className="brd-section-heading"><div><h2>TRT Trend</h2><p>Last 7 days · all monitored ICAs · {scopeLabel}</p></div><span className="brd-chart-note">TRTs created</span></div>
          <div className="brd-line-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}><CartesianGrid stroke="#dce0e7" strokeDasharray="3 4" vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#5e6779", fontSize: 12 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#5e6779", fontSize: 12 }} /><Tooltip formatter={(value) => [value, "TRTs created"]} /><Area type="monotone" dataKey="count" stroke="#2b4fa8" strokeWidth={2} fill="#2b4fa8" fillOpacity={0.1} /></AreaChart></ResponsiveContainer></div>
        </section>
        <section className="brd-surface brd-chart-surface">
          <div className="brd-section-heading"><div><h2>{isAll ? "Pattern Distribution" : "Status Distribution"}</h2><p>{isAll ? "Case queue mix by attack type" : `${attack} cases by status`}</p></div></div>
          {scoped.length === 0 ? <p className="brd-empty">No cases for this attack type.</p> : <div className="brd-pattern-chart"><div className="brd-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution} dataKey="share" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={3} stroke="none">{distribution.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => [`${value}%`, isAll ? "TRT mix" : "Status mix"]} /></PieChart></ResponsiveContainer><div className="brd-donut-label"><strong>{scoped.length}</strong><small>cases</small></div></div><ul className="brd-legend" aria-label={isAll ? "Pattern distribution" : "Status distribution"}>{distribution.map((item) => <li key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><b>{item.share}%</b></li>)}</ul></div>}
        </section>
      </div>
      <section className="brd-surface brd-dashboard-table">
        <div className="brd-section-heading"><div><h2>High Risk TRTs</h2><p>Active high-severity cases · {scopeLabel}</p></div><button className="brd-text-button" onClick={() => onQueue(isAll ? undefined : attack)}>View queue <ArrowUpRight size={14} /></button></div>
        <div className="brd-table-scroll"><table className="brd-table" aria-label="High risk TRTs"><thead><tr><th>TRT ID</th><th>Pattern</th><th>ICA</th><th>Country</th><th>Status</th><th>Severity</th><th /></tr></thead><tbody>{highRisk.map((item) => <tr key={item.id} onClick={() => onOpenTRT(item.id)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onOpenTRT(item.id); }}><td className="brd-id">{item.id}</td><td>{item.pattern}</td><td>{item.issuer} · {item.ica}</td><td>{item.country}</td><td><span className={`brd-status brd-status-${severityClass(item.severity)}`}>{item.status}</span></td><td><span className={`brd-severity brd-severity-${severityClass(item.severity)}`}>{item.severity}</span></td><td><ArrowUpRight size={15} /></td></tr>)}</tbody></table>{highRisk.length === 0 && <p className="brd-empty">No active high-severity cases for this attack type.</p>}</div>
      </section>
      <section className="brd-surface brd-timeline-surface">
        <div className="brd-section-heading"><div><h2>Recent TRT Activity</h2><p>{showsMainCase ? `${MAIN_CASE_ID} · Investigation timeline` : `Latest ${scopeLabel} cases received`}</p></div><span className="brd-live-indicator"><i aria-hidden="true" />Live</span></div>
        {timelineEvents.length > 0 ? <ol className="brd-timeline">{timelineEvents.map((event) => <li key={`${event.time}-${event.event}`}><time>{event.time}</time><i /><div><strong>{event.event}</strong><span>{event.detail}</span></div></li>)}</ol> : <p className="brd-empty">No recent activity for this attack type.</p>}
        {priorityCase && <button className="brd-button brd-button-outline" onClick={() => onOpenTRT(priorityCase)}>View High Priority TRT <ArrowUpRight size={15} /></button>}
      </section>
    </div>
  );
}

type QueueView = "all" | "awaiting" | "bin" | "warnings" | "recorded";
const queueViews: { id: QueueView; label: string; test: (item: TRTCase) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "awaiting", label: "Awaiting review", test: (item) => !CLOSED_STATUSES.includes(item.status) },
  { id: "bin", label: "BIN-attack pattern", test: (item) => item.pattern === "BIN Attack" },
  { id: "warnings", label: "Input warnings", test: (item) => item.inputCheck !== "OK" },
  { id: "recorded", label: "Decision recorded", test: (item) => item.status === "Decision Recorded" },
];

export function TRTQueue({ onOpenTRT, review, dispatch, initialQuery = "", initialPattern = "All patterns" }: { onOpenTRT: (id: string) => void; initialQuery?: string; initialPattern?: string } & ReviewProps) {
  const cases = casesWithReview(review);
  const [pattern, setPattern] = useState(initialPattern);
  const [status, setStatus] = useState("All statuses");
  const [ica, setIca] = useState(initialQuery);
  const [country, setCountry] = useState("All countries");
  const [severity, setSeverity] = useState("Any severity");
  const [view, setView] = useState<QueueView>("all");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [queueMessage, setQueueMessage] = useState("");
  const needle = ica.trim().toLowerCase();
  const viewTest = queueViews.find((item) => item.id === view)!.test;
  const rows = cases.filter((item) =>
    viewTest(item) &&
    (pattern === "All patterns" || item.pattern === pattern) &&
    (status === "All statuses" || item.status === status) &&
    (!needle || [item.id, item.ica, item.issuer, item.bin].some((value) => value.toLowerCase().includes(needle))) &&
    (country === "All countries" || item.country === country) &&
    (!createdFrom || item.createdAt.slice(0, 10) >= createdFrom) &&
    (!createdTo || item.createdAt.slice(0, 10) <= createdTo) &&
    (severity === "Any severity" || item.severity === severity),
  );
  const queueMetrics = [
    { label: "Open Cases", value: cases.filter(queueViews[1].test).length, tone: "blue" },
    { label: "High Severity", value: cases.filter((item) => item.severity === "High").length, tone: "red" },
    { label: "Possible Repeats", value: cases.filter((item) => item.repeatOf && review.repeat === null).length, tone: "gold" },
    { label: "Manual (OCC)", value: cases.filter((item) => item.source === "OCC ticket").length, tone: "slate" },
    { label: "Outside PoC Scope", value: cases.filter((item) => item.inputCheck === "Unsupported type").length, tone: "orange" },
  ];
  const nextCase = cases.find((item) => item.status === "Review Required") ?? cases.find((item) => item.status === "Open") ?? cases[0];

  return (
    <div className="brd-page">
      <div className="brd-page-heading"><div><p className="brd-eyebrow">SAFETYNET OPERATIONS / INTAKE</p><h1>TRT Queue</h1><p>Automated (xMatters) and manual (OCC) TRT events · times in UTC.</p></div><div className="brd-heading-actions"><span className="brd-result-count">{rows.length} of {cases.length} cases</span><button className="brd-button brd-button-outline" aria-expanded={formOpen} onClick={() => setFormOpen((open) => !open)}><Plus size={15} />Add manual case</button><button className="brd-button brd-button-primary" onClick={() => onOpenTRT(nextCase.id)}>Open next case <ArrowUpRight size={15} /></button></div></div>
      <section className="brd-metrics" aria-label="Queue metrics">
        {queueMetrics.map((metric) => <article className={`brd-metric brd-tone-${metric.tone}`} key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}
      </section>
      {formOpen && <ManualCaseForm onCancel={() => setFormOpen(false)} onSubmit={(values) => { dispatch({ type: "addManualCase", ...values }); setFormOpen(false); setView("all"); setQueueMessage("Manual case added to the queue. Run the extract before analysis."); }} />}
      {queueMessage && <p className="brd-form-status" role="status">{queueMessage}</p>}
      <section className="brd-surface brd-queue-surface">
        <div className="brd-filter-bar">
          <label className="brd-search"><Search size={16} /><input value={ica} onChange={(event) => setIca(event.target.value)} placeholder="Search TRT ID, ICA or BIN..." aria-label="ICA Search" /></label>
          <label className="brd-filter"><span>Show</span><select value={view} onChange={(event) => setView(event.target.value as QueueView)} aria-label="Queue view">{queueViews.map((item) => <option key={item.id} value={item.id}>{item.label} · {cases.filter(item.test).length}</option>)}</select></label>
          <label className="brd-filter"><span>Pattern</span><select value={pattern} onChange={(event) => setPattern(event.target.value)}><option>All patterns</option>{[...new Set(cases.map((item) => item.pattern))].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="brd-filter"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{[...new Set(cases.map((item) => item.status))].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="brd-filter"><span>Country</span><select value={country} onChange={(event) => setCountry(event.target.value)}><option>All countries</option>{[...new Set(cases.map((item) => item.country))].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="brd-filter"><span>From</span><input type="date" aria-label="Created from" value={createdFrom} onChange={(event) => setCreatedFrom(event.target.value)} /></label>
          <label className="brd-filter"><span>To</span><input type="date" aria-label="Created to" value={createdTo} onChange={(event) => setCreatedTo(event.target.value)} /></label>
          <label className="brd-filter"><span>Severity</span><select value={severity} onChange={(event) => setSeverity(event.target.value)}><option>Any severity</option><option>High</option><option>Medium</option><option>Low</option></select></label>
        </div>
        <div className="brd-table-scroll"><table className="brd-table" aria-label="TRT cases"><thead><tr><th>TRT ID</th><th>Received</th><th>Source</th><th>Pattern</th><th>Issuer · ICA</th><th>CID</th><th>BIN</th><th>Country</th><th>Channel</th><th>Signal vs Prior Day</th><th>Severity</th><th>Status</th><th>Input Check</th><th>Assistant View</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id} onClick={() => onOpenTRT(item.id)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onOpenTRT(item.id); }}><td className="brd-id">{item.id}</td><td>{formatCreated(item.createdAt)}</td><td>{item.source}</td><td>{item.pattern}</td><td>{item.issuer} · {item.ica}</td><td>{item.cid}</td><td>{item.bin}</td><td>{item.country}</td><td>{item.channel}</td><td>{item.signal}</td><td><span className={`brd-severity brd-severity-${severityClass(item.severity)}`}>{item.severity}</span></td><td><span className={`brd-status brd-status-${severityClass(item.severity)}`}>{item.status}</span></td><td className={item.inputCheck === "OK" ? "brd-found" : "brd-severity brd-severity-high"}>{item.inputCheck}</td><td>{item.assistantView}</td></tr>)}</tbody></table>{rows.length === 0 && <p className="brd-empty">No cases match these filters.</p>}</div>
        <p className="brd-table-note">“Assistant view” is a preliminary reading for triage, not a fraud determination; every case needs analyst review. Signal = change for the notified ICA against the same window on the prior day.</p>
      </section>
    </div>
  );
}

type ManualValues = { issuer: string; ica: string; bin: string; description: string };
function ManualCaseForm({ onSubmit, onCancel }: { onSubmit: (values: ManualValues) => void; onCancel: () => void }) {
  const [values, setValues] = useState<ManualValues>({ issuer: "", ica: "", bin: "", description: "" });
  const [error, setError] = useState("");
  const update = (key: keyof ManualValues, value: string) => setValues((current) => ({ ...current, [key]: value }));
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!values.issuer.trim() || !values.description.trim()) return setError("Add the issuer and the customer's concern.");
    if (!/^\d{4}$/.test(values.ica)) return setError("ICA must be 4 digits.");
    if (!/^\d{6}$/.test(values.bin)) return setError("BIN must be 6 digits.");
    onSubmit({ ...values, issuer: values.issuer.trim(), description: values.description.trim() });
  }
  return (
    <section className="brd-surface brd-decision-panel">
      <form onSubmit={submit} aria-label="Add manual case">
        <div className="brd-section-heading"><div><h2>Add Manual Case (OCC Ticket)</h2><p>Customer-raised concern. Masked or no card numbers only.</p></div></div>
        <div className="brd-filter-bar">
          <label className="brd-filter"><span>Issuer</span><input value={values.issuer} onChange={(event) => update("issuer", event.target.value)} /></label>
          <label className="brd-filter"><span>ICA</span><input value={values.ica} maxLength={4} inputMode="numeric" onChange={(event) => update("ica", event.target.value)} /></label>
          <label className="brd-filter"><span>BIN</span><input value={values.bin} maxLength={6} inputMode="numeric" onChange={(event) => update("bin", event.target.value)} /></label>
        </div>
        <label className="brd-notes-field"><span>Customer Concern</span><textarea rows={3} value={values.description} onChange={(event) => update("description", event.target.value)} placeholder="What the customer reported, with times in UTC..." /></label>
        {error && <p className="brd-form-status" role="alert">{error}</p>}
        <div className="brd-form-actions brd-form-actions-row"><button type="button" className="brd-button brd-button-outline" onClick={onCancel}>Cancel</button><button type="submit" className="brd-button brd-button-primary">Add to Queue <Check size={15} /></button></div>
      </form>
    </section>
  );
}

export function TRTHeader({ incident, review }: { incident: TRTCase; review: ReviewState }) {
  const isMain = incident.id === MAIN_CASE_ID;
  return (
    <header className="brd-trt-header">
      <div className="brd-trt-heading"><div><p className="brd-eyebrow">TRT INVESTIGATION WORKSPACE</p><h1>{incident.id}</h1></div><span className="brd-status brd-status-critical">{CLOSED_STATUSES.includes(incident.status) ? incident.status : "Analyst Review Required"}</span></div>
      <dl className="brd-case-facts"><div><dt>Pattern</dt><dd>{incident.pattern}</dd></div><div><dt>Severity</dt><dd className="brd-confidence">{incident.severity}</dd></div><div><dt>Issuer · ICA</dt><dd>{incident.issuer} · {incident.ica}</dd></div><div><dt>CID</dt><dd>{incident.cid}</dd></div><div><dt>BIN</dt><dd>{incident.bin}</dd></div><div><dt>Country</dt><dd>{incident.country}</dd></div><div><dt>Channel</dt><dd>{incident.channel}</dd></div><div><dt>Source</dt><dd>{incident.source}</dd></div><div><dt>Scope</dt><dd>{isMain ? scopeText(review) : `ICA ${incident.ica}`}</dd></div><div><dt>Trigger Time</dt><dd>{formatCreated(incident.createdAt)}</dd></div></dl>
    </header>
  );
}

export function InvestigationSummaryCard() {
  return (
    <section className="brd-summary-card">
      <div className="brd-summary-icon"><ShieldAlert size={20} /></div>
      <div className="brd-summary-content"><p className="brd-eyebrow">AI INVESTIGATION SUMMARY</p><h2>Pattern Consistent With a BIN Attack · Requires Analyst Review</h2><p>Velocity and cryptogram signals support review. Merchant concentration is not yet confirmed: the signal claim and displayed totals do not agree.</p><ul>{["Velocity spike reported", "PAN concentration reported", "Repeated cryptographic values in sample", "Merchant share needs validation"].map((reason) => <li key={reason}><Check size={14} />{reason}</li>)}</ul></div>
      <div className="brd-risk-score"><span>EVIDENCE STRENGTH</span><strong>{recommendation.evidenceStrength}</strong><em>Not a confirmed fraud finding</em></div>
    </section>
  );
}

const signalIcons: Record<string, typeof ShieldAlert> = {
  "Crypto Replay": ShieldAlert, "PAN Concentration": CircleAlert, "Merchant Share Mismatch": AlertTriangle, "Velocity Spike": ArrowUp,
  "Geo Anomaly": Check, "BIN Concentration": Target, "ADC Mismatch": ShieldAlert, "Short Burst": Activity,
};

export function SignalCards({ corrections = [] }: { corrections?: ReviewState["corrections"] }) {
  return <section className="brd-signal-grid" aria-label="Key fraud signals">{signals.map(({ title, detail, state, fields }) => { const Icon = signalIcons[title]; return <article className={`brd-signal-card${state === "Detected" ? " brd-signal-alert" : state === "Needs Validation" ? " brd-signal-warning" : ""}`} key={title}><span className="brd-signal-icon"><Icon size={16} /></span><div><strong>{title}</strong><p>{detail}</p><small>{state} · {fields}</small>{corrections.filter((correction) => correction.fact === title).map((correction) => <small className="brd-correction" key={correction.time}>Correction flagged {correction.time}: {correction.note}</small>)}</div></article>; })}</section>;
}

export function OverviewPanel({ incident, review, dispatch }: { incident: TRTCase } & ReviewProps) {
  const detected = signals.filter((signal) => signal.state === "Detected");
  const trace = [
    { label: "FACT", value: "145,231 transactions", detail: "71% originated in India", icon: FileCheck2 },
    { label: "EVIDENCE", value: `${detected.length} of ${signals.length} signals detected`, detail: detected.map((signal) => signal.title.split(" ")[0]).join(", "), icon: Activity },
    { label: "INTERPRETATION", value: "Consistent with BIN Attack", detail: "Not a confirmed fraud finding", icon: ShieldAlert },
    { label: "RECOMMENDATION", value: "Keep current control", detail: "Advisory; no change is made", icon: ArrowRight },
    { label: "HUMAN DECISION", value: review.recordedAt ? "Decision recorded" : "Awaiting analyst", detail: "Review and record rationale", icon: UserRound },
  ];
  const isMain = incident.id === MAIN_CASE_ID;
  return <div className="brd-panel-stack"><InvestigationSummaryCard /><section className="brd-evidence-chain" aria-label="Evidence to decision trace">{trace.map(({ label, value, detail, icon: Icon }) => <article key={label} data-stage={label.toLowerCase()}><span className="brd-chain-icon"><Icon size={16} /></span><div><small>{label}</small><strong>{value}</strong><span>{detail}</span></div></article>)}</section><SignalCards corrections={review.corrections} />{isMain && <AssessmentDetail dispatch={dispatch} />}<section className="brd-surface brd-overview-note"><div className="brd-section-heading"><div><h2>Investigation Snapshot</h2><p>Analyst review is required before any operational change.</p></div><span className="brd-status brd-status-critical">{incident.severity} severity</span></div><div className="brd-snapshot-grid"><div><span>Current disposition</span><strong>{incident.status}</strong></div><div><span>Pattern family</span><strong>{incident.pattern}</strong></div><div><span>Evidence window</span><strong>29 Oct 2026 · {isMain ? windowText(review) : "not loaded"}</strong></div><div><span>Decision owner</span><strong>Alex Morgan · SafetyNet Analyst</strong></div></div></section>
    {isMain ? <IntakeValidation review={review} dispatch={dispatch} /> : <section className="brd-surface"><div className="brd-section-heading"><div><h2>Intake &amp; Assessment</h2><p>Detailed intake checks and signals are loaded for {MAIN_CASE_ID} only in this PoC.</p></div><span className="brd-data-badge">{incident.inputCheck}</span></div><div className="brd-ai-context brd-section-bottom"><span>Assistant view</span><p>{incident.assistantView}. Preliminary triage reading, not a fraud determination.{incident.description ? ` Reported: “${incident.description}”` : ""}</p></div></section>}
  </div>;
}

function CheckLine({ result, children }: { result: "pass" | "warn"; children: ReactNode }) {
  const Icon = result === "pass" ? Check : AlertTriangle;
  return <p className={`brd-check brd-check-${result}`}><Icon size={15} aria-hidden="true" />{children}</p>;
}

function IntakeValidation({ review, dispatch }: ReviewProps) {
  const warnings = validationChecks.filter((check) => check.result === "warn").length;
  return (
    <>
      <section className="brd-surface" aria-labelledby="intake-heading">
        <div className="brd-section-heading"><div><h2 id="intake-heading">Intake &amp; Validation</h2><p>Case context, extraction window and investigation scope (BR-16, BR-20).</p></div><span className="brd-data-badge">Input checked</span></div>
        <div className="brd-snapshot-grid">{caseContext.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>
        <OptionGroup label="Extraction window" name="extraction-window" options={extractionWindows} isSelected={(id) => review.window === id} onSelect={(id) => dispatch({ type: "setWindow", window: id })} />
        <p className="brd-table-note">Started at the usual 2-hour window and extended to 4 hours to cover the build-up. Extend in 15-minute steps; evidence is never silently truncated.{review.window !== "4h" && " A re-run has been requested for the new window; evidence shown stays on the current 4 h extract until it completes."}</p>
        <OptionGroup label="Investigation scope" name="investigation-scope" options={investigationScopes} isSelected={(id) => review.scope === id} onSelect={(id) => dispatch({ type: "setScope", scope: id })} />
        {review.scope === "CID" ? (
          <div className="brd-uncertainty brd-section-bottom">
            <span>CID SCOPE NEEDS APPROVAL</span>
            <p><AlertTriangle size={15} aria-hidden="true" />CID scope covers 3 ICAs and roughly 2.6× the rows. It needs approval before the extract is run (BR-20); evidence stays on ICA scope until then.</p>
            {review.cidApprovalRequested ? <p><Check size={15} aria-hidden="true" />Approval requested. Waiting for an approver.</p> : <button className="brd-button brd-button-outline brd-inline-button" onClick={() => dispatch({ type: "requestCidApproval" })}>Request CID Approval</button>}
          </div>
        ) : <p className="brd-table-note">ICA is the normal starting scope; the contributor output points to ICA 3305.</p>}
      </section>
      <div className="brd-evidence-lower">
        <section className="brd-surface">
          <div className="brd-section-heading"><div><h2>Input Validation</h2><p>Checks run on the extract before analysis.</p></div><span className="brd-status brd-status-high">Ready · {warnings} non-blocking warnings</span></div>
          <div className="brd-check-list">{validationChecks.map((check) => <CheckLine key={check.title} result={check.result}><span><b>{check.title}</b> · {check.detail}</span></CheckLine>)}</div>
        </section>
        <section className="brd-surface">
          <div className="brd-section-heading"><div><h2>Pattern-to-Data Mapping</h2><p>BIN-attack attributes mapped to fields in this extract (BR-28)</p></div></div>
          <div className="brd-table-scroll"><table className="brd-table" aria-label="Pattern-to-data mapping"><thead><tr><th>Pattern Attribute</th><th>Source Fields</th><th>Status</th></tr></thead><tbody>{patternMapping.map((row) => <tr key={row.attribute}><td>{row.attribute}</td><td className="brd-pan">{row.fields}</td><td><span className={`brd-status ${row.status === "Mapped" ? "brd-status-mapped" : row.status === "Partial" ? "brd-status-high" : ""}`}>{row.status}</span></td></tr>)}</tbody></table></div>
        </section>
      </div>
    </>
  );
}

function AssessmentDetail({ dispatch }: Pick<ReviewProps, "dispatch">) {
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [signal, setSignal] = useState(signals[0].title);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  function submitCorrection(event: FormEvent) {
    event.preventDefault();
    if (!note.trim()) return setMessage("Describe what is wrong with the signal.");
    dispatch({ type: "addCorrection", fact: signal, note: note.trim() });
    setMessage(`Correction to ${signal} logged in the audit trail.`);
    setNote("");
    setCorrectionOpen(false);
  }
  return (
    <section className="brd-surface">
      <div className="brd-section-heading"><div><h2>What the Evidence Suggests</h2><p>The assistant's reading of the signals above</p></div><span className="brd-data-badge">INTERPRETATION</span></div>
      <div className="brd-ai-context brd-section-bottom"><span>Interpretation</span><p>{interpretation}</p></div>
      <div className="brd-correction-bar">
        {correctionOpen ? (
          <form className="brd-filter-bar" onSubmit={submitCorrection} aria-label="Flag a correction">
            <label className="brd-filter"><span>Signal</span><select value={signal} onChange={(event) => setSignal(event.target.value)} aria-label="Signal">{signals.map((item) => <option key={item.title}>{item.title}</option>)}</select></label>
            <label className="brd-search"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="What is wrong with this signal?" aria-label="What is wrong" /></label>
            <button type="submit" className="brd-button brd-button-primary">Log Correction</button>
            <button type="button" className="brd-button brd-button-outline" onClick={() => setCorrectionOpen(false)}>Cancel</button>
          </form>
        ) : <button className="brd-text-button" onClick={() => { setCorrectionOpen(true); setMessage(""); }}>Is any signal wrong? Flag a correction <ArrowUpRight size={14} /></button>}
        {message && <p className="brd-form-status" role="status">{message}</p>}
      </div>
    </section>
  );
}

const tableColumns: { key: keyof Transaction; label: string }[] = [
  { key: "timestamp", label: "Timestamp" }, { key: "merchant", label: "Merchant" }, { key: "amount", label: "Amount" },
  { key: "pan", label: "PAN" }, { key: "country", label: "Country" }, { key: "issuer", label: "Issuer" },
  { key: "acquirer", label: "Acquirer" }, { key: "adc", label: "ADC Indicator" }, { key: "cryptogram", label: "Cryptogram" },
  { key: "responseCode", label: "Code" }, { key: "declineSource", label: "Decline Source" },
];
type TransactionFilterKey = "merchant" | "country" | "issuer" | "acquirer" | "adc" | "declineSource";
const transactionFilterColumns: { key: TransactionFilterKey; label: string }[] = [
  { key: "merchant", label: "Merchant" }, { key: "country", label: "Country" }, { key: "issuer", label: "Issuer" },
  { key: "acquirer", label: "Acquirer" }, { key: "adc", label: "ADC" }, { key: "declineSource", label: "Decline Source" },
];

export function TransactionGrid() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<TransactionFilterKey, string>>({ merchant: "", country: "", issuer: "", acquirer: "", adc: "", declineSource: "" });
  const [sortKey, setSortKey] = useState<keyof Transaction>("timestamp");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Transaction>>(() => new Set(tableColumns.map(({ key }) => key)));
  const [columnsOpen, setColumnsOpen] = useState(false);
  const pageSize = 10;
  const filtered = transactionRows.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(query.toLowerCase())) &&
    transactionFilterColumns.every(({ key }) => !filters[key] || (row[key] || "Approved") === filters[key]),
  );
  const sorted = [...filtered].sort((a, b) => {
    const first = a[sortKey];
    const second = b[sortKey];
    const compared = typeof first === "number" && typeof second === "number" ? first - second : String(first).localeCompare(String(second));
    return ascending ? compared : -compared;
  });
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize);

  function changeFilter(key: TransactionFilterKey, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function changeSort(key: keyof Transaction) {
    setAscending(key === sortKey ? !ascending : true);
    setSortKey(key);
  }

  function toggleColumn(key: keyof Transaction) {
    setVisibleColumns((current) => {
      if (current.has(key) && current.size === 1) return current;
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function exportRows() {
    const exportColumns = tableColumns.filter(({ key }) => visibleColumns.has(key));
    const escapeCsv = (value: string | number) => `"${String(value).replaceAll("\"", "\"\"")}"`;
    const csv = [
      exportColumns.map(({ label }) => escapeCsv(label)).join(","),
      ...sorted.map((row) => exportColumns.map(({ key }) => escapeCsv(row[key])).join(",")),
    ].join("\r\n");
    downloadText("TRT-2026-7821-transactions.csv", csv, "text/csv;charset=utf-8");
  }

  function renderCell(row: Transaction, key: keyof Transaction) {
    if (key === "timestamp") return `${new Date(row.timestamp).toLocaleString("en-GB", { timeZone: "UTC", hour12: false })} UTC`;
    if (key === "amount") return `$${row.amount.toFixed(2)}`;
    if (key === "adc") return <span className={`brd-adc brd-adc-${row.adc.toLowerCase()}`}>{row.adc}</span>;
    if (key === "declineSource") return row.declineSource || "Approved";
    return row[key];
  }

  return (
    <section className="brd-surface brd-transaction-panel">
      <div className="brd-section-heading"><div><h2>Raw Transaction Grid</h2><p>{filtered.length} of 50 masked transactions</p></div><span className="brd-data-badge">Synthetic data</span></div>
      <div className="brd-grid-controls">
        <label className="brd-search"><Search size={15} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search transactions..." aria-label="Search transactions" /></label>
        {transactionFilterColumns.map(({ key, label }) => <label className="brd-filter" key={key}><span>{label}</span><select aria-label={`Filter ${label}`} value={filters[key]} onChange={(event) => changeFilter(key, event.target.value)}><option value="">All</option>{[...new Set(transactionRows.map((row) => row[key] || "Approved"))].map((item) => <option key={item}>{item}</option>)}</select></label>)}
        <div className="brd-grid-actions">
          <div className="brd-column-control">
            <button className="brd-grid-action" aria-expanded={columnsOpen} aria-controls="brd-column-options" onClick={() => setColumnsOpen((open) => !open)}><Columns3 size={15} />Columns</button>
            {columnsOpen && <div className="brd-column-options" id="brd-column-options" role="group" aria-label="Visible transaction columns">{tableColumns.map(({ key, label }) => <label key={key}><input type="checkbox" checked={visibleColumns.has(key)} disabled={visibleColumns.size === 1 && visibleColumns.has(key)} onChange={() => toggleColumn(key)} />{label}</label>)}</div>}
          </div>
          <button className="brd-grid-action" onClick={exportRows}><Download size={15} />Export CSV</button>
        </div>
      </div>
      <div className="brd-table-scroll"><table className="brd-table brd-transaction-table" aria-label="Raw transaction grid"><thead><tr>{tableColumns.filter(({ key }) => visibleColumns.has(key)).map(({ key, label }) => <th key={key} aria-sort={sortKey === key ? (ascending ? "ascending" : "descending") : "none"}><button onClick={() => changeSort(key)}>{label}{sortKey === key && (ascending ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</button></th>)}</tr></thead><tbody>{visible.map((row, index) => <Fragment key={`${row.pan}-${index}`}>
        <tr className={expandedTransaction === row.pan ? "brd-transaction-selected" : ""} tabIndex={0} aria-expanded={expandedTransaction === row.pan} aria-label={`Transaction ${row.pan} details`} onClick={() => setExpandedTransaction((current) => current === row.pan ? null : row.pan)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setExpandedTransaction((current) => current === row.pan ? null : row.pan); } }}>
          {tableColumns.filter(({ key }) => visibleColumns.has(key)).map(({ key }) => <td className={key === "pan" ? "brd-pan" : ""} key={key}>{renderCell(row, key)}</td>)}
        </tr>
        {expandedTransaction === row.pan && <tr className="brd-transaction-detail"><td colSpan={visibleColumns.size}><div><strong>Sample record details</strong><span>Merchant: {row.merchant}</span><span>Time: {renderCell(row, "timestamp")}</span><span>Amount: {renderCell(row, "amount")}</span><span>Country: {row.country}</span><span>Issuer / acquirer: {row.issuer} / {row.acquirer}</span><span>ADC: {row.adc}</span><span>Cryptogram: {row.cryptogram}</span><span>Response: {row.responseCode} · {row.declineSource || "Approved"}</span><small>Synthetic transaction sample; source-system event ID is not included.</small></div></td></tr>}
      </Fragment>)}</tbody></table>{visible.length === 0 && <p className="brd-empty">No transactions match these filters.</p>}</div>
      <div className="brd-pagination"><span>Showing <strong>{sorted.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, sorted.length)}</strong> of {sorted.length}</span><div><button aria-label="Previous transaction page" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>‹</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button className={pageNumber === page ? "brd-page-active" : ""} key={pageNumber} aria-label={`Transaction page ${pageNumber}`} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}<button aria-label="Next transaction page" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>›</button></div></div>
    </section>
  );
}

export function EvidencePanel({ review }: { review: ReviewState }) {
  return (
    <div className="brd-panel-stack">
      {review.window !== "4h" && <p className="brd-form-status" role="status">Window change requested ({windowText(review)}). Figures below are from the current 4 h extract until the re-run completes.</p>}
      <section className="brd-evidence-metrics">{evidenceMetrics.map((item, index) => <article className={`brd-surface brd-evidence-metric brd-evidence-metric-${index}`} key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.note}</small></article>)}</section>
      <div className="brd-chart-grid brd-evidence-charts">
        <section className="brd-surface brd-chart-surface"><div className="brd-section-heading"><div><h2>Transaction Volume Trend</h2><p>Transactions per 30-minute interval vs prior day · UTC</p></div><span className="brd-spike-label">↑ 380% spike</span></div><div className="brd-line-chart" role="img" aria-label="Transactions per half-hour rise from 7,400 at 08:00 to a 38,800 peak at 10:30 UTC, against about 4,300 per half-hour on the prior day."><ResponsiveContainer width="100%" height="100%"><AreaChart data={volumeTrend} margin={{ top: 12, right: 12, left: -14, bottom: 0 }}><CartesianGrid stroke="#dce0e7" strokeDasharray="3 4" vertical={false} /><XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#5e6779", fontSize: 12 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#5e6779", fontSize: 12 }} tickFormatter={(value: number) => `${value / 1000}k`} /><Tooltip formatter={(value, name) => [Number(value).toLocaleString(), name === "prior" ? "Prior day" : "Transactions"]} /><Area type="monotone" dataKey="prior" stroke="#9aa3b2" strokeWidth={2} strokeDasharray="4 3" fill="#9aa3b2" fillOpacity={0.06} /><Area type="monotone" dataKey="transactions" stroke="#2b4fa8" strokeWidth={2} fill="#2b4fa8" fillOpacity={0.1} /></AreaChart></ResponsiveContainer></div><ul className="brd-legend brd-chart-legend"><li><i style={{ background: "#2b4fa8" }} /><span>This window</span></li><li><i style={{ background: "#9aa3b2" }} /><span>Prior day, same window</span></li></ul><div className="brd-key-moments">{keyMoments.map((moment) => <span key={moment.time}><b>{moment.time}</b> {moment.text}</span>)}</div></section>
        <section className="brd-surface brd-chart-surface"><div className="brd-section-heading"><div><h2>Country Distribution</h2><p>Share of transactions</p></div></div><div className="brd-pattern-chart"><div className="brd-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={transactionCountries} dataKey="share" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={3} stroke="none">{transactionCountries.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => [`${value}%`, "Transactions"]} /></PieChart></ResponsiveContainer><div className="brd-donut-label"><strong>145k</strong><small>reviewed</small></div></div><ul className="brd-legend">{transactionCountries.map((item) => <li key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><b>{item.share}%</b></li>)}</ul></div></section>
      </div>
      <div className="brd-evidence-lower">
        <section className="brd-surface"><div className="brd-section-heading"><div><h2>Top Merchants</h2><p>Transaction concentration by merchant</p></div></div><div className="brd-merchant-table">{merchantDistribution.map((item, index) => <div key={item.merchant}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.merchant}</strong><div><i style={{ width: `${item.share * 2.4}%` }} /></div><b>{item.count.toLocaleString()}</b><small>{item.share}%</small></div>)}</div></section>
        <section className="brd-surface"><div className="brd-section-heading"><div><h2>Decline Codes in Window</h2><p>134,669 declines vs 1,240 prior day · meanings illustrative until the Mastercard reference arrives (A4)</p></div></div><div className="brd-table-scroll"><table className="brd-table" aria-label="Decline codes in window"><thead><tr><th>Code</th><th>Meaning</th><th>Now</th><th>Prior Day</th></tr></thead><tbody>{declineCodes.map((row) => <tr key={row.code}><td className="brd-id">{row.code}</td><td>{row.meaning}</td><td><strong>{row.now.toLocaleString()}</strong></td><td>{row.prior.toLocaleString()}</td></tr>)}</tbody></table></div></section>
      </div>
      <section className="brd-surface"><div className="brd-section-heading"><div><h2>Top Contributors</h2><p>Contributor-query output (BIN and channel) against the prior day; merchants are listed above</p></div></div><div className="brd-table-scroll"><table className="brd-table" aria-label="Top contributors"><thead><tr><th>Dimension</th><th>Value</th><th>Txns</th><th>Prior Day</th><th>Share of Window</th><th>Decline Rate</th></tr></thead><tbody>{topContributors.map((row) => <tr key={`${row.dimension}-${row.value}`}><td>{row.dimension}</td><td>{row.value}</td><td><strong>{row.txns.toLocaleString()}</strong></td><td>{row.prior.toLocaleString()}</td><td>{row.share}</td><td className="brd-severity brd-severity-critical">{row.declineRate}</td></tr>)}</tbody></table></div></section>
      <TransactionGrid />
    </div>
  );
}

export function HistoricalCasesPanel({ review, dispatch, onOpenTRT }: ReviewProps & { onOpenTRT: (id: string) => void }) {
  const bestCase = historicalCases[0];
  return (
    <div className="brd-panel-stack">
      <div className="brd-page-heading"><div><p className="brd-eyebrow">INVESTIGATION / HISTORICAL REASONING</p><h2>Historical Context</h2><p>Compare prior evidence, analyst outcomes, and operational lessons. Past outcomes are reference only (BR-24).</p></div><span className="brd-context-pill"><Target size={14} /> BIN Attack · 3 matched cases</span></div>
      <div className="brd-history-layout">
        <section className="brd-surface brd-case-comparisons">
          <div className="brd-section-heading"><div><h2>Case Comparisons</h2><p>Similarity is based on observed behavior and merchant context</p></div></div>
          <div className="brd-case-comparison-grid">
            {historicalCases.map((item: HistoricalCase, index) => <article className={`brd-case-comparison${index === 0 ? " brd-case-comparison-best" : ""}`} key={item.id}>
              <header><span className="brd-case-pattern"><Target size={14} />{item.pattern}</span>{index === 0 && <span className="brd-best-label">Closest match</span>}</header>
              <div className="brd-case-identity"><strong>{item.id}</strong><span>{item.merchant} · {item.opened}</span></div>
              <div className="brd-case-match"><div><span>Pattern similarity</span><strong>{item.similarity}%</strong></div><div className="brd-case-match-track"><i style={{ width: `${item.similarity}%` }} /></div></div>
              <div className="brd-case-decision"><span>Txns · Declined · Duration</span><strong>{item.txns.toLocaleString()} · {item.declined} · {item.duration}</strong></div>
              <div className="brd-case-outcome"><span>Prior outcome</span><strong><BadgeCheck size={15} />{item.outcome}</strong></div>
              <div className="brd-case-decision"><span>Decision</span><strong>{item.action}</strong></div>
              <div className="brd-case-lesson"><span><Check size={13} />Lesson learned</span><p>{item.lesson}</p></div>
            </article>)}
          </div>
        </section>
        <aside className="brd-best-match"><p className="brd-eyebrow">Most similar incident</p><strong className="brd-match-score">{bestCase.similarity}<small>%</small></strong><span>{bestCase.id}</span><dl><div><dt>Merchant</dt><dd>{bestCase.merchant}</dd></div><div><dt>Outcome</dt><dd>{bestCase.outcome}</dd></div><div><dt>Action</dt><dd>{bestCase.action}</dd></div></dl><div className="brd-match-takeaway"><span>Relevance to this TRT</span><p>Historical match supports further analyst review; it does not independently justify changing the current control.</p></div></aside>
      </div>
      <section className="brd-surface brd-events-panel">
        <div className="brd-section-heading"><div><h2>External Context</h2><p>Public activity that may explain legitimate volume, each checked against the evidence (BR-30)</p></div><span className="brd-data-badge">Unverified context</span></div>
        <div className="brd-events-grid">{externalEvents.map((event) => <article key={event.title}><span className="brd-event-tag">{event.category}</span><h3>{event.title}</h3><p>{event.detail}</p><small className={`brd-event-relevance brd-event-relevance-${event.result === "Partly fits" ? "high" : "low"}`}><span>Benign check</span><strong>{event.result}</strong></small></article>)}</div>
        <div className="brd-ai-context"><span>AI context summary</span><p>Current behavior may be related to external business activity. These events could explain part of the traffic, but do not account for repeated cryptographic values and concentrated PAN activity.</p></div>
      </section>
      <section className="brd-surface">
        <div className="brd-section-heading"><div><h2>Other Explanations Checked</h2><p>Non-event explanations tested against the evidence (BR-30)</p></div></div>
        <div className="brd-table-scroll"><table className="brd-table" aria-label="Other explanations checked"><thead><tr><th>Explanation</th><th>Result</th><th>Why</th></tr></thead><tbody>{otherExplanations.map((row) => <tr key={row.explanation}><td>{row.explanation}</td><td><span className={`brd-status ${row.result === "Not supported" ? "" : "brd-status-high"}`}>{row.result}</span></td><td>{row.why}</td></tr>)}</tbody></table></div>
      </section>
      <section className="brd-surface">
        <div className="brd-section-heading"><div><h2>Possible Repeat Trigger</h2><p>{REPEAT_CASE_ID} arrived at 13:40 UTC with the same ICA, BIN and cryptogram value while this case is open (BR-13). Matching rule and window still to be agreed (G-12).</p></div><span className="brd-data-badge">{review.repeat === "linked" ? "Linked" : review.repeat === "separate" ? "Separate case" : "Not linked"}</span></div>
        <div className="brd-decision-actions">
          <button className={review.repeat === "linked" ? "brd-decision-selected" : ""} aria-pressed={review.repeat === "linked"} onClick={() => dispatch({ type: "setRepeat", repeat: "linked" })}><Link2 size={13} /> {review.repeat === "linked" ? "Linked as Repeat" : "Link as Repeat"}</button>
          <button className={review.repeat === "separate" ? "brd-decision-selected" : ""} aria-pressed={review.repeat === "separate"} onClick={() => dispatch({ type: "setRepeat", repeat: "separate" })}>Treat as New Case</button>
          <button onClick={() => onOpenTRT(REPEAT_CASE_ID)}>Open {REPEAT_CASE_ID}</button>
        </div>
      </section>
      <section className="brd-surface brd-events-panel">
        <div className="brd-section-heading"><div><h2>Outcome Examples</h2><p>Cases from the same queue, each reaching a different conclusion. None of these is a fraud determination; “not fraud, operational” is a proposed state (G-08).</p></div></div>
        <div className="brd-events-grid">{outcomeExamples.map((example) => <article key={example.caseId}><span className="brd-event-tag">{example.category}</span><h3>{example.title}</h3><p>{example.detail}</p><small className={`brd-event-relevance brd-event-relevance-${example.relevance.toLowerCase()}`}><span>{example.caseId}</span><button className="brd-text-button" onClick={() => onOpenTRT(example.caseId)}>Open case <ArrowUpRight size={12} /></button></small></article>)}</div>
      </section>
    </div>
  );
}

export function RecommendationPanel({ review, dispatch }: ReviewProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const selected = nextStepOptions.find((item) => item.id === review.option)!;
  const events = [...baseAuditEvents, ...review.events];

  function recordDecision() {
    if (!review.rationale.trim()) {
      setStatusMessage("Add analyst notes before recording this decision.");
      return;
    }
    dispatch({ type: "recordDecision" });
    setStatusMessage("");
  }

  async function copySummary() {
    const text = buildUdtSummary(review);
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }
    setStatusMessage(copied ? "Summary copied. Nothing was submitted." : "Copy was blocked by the browser. Select the analyst notes and copy them manually.");
    if (copied) dispatch({ type: "log", event: "UDT summary copied", detail: "text only; nothing submitted" });
  }

  return (
    <div className="brd-panel-stack">
      <div className="brd-page-heading"><div><p className="brd-eyebrow">INVESTIGATION / HUMAN DECISION</p><h2>Recommendation</h2><p>Review the proposed action and record an analyst decision.</p></div><span className="brd-data-badge">Analyst approval required</span></div>
      <section className="brd-surface">
        <div className="brd-ai-context brd-section-top"><span>ADVISORY ONLY</span><p>These are advisory options. The assistant does not block, whitelist, create UDT requests, change rules or contact customers; authorised teams carry out any action through existing processes (BR-12, BR-26).</p></div>
      </section>
      <section className="brd-recommendation-card">
        <div className="brd-recommendation-top"><div><p className="brd-eyebrow">Primary recommendation</p><h2>{recommendation.action}</h2></div><strong>{recommendation.evidenceStrength}<small>evidence strength</small></strong></div>
        <div className="brd-supporting-evidence"><span>Supporting evidence</span><ul>{signals.filter((signal) => signal.state === "Detected").map((signal) => <li key={signal.title}><Check size={15} />{signal.title}</li>)}</ul></div>
        <div className="brd-uncertainty"><span>Uncertainty to resolve · {dataGaps.length} data gaps</span>{dataGaps.map((item) => <p key={item}><AlertTriangle size={15} aria-hidden="true" />{item}</p>)}</div>
      </section>
      <section className="brd-surface brd-udt-card">
        <div className="brd-udt-icon"><FileCheck2 size={18} /></div>
        <div><p className="brd-eyebrow">UDT request summary</p><h3>Prepared for the analyst, not submitted</h3><p>Historical incident {historicalCases[0].id} showed similar behaviour and ended with: {historicalCases[0].action.toLowerCase()}.</p></div>
        <span className="brd-udt-similarity">{historicalCases[0].similarity}%<small>Historical similarity</small></span>
        <div className="brd-thresholds">
          <div><span>Suggested scope</span><strong>{recommendation.udtScope}</strong></div>
          <ArrowUpRight size={18} aria-hidden="true" />
          <div><span>Duration</span><strong>{recommendation.udtDuration} <small>raised by the analyst through BEARS</small></strong></div>
        </div>
      </section>
      <section className="brd-surface brd-decision-panel">
        <div className="brd-section-heading"><div><h2>Decision Controls</h2><p>Changes are saved locally and require analyst review.</p></div></div>
        <OptionGroup label="Suggested next steps" name="next-step" options={nextStepOptions.map((option) => ({ id: option.id, label: <>{option.title} <em className="brd-option-tag">{option.label}</em></> }))} isSelected={(id) => review.option === id} onSelect={(id) => dispatch({ type: "selectOption", option: id })} />
        <div className="brd-uncertainty brd-option-detail"><span>SELECTED NEXT STEP</span><p><Info size={15} aria-hidden="true" />{selected.body}</p><p><ArrowRight size={15} aria-hidden="true" /><b>Outside the assistant:</b>&nbsp;{selected.outside}</p></div>
        <OptionGroup label="The assistant's assessment" name="analyst-verdict" options={verdicts} isSelected={(id) => review.verdict === id} onSelect={(id) => dispatch({ type: "setVerdict", verdict: id })} />
        <label className="brd-notes-field"><span>Analyst Notes</span><textarea value={review.rationale} onChange={(event) => dispatch({ type: "setRationale", rationale: event.target.value })} rows={4} placeholder="Document evidence reviewed and rationale for your decision..." /><small className="brd-field-hint">Draft from the assistant; edit as needed.</small></label>
        <OptionGroup label="Was this assessment useful? (BR-17)" name="usefulness" options={usefulnessOptions} isSelected={(id) => review.useful === id} onSelect={(id) => dispatch({ type: "setUseful", useful: id })} />
        <OptionGroup label="What needed correcting? (leave empty if nothing)" name="corrections" multiple options={fixAreas} isSelected={(id) => review.fixes.includes(id)} onSelect={(id) => dispatch({ type: "toggleFix", fix: id })} />
        {statusMessage && <p className="brd-form-status" role="status">{statusMessage}</p>}
        {review.recordedAt && <p className="brd-form-status brd-form-success" role="status">Decision recorded in the PoC evaluation log at {review.recordedAt} UTC. No production action was taken. See the audit trail below.</p>}
        <div className="brd-form-actions brd-form-actions-row"><button className="brd-button brd-button-outline" onClick={copySummary}><Copy size={15} />Copy summary for UDT request</button><button className="brd-button brd-button-primary" onClick={recordDecision}>Record Decision <Check size={15} /></button></div>
      </section>
      <section className="brd-surface" aria-labelledby="audit-heading">
        <div className="brd-section-heading"><div><h2 id="audit-heading">Audit Trail</h2><p>Every input, assistant output and analyst action for {MAIN_CASE_ID}, in order (BR-14). Session times use the demo clock (UTC).</p></div><button className="brd-button brd-button-outline" onClick={() => downloadText(`${MAIN_CASE_ID}-audit-record.json`, buildAuditRecord(review, baseAuditEvents), "application/json")}><Download size={15} />Export audit record</button></div>
        <div className="brd-table-scroll"><table className="brd-table" aria-label="Audit trail"><thead><tr><th>Time (UTC)</th><th>Event</th><th>Detail</th><th>Actor</th></tr></thead><tbody>{events.map((event, index) => <tr key={`${event.time}-${index}`}><td className="brd-id">{event.time}</td><td><strong>{event.event}</strong></td><td>{event.detail}</td><td>{event.actor}</td></tr>)}{!review.recordedAt && <tr><td className="brd-id">—</td><td><strong>Analyst decision</strong></td><td>Pending</td><td>Alex Morgan</td></tr>}</tbody></table></div>
        <p className="brd-table-note">No production action was executed by the assistant. Any UDT request is raised and tracked in the existing TRT tracker; tracker integration is an open scope decision (BR-25).</p>
      </section>
      <div className="brd-evidence-lower">
        <section className="brd-surface"><div className="brd-section-heading"><div><h2>Run Context</h2><p>What this assessment ran on</p></div></div><div className="brd-snapshot-grid">{runContext.map((row) => <div key={row.label}><span>{row.label}</span><strong>{row.value}</strong></div>)}</div></section>
        <section className="brd-surface"><div className="brd-section-heading"><div><h2>SME Benchmark Comparison</h2><p>Mastercard's manual assessment of the same case (A5); synthetic label here (BR-29)</p></div></div><div className="brd-table-scroll"><table className="brd-table" aria-label="SME benchmark comparison"><thead><tr><th>Item</th><th>SME Benchmark</th><th>Assistant</th><th>Result</th></tr></thead><tbody>{smeBenchmark.map((row) => <tr key={row.item}><td><strong>{row.item}</strong></td><td>{row.sme}</td><td>{row.assistant}</td><td className="brd-found">{row.result}</td></tr>)}</tbody></table></div></section>
      </div>
      <section className="brd-surface">
        <div className="brd-section-heading"><div><h2>PoC Evaluation Scorecard</h2><p>Filled in during the validation phase. Targets and the pass threshold are open decisions for Mastercard (G-17, G-18).</p></div></div>
        <div className="brd-metrics brd-section-bottom" aria-label="PoC evaluation scorecard">{scorecard.map((item) => <article className="brd-metric brd-tone-slate" key={item.label}><span>{item.label}</span><strong>{item.value}</strong></article>)}</div>
      </section>
    </div>
  );
}
