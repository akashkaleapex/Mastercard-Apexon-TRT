import { Fragment, useState } from "react";
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
import { Activity, AlertTriangle, ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, BadgeCheck, Check, CircleAlert, Columns3, Download, FileCheck2, Search, ShieldAlert, Target, UserRound } from "lucide-react";
import {
  dashboardMetrics,
  externalEvents,
  fraudIndicators,
  historicalCases,
  merchantDistribution,
  patternDistribution,
  recommendation,
  timelineEvents,
  transactionCountries,
  transactionRows,
  trtCases,
  trtTrend,
  type Transaction,
  type HistoricalCase,
  type TRTCase,
} from "@/features/brd/data";

export function TRTDashboard({ onQueue, onOpenTRT }: { onQueue: () => void; onOpenTRT: (id: string) => void }) {
  return (
    <div className="brd-page">
      <div className="brd-page-heading">
        <div><p className="brd-eyebrow">SAFETYNET OPERATIONS</p><h1>TRT Dashboard</h1><p>Operational overview for active transaction risk tickets.</p></div>
        <button className="brd-button brd-button-primary" onClick={onQueue}>Open TRT Queue <ArrowUpRight size={15} /></button>
      </div>
      <section className="brd-metrics" aria-label="TRT metrics">
        {dashboardMetrics.map((metric) => <article className={`brd-metric brd-tone-${metric.tone}`} key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}
      </section>
      <div className="brd-chart-grid">
        <section className="brd-surface brd-chart-surface">
          <div className="brd-section-heading"><div><h2>TRT Trend</h2><p>Last 7 days</p></div><span className="brd-chart-note">TRTs created</span></div>
          <div className="brd-line-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trtTrend} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}><CartesianGrid stroke="#dce0e7" strokeDasharray="3 4" vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#5e6779", fontSize: 12 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#5e6779", fontSize: 12 }} /><Tooltip /><Area type="monotone" dataKey="count" stroke="#2b4fa8" strokeWidth={2} fill="#2b4fa8" fillOpacity={0.1} /></AreaChart></ResponsiveContainer></div>
        </section>
        <section className="brd-surface brd-chart-surface">
          <div className="brd-section-heading"><div><h2>Pattern Distribution</h2><p>Active TRT mix</p></div></div>
          <div className="brd-pattern-chart"><div className="brd-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={patternDistribution} dataKey="share" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={3} stroke="none">{patternDistribution.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => [`${value}%`, "TRT mix"]} /></PieChart></ResponsiveContainer><div className="brd-donut-label"><strong>27</strong><small>active</small></div></div><ul className="brd-legend">{patternDistribution.map((item) => <li key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><b>{item.share}%</b></li>)}</ul></div>
        </section>
      </div>
      <section className="brd-surface brd-dashboard-table">
        <div className="brd-section-heading"><div><h2>High Risk TRTs</h2><p>Cases that need analyst attention</p></div><button className="brd-text-button" onClick={onQueue}>View queue <ArrowUpRight size={14} /></button></div>
        <div className="brd-table-scroll"><table className="brd-table"><thead><tr><th>TRT ID</th><th>Pattern</th><th>ICA</th><th>Country</th><th>Status</th><th>Confidence</th><th /></tr></thead><tbody>{trtCases.map((item) => <tr key={item.id} onClick={() => onOpenTRT(item.id)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onOpenTRT(item.id); }}><td className="brd-id">{item.id}</td><td>{item.pattern}</td><td>{item.ica}</td><td>{item.country}</td><td><span className={`brd-status brd-status-${item.priority.toLowerCase()}`}>{item.status}</span></td><td><strong>{item.confidence}%</strong></td><td><ArrowUpRight size={15} /></td></tr>)}</tbody></table></div>
      </section>
      <section className="brd-surface brd-timeline-surface">
        <div className="brd-section-heading"><div><h2>Recent TRT Activity</h2><p>TRT-2026-7821 · Investigation timeline</p></div><span className="brd-live-indicator"><i aria-hidden="true" />Live</span></div>
        <ol className="brd-timeline">{timelineEvents.map((event) => <li key={event.time}><time>{event.time}</time><i /><div><strong>{event.title}</strong><span>{event.detail}</span></div></li>)}</ol>
        <button className="brd-button brd-button-outline" onClick={() => onOpenTRT("TRT-2026-7821")}>View High Priority TRT <ArrowUpRight size={15} /></button>
      </section>
    </div>
  );
}

export function TRTQueue({ onOpenTRT }: { onOpenTRT: (id: string) => void }) {
  const [pattern, setPattern] = useState("All patterns");
  const [status, setStatus] = useState("All statuses");
  const [ica, setIca] = useState("");
  const [country, setCountry] = useState("All countries");
  const [confidence, setConfidence] = useState("Any confidence");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const rows = trtCases.filter((item) =>
    (pattern === "All patterns" || item.pattern === pattern) &&
    (status === "All statuses" || item.status === status) &&
    item.ica.toLowerCase().includes(ica.toLowerCase()) &&
    (country === "All countries" || item.country === country) &&
    (!createdFrom || item.createdAt.slice(0, 10) >= createdFrom) &&
    (!createdTo || item.createdAt.slice(0, 10) <= createdTo) &&
    (confidence === "Any confidence" || item.confidence >= Number(confidence)),
  );

  return (
    <div className="brd-page">
      <div className="brd-page-heading"><div><p className="brd-eyebrow">SAFETYNET OPERATIONS / INTAKE</p><h1>TRT Queue</h1><p>Filter active tickets and open an investigation workspace.</p></div><span className="brd-result-count">{rows.length} of {trtCases.length} cases</span></div>
      <section className="brd-surface brd-queue-surface">
        <div className="brd-filter-bar">
          <label className="brd-search"><Search size={16} /><input value={ica} onChange={(event) => setIca(event.target.value)} placeholder="Search ICA..." aria-label="ICA Search" /></label>
          <label className="brd-filter"><span>Pattern</span><select value={pattern} onChange={(event) => setPattern(event.target.value)}><option>All patterns</option>{[...new Set(trtCases.map((item) => item.pattern))].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="brd-filter"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{[...new Set(trtCases.map((item) => item.status))].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="brd-filter"><span>Country</span><select value={country} onChange={(event) => setCountry(event.target.value)}><option>All countries</option>{[...new Set(trtCases.map((item) => item.country))].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="brd-filter"><span>From</span><input type="date" aria-label="Created from" value={createdFrom} onChange={(event) => setCreatedFrom(event.target.value)} /></label>
          <label className="brd-filter"><span>To</span><input type="date" aria-label="Created to" value={createdTo} onChange={(event) => setCreatedTo(event.target.value)} /></label>
          <label className="brd-filter"><span>Confidence</span><select value={confidence} onChange={(event) => setConfidence(event.target.value)}><option>Any confidence</option><option value="90">90% and above</option><option value="85">85% and above</option><option value="80">80% and above</option></select></label>
        </div>
        <div className="brd-table-scroll"><table className="brd-table"><thead><tr><th>TRT ID</th><th>Pattern</th><th>ICA</th><th>CID</th><th>Country</th><th>Channel</th><th>Status</th><th>Confidence</th><th>Created Date</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id} onClick={() => onOpenTRT(item.id)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onOpenTRT(item.id); }}><td className="brd-id">{item.id}</td><td>{item.pattern}</td><td>{item.ica}</td><td>{item.cid}</td><td>{item.country}</td><td>{item.channel}</td><td><span className={`brd-status brd-status-${item.priority.toLowerCase()}`}>{item.status}</span></td><td>{item.confidence}%</td><td>{item.created}</td></tr>)}</tbody></table>{rows.length === 0 && <p className="brd-empty">No cases match these filters.</p>}</div>
      </section>
    </div>
  );
}

export function TRTHeader({ incident }: { incident: TRTCase }) {
  return (
    <header className="brd-trt-header">
      <div className="brd-trt-heading"><div><p className="brd-eyebrow">TRT INVESTIGATION WORKSPACE</p><h1>{incident.id}</h1></div><span className="brd-status brd-status-critical">Fraud Suspected</span></div>
      <dl className="brd-case-facts"><div><dt>Pattern</dt><dd>{incident.pattern}</dd></div><div><dt>Confidence</dt><dd className="brd-confidence">{incident.confidence}%</dd></div><div><dt>ICA</dt><dd>{incident.ica}</dd></div><div><dt>CID</dt><dd>{incident.cid}</dd></div><div><dt>Country</dt><dd>{incident.country}</dd></div><div><dt>Channel</dt><dd>{incident.channel}</dd></div><div><dt>Trigger Time</dt><dd>29-Oct-2026 11:15 UTC</dd></div></dl>
    </header>
  );
}

export function InvestigationSummaryCard() {
  return (
    <section className="brd-summary-card">
      <div className="brd-summary-icon"><ShieldAlert size={20} /></div>
      <div className="brd-summary-content"><p className="brd-eyebrow">AI INVESTIGATION SUMMARY</p><h2>Likely Fraudulent BIN Attack</h2><p>Velocity and cryptogram signals support review. Merchant concentration is not yet confirmed: the signal claim and displayed totals do not agree.</p><ul>{["Velocity spike reported", "PAN concentration reported", "Repeated cryptographic values in sample", "Merchant share needs validation"].map((reason) => <li key={reason}><Check size={14} />{reason}</li>)}</ul></div>
      <div className="brd-risk-score"><span>AI CONFIDENCE</span><strong>94<small>%</small></strong><em>Critical risk</em></div>
    </section>
  );
}

export function SignalCards() {
  const signals = [
    { title: "Crypto Replay", detail: "Repeated cryptographic values across transactions", state: "Detected", icon: ShieldAlert },
    { title: "PAN Concentration", detail: "51 PANs responsible for 67% of traffic", state: "Detected", icon: CircleAlert },
    { title: "Merchant Share Mismatch", detail: "82% signal claim vs 36.6% in displayed totals", state: "Needs Validation", icon: AlertTriangle },
    { title: "Velocity Spike", detail: "380% increase over baseline", state: "Detected", icon: ArrowUp },
    { title: "Geo Anomaly", detail: "No material deviation from expected geography", state: "Not Detected", icon: Check },
  ];
  return <section className="brd-signal-grid" aria-label="Key fraud signals">{signals.map(({ title, detail, state, icon: Icon }) => <article className={`brd-signal-card${state === "Detected" ? " brd-signal-alert" : state === "Needs Validation" ? " brd-signal-warning" : ""}`} key={title}><span className="brd-signal-icon"><Icon size={16} /></span><div><strong>{title}</strong><p>{detail}</p><small>{state}</small></div></article>)}</section>;
}

export function OverviewPanel({ incident }: { incident: TRTCase }) {
  const trace = [
    { label: "FACT", value: "145,231 transactions", detail: "71% originated in India", icon: FileCheck2 },
    { label: "EVIDENCE", value: "4 signals corroborate", detail: "Crypto, PAN, merchant, velocity", icon: Activity },
    { label: "INTERPRETATION", value: "BIN Attack", detail: `${incident.confidence}% model confidence`, icon: ShieldAlert },
    { label: "RECOMMENDATION", value: "Continue blocking", detail: "Control remains in place", icon: ArrowRight },
    { label: "HUMAN DECISION", value: "Awaiting analyst", detail: "Review and record rationale", icon: UserRound },
  ];
  return <div className="brd-panel-stack"><InvestigationSummaryCard /><section className="brd-evidence-chain" aria-label="Evidence to decision trace">{trace.map(({ label, value, detail, icon: Icon }) => <article key={label} data-stage={label.toLowerCase()}><span className="brd-chain-icon"><Icon size={16} /></span><div><small>{label}</small><strong>{value}</strong><span>{detail}</span></div></article>)}</section><SignalCards /><section className="brd-surface brd-overview-note"><div className="brd-section-heading"><div><h2>Investigation Snapshot</h2><p>Analyst review is required before any operational change.</p></div><span className="brd-status brd-status-critical">Critical</span></div><div className="brd-snapshot-grid"><div><span>Current disposition</span><strong>{incident.status}</strong></div><div><span>Pattern family</span><strong>{incident.pattern}</strong></div><div><span>Evidence window</span><strong>29 Oct 2026 · 00:00–14:00 UTC</strong></div><div><span>Decision owner</span><strong>Alex Morgan · SafetyNet Analyst</strong></div></div></section></div>;
}

const tableColumns: { key: keyof Transaction; label: string }[] = [
  { key: "timestamp", label: "Timestamp" }, { key: "merchant", label: "Merchant" }, { key: "amount", label: "Amount" },
  { key: "pan", label: "PAN" }, { key: "country", label: "Country" }, { key: "issuer", label: "Issuer" },
  { key: "acquirer", label: "Acquirer" }, { key: "adc", label: "ADC Indicator" }, { key: "cryptogram", label: "Cryptogram" },
];
type TransactionFilterKey = "merchant" | "country" | "issuer" | "acquirer" | "adc";
const transactionFilterColumns: { key: TransactionFilterKey; label: string }[] = [
  { key: "merchant", label: "Merchant" }, { key: "country", label: "Country" }, { key: "issuer", label: "Issuer" },
  { key: "acquirer", label: "Acquirer" }, { key: "adc", label: "ADC" },
];

export function TransactionGrid() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<TransactionFilterKey, string>>({ merchant: "", country: "", issuer: "", acquirer: "", adc: "" });
  const [sortKey, setSortKey] = useState<keyof Transaction>("timestamp");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Transaction>>(() => new Set(tableColumns.map(({ key }) => key)));
  const [columnsOpen, setColumnsOpen] = useState(false);
  const pageSize = 10;
  const filtered = transactionRows.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(query.toLowerCase())) &&
    transactionFilterColumns.every(({ key }) => !filters[key] || row[key] === filters[key]),
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
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "TRT-2026-7821-transactions.csv";
    downloadLink.click();
    URL.revokeObjectURL(url);
  }

  function renderCell(row: Transaction, key: keyof Transaction) {
    if (key === "timestamp") return `${new Date(row.timestamp).toLocaleString("en-GB", { timeZone: "UTC", hour12: false })} UTC`;
    if (key === "amount") return `$${row.amount.toFixed(2)}`;
    if (key === "adc") return <span className={`brd-adc brd-adc-${row.adc.toLowerCase()}`}>{row.adc}</span>;
    return row[key];
  }

  return (
    <section className="brd-surface brd-transaction-panel">
      <div className="brd-section-heading"><div><h2>Raw Transaction Grid</h2><p>{filtered.length} of 50 masked transactions</p></div><span className="brd-data-badge">Synthetic data</span></div>
      <div className="brd-grid-controls">
        <label className="brd-search"><Search size={15} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search transactions..." aria-label="Search transactions" /></label>
        {transactionFilterColumns.map(({ key, label }) => <label className="brd-filter" key={key}><span>{label}</span><select aria-label={`Filter ${label}`} value={filters[key]} onChange={(event) => changeFilter(key, event.target.value)}><option value="">All</option>{[...new Set(transactionRows.map((row) => row[key]))].map((item) => <option key={item}>{item}</option>)}</select></label>)}
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
        {expandedTransaction === row.pan && <tr className="brd-transaction-detail"><td colSpan={visibleColumns.size}><div><strong>Sample record details</strong><span>Merchant: {row.merchant}</span><span>Time: {renderCell(row, "timestamp")}</span><span>Amount: {renderCell(row, "amount")}</span><span>Country: {row.country}</span><span>Issuer / acquirer: {row.issuer} / {row.acquirer}</span><span>ADC: {row.adc}</span><span>Cryptogram: {row.cryptogram}</span><small>Synthetic transaction sample; source-system event ID is not included.</small></div></td></tr>}
      </Fragment>)}</tbody></table>{visible.length === 0 && <p className="brd-empty">No transactions match these filters.</p>}</div>
      <div className="brd-pagination"><span>Showing <strong>{sorted.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, sorted.length)}</strong> of {sorted.length}</span><div><button aria-label="Previous transaction page" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>‹</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button className={pageNumber === page ? "brd-page-active" : ""} key={pageNumber} aria-label={`Transaction page ${pageNumber}`} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}<button aria-label="Next transaction page" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>›</button></div></div>
    </section>
  );
}

export function EvidencePanel() {
  return (
    <div className="brd-panel-stack">
      <section className="brd-evidence-metrics">{[{ label: "Transactions Reviewed", value: "145,231" }, { label: "SafetyNet Declined", value: "118,721" }, { label: "Issuer Declined", value: "15,948" }, { label: "Approved", value: "10,562" }].map((item, index) => <article className={`brd-surface brd-evidence-metric brd-evidence-metric-${index}`} key={item.label}><span>{item.label}</span><strong>{item.value}</strong></article>)}</section>
      <div className="brd-chart-grid brd-evidence-charts">
        <section className="brd-surface brd-chart-surface"><div className="brd-section-heading"><div><h2>Transaction Volume Trend</h2><p>Transactions per 30-minute interval · UTC</p></div><span className="brd-spike-label">↑ 380% spike</span></div><div className="brd-line-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={[{ time: "08:00", transactions: 7400 }, { time: "09:00", transactions: 11800 }, { time: "10:00", transactions: 24900 }, { time: "10:30", transactions: 38800 }, { time: "11:00", transactions: 32400 }, { time: "11:30", transactions: 18600 }, { time: "12:00", transactions: 9900 }]} margin={{ top: 12, right: 12, left: -14, bottom: 0 }}><CartesianGrid stroke="#dce0e7" strokeDasharray="3 4" vertical={false} /><XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#5e6779", fontSize: 12 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#5e6779", fontSize: 12 }} tickFormatter={(value: number) => `${value / 1000}k`} /><Tooltip formatter={(value) => [Number(value).toLocaleString(), "Transactions"]} /><Area type="monotone" dataKey="transactions" stroke="#2b4fa8" strokeWidth={2} fill="#2b4fa8" fillOpacity={0.1} /></AreaChart></ResponsiveContainer></div></section>
        <section className="brd-surface brd-chart-surface"><div className="brd-section-heading"><div><h2>Country Distribution</h2><p>Share of transactions</p></div></div><div className="brd-pattern-chart"><div className="brd-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={transactionCountries} dataKey="share" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={3} stroke="none">{transactionCountries.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => [`${value}%`, "Transactions"]} /></PieChart></ResponsiveContainer><div className="brd-donut-label"><strong>145k</strong><small>reviewed</small></div></div><ul className="brd-legend">{transactionCountries.map((item) => <li key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><b>{item.share}%</b></li>)}</ul></div></section>
      </div>
      <div className="brd-evidence-lower">
        <section className="brd-surface"><div className="brd-section-heading"><div><h2>Top Merchants</h2><p>Transaction concentration by merchant</p></div></div><div className="brd-merchant-table">{merchantDistribution.map((item, index) => <div key={item.merchant}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.merchant}</strong><div><i style={{ width: `${item.share * 2.4}%` }} /></div><b>{item.count.toLocaleString()}</b><small>{item.share}%</small></div>)}</div></section>
        <section className="brd-surface"><div className="brd-section-heading"><div><h2>Fraud Indicators</h2><p>Pattern checks across this incident</p></div></div><div className="brd-table-scroll"><table className="brd-table brd-indicator-table"><thead><tr><th>Signal</th><th>Severity</th><th>Status</th></tr></thead><tbody>{fraudIndicators.map((item) => <tr key={item.signal}><td>{item.signal}</td><td><span className={`brd-severity brd-severity-${item.severity.toLowerCase()}`}>{item.severity}</span></td><td className={item.status === "Found" ? "brd-found" : "brd-not-found"}>{item.status}</td></tr>)}</tbody></table></div></section>
      </div>
      <TransactionGrid />
    </div>
  );
}

export function HistoricalCasesPanel() {
  const bestCase = historicalCases[0];
  return (
    <div className="brd-panel-stack">
      <div className="brd-page-heading"><div><p className="brd-eyebrow">INVESTIGATION / HISTORICAL REASONING</p><h2>Historical Context</h2><p>Compare prior evidence, analyst outcomes, and operational lessons.</p></div><span className="brd-context-pill"><Target size={14} /> BIN Attack · 3 matched cases</span></div>
      <div className="brd-history-layout">
        <section className="brd-surface brd-case-comparisons">
          <div className="brd-section-heading"><div><h2>Case Comparisons</h2><p>Similarity is based on observed behavior and merchant context</p></div></div>
          <div className="brd-case-comparison-grid">
            {historicalCases.map((item: HistoricalCase, index) => <article className={`brd-case-comparison${index === 0 ? " brd-case-comparison-best" : ""}`} key={item.id}>
              <header><span className="brd-case-pattern"><Target size={14} />{item.pattern}</span>{index === 0 && <span className="brd-best-label">Closest match</span>}</header>
              <div className="brd-case-identity"><strong>{item.id}</strong><span>{item.merchant}</span></div>
              <div className="brd-case-match"><div><span>Pattern similarity</span><strong>{item.similarity}%</strong></div><div className="brd-case-match-track"><i style={{ width: `${item.similarity}%` }} /></div></div>
              <div className="brd-case-outcome"><span>Prior outcome</span><strong><BadgeCheck size={15} />{item.outcome}</strong></div>
              <div className="brd-case-decision"><span>Decision</span><strong>{item.action}</strong></div>
              <div className="brd-case-lesson"><span><Check size={13} />Lesson learned</span><p>{item.lesson}</p></div>
            </article>)}
          </div>
        </section>
        <aside className="brd-best-match"><p className="brd-eyebrow">Most similar incident</p><strong className="brd-match-score">{bestCase.similarity}<small>%</small></strong><span>{bestCase.id}</span><dl><div><dt>Merchant</dt><dd>{bestCase.merchant}</dd></div><div><dt>Outcome</dt><dd>{bestCase.outcome}</dd></div><div><dt>Action</dt><dd>{bestCase.action}</dd></div></dl><div className="brd-match-takeaway"><span>Relevance to this TRT</span><p>Historical match supports further analyst review; it does not independently justify changing the current control.</p></div></aside>
      </div>
      <section className="brd-surface brd-events-panel">
        <div className="brd-section-heading"><div><h2>External Context</h2><p>Public activity that may explain legitimate volume</p></div><span className="brd-data-badge">Context signals</span></div>
        <div className="brd-events-grid">{externalEvents.map((event) => <article key={event.title}><span className="brd-event-tag">{event.category}</span><h3>{event.title}</h3><p>{event.detail}</p><small className={`brd-event-relevance brd-event-relevance-${event.relevance.toLowerCase()}`}><span>Relevance</span><strong>{event.relevance}</strong></small></article>)}</div>
        <div className="brd-ai-context"><span>AI context summary</span><p>Current behavior may be related to external business activity. These events could explain part of the traffic, but do not account for repeated cryptographic values and concentrated PAN activity.</p></div>
      </section>
    </div>
  );
}

export function RecommendationPanel() {
  const [selectedDecision, setSelectedDecision] = useState("");
  const [notes, setNotes] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  function recordDecision() {
    if (!selectedDecision) {
      setStatusMessage("Select a decision before recording.");
      return;
    }
    setStatusMessage(notes.trim() ? `${selectedDecision} recorded in the POC workspace.` : "Add analyst notes before recording this decision.");
  }

  return (
    <div className="brd-panel-stack">
      <div className="brd-page-heading"><div><p className="brd-eyebrow">INVESTIGATION / HUMAN DECISION</p><h2>Recommendation</h2><p>Review the proposed action and record an analyst decision.</p></div><span className="brd-data-badge">Analyst approval required</span></div>
      <section className="brd-recommendation-card">
        <div className="brd-recommendation-top"><div><p className="brd-eyebrow">Primary recommendation</p><h2>{recommendation.action}</h2></div><strong>{recommendation.confidence}%<small>confidence</small></strong></div>
        <div className="brd-supporting-evidence"><span>Supporting evidence</span><ul>{recommendation.supportingEvidence.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></div>
        <div className="brd-uncertainty"><span>Uncertainty to resolve</span>{recommendation.uncertainties.map((item) => <p key={item}><AlertTriangle size={15} aria-hidden="true" />{item}</p>)}</div>
      </section>
      <section className="brd-surface brd-udt-card">
        <div className="brd-udt-icon"><FileCheck2 size={18} /></div>
        <div><p className="brd-eyebrow">UDT recommendation</p><h3>Temporary threshold adjustment</h3><p>{recommendation.reason}</p></div>
        <span className="brd-udt-similarity">{recommendation.similarity}%<small>Historical similarity</small></span>
        <div className="brd-thresholds">
          <div><span>Current threshold</span><strong>{recommendation.currentThreshold.toLocaleString()} <small>transactions/hour</small></strong></div>
          <ArrowUpRight size={18} aria-hidden="true" />
          <div><span>Suggested threshold</span><strong>{recommendation.suggestedThreshold.toLocaleString()} <small>transactions/hour</small></strong></div>
        </div>
      </section>
      <section className="brd-surface brd-decision-panel"><div className="brd-section-heading"><div><h2>Decision Controls</h2><p>Changes are saved locally and require analyst review.</p></div></div><div className="brd-decision-actions" role="radiogroup" aria-label="Analyst decision">{recommendation.decisions.map((decision) => <label className={`brd-decision-option${selectedDecision === decision ? " brd-decision-selected" : ""}`} key={decision}><input type="radio" name="analyst-decision" value={decision} checked={selectedDecision === decision} onChange={() => { setSelectedDecision(decision); setStatusMessage(""); }} /><span className="brd-decision-radio" aria-hidden="true">{selectedDecision === decision && <Check size={13} strokeWidth={2.5} />}</span><span className="brd-decision-option-label">{decision}</span></label>)}</div><label className="brd-notes-field"><span>Analyst Notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Document evidence reviewed and rationale for your decision..." /></label>{statusMessage && <p className="brd-form-status" role="status">{statusMessage}</p>}<div className="brd-form-actions"><button className="brd-button brd-button-primary" onClick={recordDecision}>Record Decision <Check size={15} /></button></div></section>
    </div>
  );
}