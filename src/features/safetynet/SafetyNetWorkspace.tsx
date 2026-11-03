import {
  Activity,
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  Clock3,
  Download,
  FileCheck2,
  Filter,
  LayoutDashboard,
  ListChecks,
  Menu,
  MessageSquareText,
  Search,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

type Incident = {
  id: string;
  pattern: string;
  ica: string;
  cid: string;
  country: string;
  channel: string;
  created: string;
  status: string;
  priority: string;
  confidence: number;
};

const incidentSeed: Incident[] = [
  { id: "TRT-2026-7821", pattern: "BIN Attack", ica: "Citibank India", cid: "Citibank Global", country: "India", channel: "POS", created: "2026-10-29 11:15", status: "Review Required", priority: "Critical", confidence: 94 },
  { id: "TRT-2026-7822", pattern: "ASI Attack", ica: "Citibank US", cid: "Citibank Global", country: "USA", channel: "CNP", created: "2026-10-29 10:48", status: "Investigating", priority: "High", confidence: 88 },
  { id: "TRT-2026-7823", pattern: "Merchant Attack", ica: "HSBC UK", cid: "HSBC Global", country: "UK", channel: "CNP", created: "2026-10-29 10:21", status: "Pending Validation", priority: "Medium", confidence: 80 },
  { id: "TRT-2026-7824", pattern: "BIN Attack", ica: "ANZ Australia", cid: "ANZ Global", country: "Australia", channel: "POS", created: "2026-10-29 09:56", status: "Open", priority: "High", confidence: 91 },
  { id: "TRT-2026-7825", pattern: "Enumeration Attack", ica: "Standard Bank SA", cid: "Standard Bank Global", country: "South Africa", channel: "ATM", created: "2026-10-29 09:38", status: "Open", priority: "Medium", confidence: 82 },
  { id: "TRT-2026-7826", pattern: "Velocity Attack", ica: "Citibank India", cid: "Citibank Global", country: "India", channel: "CNP", created: "2026-10-29 09:12", status: "Awaiting Approval", priority: "High", confidence: 89 },
  { id: "TRT-2026-7827", pattern: "ASI Attack", ica: "HSBC UK", cid: "HSBC Global", country: "UK", channel: "ATM", created: "2026-10-29 08:54", status: "Investigating", priority: "Medium", confidence: 77 },
  { id: "TRT-2026-7828", pattern: "Merchant Attack", ica: "Citibank US", cid: "Citibank Global", country: "USA", channel: "Funding", created: "2026-10-29 08:30", status: "Open", priority: "High", confidence: 86 },
  { id: "TRT-2026-7829", pattern: "BIN Attack", ica: "ANZ Australia", cid: "ANZ Global", country: "Australia", channel: "CNP", created: "2026-10-29 08:12", status: "Pending Validation", priority: "Medium", confidence: 83 },
  { id: "TRT-2026-7830", pattern: "Enumeration Attack", ica: "Citibank India", cid: "Citibank Global", country: "India", channel: "POS", created: "2026-10-29 07:46", status: "Open", priority: "Critical", confidence: 93 },
  { id: "TRT-2026-7831", pattern: "Velocity Attack", ica: "HSBC UK", cid: "HSBC Global", country: "UK", channel: "Refund", created: "2026-10-29 07:23", status: "Investigating", priority: "High", confidence: 87 },
  { id: "TRT-2026-7832", pattern: "ASI Attack", ica: "Standard Bank SA", cid: "Standard Bank Global", country: "South Africa", channel: "ATM", created: "2026-10-29 06:58", status: "Open", priority: "Medium", confidence: 79 },
  { id: "TRT-2026-7833", pattern: "Merchant Attack", ica: "Citibank US", cid: "Citibank Global", country: "USA", channel: "CNP", created: "2026-10-29 06:31", status: "Awaiting Approval", priority: "High", confidence: 90 },
  { id: "TRT-2026-7834", pattern: "BIN Attack", ica: "Citibank India", cid: "Citibank Global", country: "India", channel: "Funding", created: "2026-10-29 06:09", status: "Review Required", priority: "Critical", confidence: 96 },
  { id: "TRT-2026-7835", pattern: "Velocity Attack", ica: "ANZ Australia", cid: "ANZ Global", country: "Australia", channel: "POS", created: "2026-10-29 05:45", status: "Closed", priority: "Low", confidence: 72 },
  { id: "TRT-2026-7836", pattern: "Enumeration Attack", ica: "HSBC UK", cid: "HSBC Global", country: "UK", channel: "CNP", created: "2026-10-29 05:18", status: "Open", priority: "Medium", confidence: 81 },
  { id: "TRT-2026-7837", pattern: "Merchant Attack", ica: "Standard Bank SA", cid: "Standard Bank Global", country: "South Africa", channel: "Refund", created: "2026-10-29 04:52", status: "Investigating", priority: "High", confidence: 85 },
  { id: "TRT-2026-7838", pattern: "ASI Attack", ica: "Citibank India", cid: "Citibank Global", country: "India", channel: "POS", created: "2026-10-29 04:26", status: "Pending Validation", priority: "Medium", confidence: 78 },
  { id: "TRT-2026-7839", pattern: "BIN Attack", ica: "Citibank US", cid: "Citibank Global", country: "USA", channel: "CNP", created: "2026-10-29 03:58", status: "Closed", priority: "Low", confidence: 74 },
  { id: "TRT-2026-7840", pattern: "Velocity Attack", ica: "HSBC UK", cid: "HSBC Global", country: "UK", channel: "ATM", created: "2026-10-29 03:31", status: "Open", priority: "Medium", confidence: 84 },
];

const transactions = Array.from({ length: 50 }, (_, index) => {
  const merchants = ["Ticketmaster", "Spotify", "Netflix", "Nike", "Amazon", "Walmart", "Flipkart", "Target"];
  const countries = ["India", "USA", "UK", "Singapore", "Australia", "Canada"];
  const acquirers = ["Worldpay", "Adyen", "Fiserv", "Checkout.com", "Stripe"];
  const issuers = ["Citibank India", "Citibank US", "HSBC UK", "ANZ Australia"];
  const cryptograms = ["A91C-7F2D", "B830-11CA", "A91C-7F2D", "C216-39B0", "A91C-7F2D"];
  return {
    pan: `414720••••••${String(1024 + index * 37).slice(-4)}`,
    merchant: merchants[index % merchants.length],
    amount: [89.99, 145, 249.5, 39.99, 512, 120][index % 6],
    country: countries[index % countries.length],
    acquirer: acquirers[index % acquirers.length],
    issuer: issuers[index % issuers.length],
    adc: index % 4 === 0 ? "Mismatch" : "Valid",
    cryptogram: cryptograms[index % cryptograms.length],
    time: `11:${String((index * 7) % 60).padStart(2, "0")}:${String((index * 13) % 60).padStart(2, "0")}`,
  };
});

const volumeData = [
  { time: "00:00", transactions: 3200 }, { time: "02:00", transactions: 2800 },
  { time: "04:00", transactions: 3400 }, { time: "06:00", transactions: 5100 },
  { time: "08:00", transactions: 7300 }, { time: "09:00", transactions: 11800 },
  { time: "10:00", transactions: 24900 }, { time: "10:30", transactions: 38800 },
  { time: "11:00", transactions: 32400 }, { time: "11:30", transactions: 18600 },
  { time: "12:00", transactions: 9900 }, { time: "14:00", transactions: 6800 },
];

const countryData = [
  { name: "India", value: 42, color: "#d84a24" }, { name: "USA", value: 24, color: "#273f39" },
  { name: "UK", value: 15, color: "#e9a43b" }, { name: "Singapore", value: 11, color: "#558578" },
  { name: "Australia", value: 8, color: "#a5b8aa" },
];

const channelData = [
  { name: "POS", share: 40, count: "58,092" },
  { name: "CNP", share: 33, count: "47,926" },
  { name: "ATM", share: 12, count: "17,428" },
  { name: "Funding", share: 9, count: "13,071" },
  { name: "Refund", share: 6, count: "8,714" },
];

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "TRT Queue", path: "/queue", icon: ListChecks },
  { label: "Investigation", path: "/investigation/TRT-2026-7821", icon: ShieldAlert },
  { label: "Historical Cases", path: "/history", icon: BriefcaseBusiness },
  { label: "Recommendations", path: "/recommendations", icon: ClipboardList },
];

const prompts = [
  "Why is this classified as BIN Attack?",
  "Show strongest fraud indicators",
  "Show similar incidents",
  "Summarize raw data",
  "Generate UDT recommendation",
  "Generate customer validation questions",
];

function statusClass(status: string) {
  if (["Critical", "Review Required", "Fraud Suspected"].includes(status)) return "status-critical";
  if (["High", "Investigating", "Awaiting Approval"].includes(status)) return "status-high";
  if (["Pending Validation", "Medium"].includes(status)) return "status-waiting";
  if (["Closed", "Approved", "Open"].includes(status)) return "status-positive";
  return "status-neutral";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="screen-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function StatusPill({ children }: { children: string }) {
  return <span className={`status-pill ${statusClass(children)}`}><i />{children}</span>;
}

function IncidentTable({ rows, onSelect }: { rows: Incident[]; onSelect: (id: string) => void }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr><th>TRT ID</th><th>Pattern</th><th>ICA</th><th>CID</th><th>Country</th><th>Channel</th><th>Created (UTC)</th><th>Status</th><th>Confidence</th><th /></tr></thead>
        <tbody>{rows.map((row) => (
          <tr key={row.id} onClick={() => onSelect(row.id)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onSelect(row.id); }}>
            <td><strong className="id-cell">{row.id}</strong></td><td>{row.pattern}</td><td>{row.ica}</td><td>{row.cid}</td><td>{row.country}</td><td>{row.channel}</td><td>{row.created}</td><td><StatusPill>{row.status}</StatusPill></td><td><span className="confidence-cell">{row.confidence}%</span></td><td><ArrowUpRight className="row-arrow" size={15} /></td>
          </tr>
        ))}</tbody>
      </table>
      {rows.length === 0 && <div className="empty-state">No TRTs match these filters.</div>}
    </div>
  );
}

export function SafetyNetWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const currentPath = pathname === "/" ? "/dashboard" : pathname;
  const page = currentPath.startsWith("/queue") ? "queue"
    : currentPath.startsWith("/investigation") ? "investigation"
      : currentPath.startsWith("/intelligence") ? "intelligence"
        : currentPath.startsWith("/history") ? "history"
          : currentPath.startsWith("/recommendations") ? "recommendations"
            : currentPath.startsWith("/udt") ? "udt" : "dashboard";
  const selectedIncidentId = currentPath.match(/^\/investigation\/([^/]+)/)?.[1];
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotAnswer, setCopilotAnswer] = useState("");
  const [selectedAction, setSelectedAction] = useState("Continue Blocking");
  const [analystDecision, setAnalystDecision] = useState("Approve");
  const [analystNotes, setAnalystNotes] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [udtStatus, setUdtStatus] = useState("");
  const activeIncident = incidentSeed.find((incident) => incident.id === selectedIncidentId) ?? incidentSeed[0];

  function askCopilot(question: string) {
    const q = question.toLowerCase();
    if (q.includes("similar")) {
      setCopilotAnswer("The closest match is TRT-2025-1234 (92% similarity), a BIN Attack involving a concentrated ticketing merchant. The case resulted in an increased threshold and a submitted UDT.");
    } else if (q.includes("raw") || q.includes("summar")) {
      setCopilotAnswer("Across 145,231 transactions, 118,721 were SafetyNet declined, 15,948 issuer declined, and 10,562 approved. Activity peaked at 10:30 UTC, with India contributing 42% of the observed volume.");
    } else if (q.includes("udt")) {
      setCopilotAnswer("A UDT threshold adjustment is available for analyst review. Suggested volume threshold: 4,000 transactions/hour, supported by a 89% similar-case match. No external rule change is submitted from this sandbox.");
    } else if (q.includes("question") || q.includes("validation")) {
      setCopilotAnswer("Suggested validation: Was a ticket or membership campaign active at the merchant? Were the affected card ranges expected to be used in India? Did the issuer change authentication or cryptogram handling during this window?");
    } else if (q.includes("indicator") || q.includes("fraud")) {
      setCopilotAnswer("Strongest indicators are repeated cryptogram values, PAN repetition, a 380% velocity increase over baseline, and concentration at a single merchant. Geographic anomaly was not detected.");
    } else {
      setCopilotAnswer("This is classified as a BIN Attack because transaction velocity exceeded the expected baseline by 380%, with repeated PAN activity, merchant concentration, and cryptogram reuse observed together. AI confidence is 94%; analyst review is required.");
    }
    setCopilotInput("");
  }

  function submitGlobalSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(`/queue?q=${encodeURIComponent(globalSearch.trim())}`);
    setMobileNavOpen(false);
  }

  function openIncident(id: string) {
    navigate(`/investigation/${id}`);
  }

  function submitRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionStatus(analystNotes.trim() ? `${analystDecision} recorded locally for ${activeIncident.id}.` : "Add analyst notes before submitting the investigation.");
  }

  const navigation = (
    <nav className="primary-nav" aria-label="Primary navigation">
      <span className="nav-caption">INVESTIGATIONS</span>
      {navItems.map(({ label, path, icon: Icon }) => {
        const active = path === "/dashboard" ? page === "dashboard"
          : path === "/queue" ? page === "queue"
            : path === "/investigation/TRT-2026-7821" ? ["investigation", "intelligence", "udt"].includes(page)
              : path === "/history" ? page === "history" : page === "recommendations";
        return <Link key={path} to={path} onClick={() => setMobileNavOpen(false)} className={`nav-link${active ? " nav-link-active" : ""}`}><Icon size={17} /><span>{label}</span>{label === "TRT Queue" && <b>27</b>}</Link>;
      })}
      <span className="nav-caption nav-caption-secondary">CURRENT TRT</span>
      <button className={`nav-link nav-link-sub${page === "intelligence" ? " nav-link-active" : ""}`} onClick={() => navigate("/intelligence/TRT-2026-7821")}><Activity size={17} /><span>Transaction intelligence</span></button>
      <button className={`nav-link nav-link-sub${page === "udt" ? " nav-link-active" : ""}`} onClick={() => navigate("/udt/TRT-2026-7821")}><FileCheck2 size={17} /><span>UDT assistant</span></button>
    </nav>
  );

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to content</a>
      {mobileNavOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`sidebar${mobileNavOpen ? " sidebar-open" : ""}`}>
        <Link className="brand" to="/dashboard">
          <span className="brand-mark"><Shield size={20} /><i /><i /></span>
          <span className="brand-copy"><small>MASTERCARD · APEXON</small><strong>SafetyNet TRT</strong><em>INVESTIGATION COPILOT</em></span>
        </Link>
        {navigation}
        <div className="sidebar-queue">
          <span className="queue-live-dot" />
          <div><strong>POC Sandbox</strong><small>Mock environment</small></div>
          <ChevronDown size={14} />
        </div>
        <div className="sidebar-profile"><span className="avatar avatar-small">AM</span><div><strong>Alex Morgan</strong><small>SafetyNet Analyst</small></div><ChevronDown size={14} /></div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={19} /></button>
          <div className="topbar-breadcrumb"><span>TRT OPERATIONS</span><ArrowRight size={13} /><strong>{page === "dashboard" ? "Command center" : page === "queue" ? "TRT queue" : page === "history" ? "Historical cases" : page === "udt" ? "UDT assistant" : page === "intelligence" ? "Transaction intelligence" : page === "recommendations" ? "Recommendations" : "Investigation workspace"}</strong></div>
          <form className="global-search" onSubmit={submitGlobalSearch}><Search size={16} /><input value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="Search TRT, ICA, merchant..." aria-label="Global search" /><kbd>↵</kbd></form>
          <span className="environment-badge"><i />POC Sandbox</span>
          <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
          <span className="avatar">AM</span>
        </header>

        <div className="content-layout">
          <main className="main-content" id="main-content" tabIndex={-1}>
            {page === "dashboard" && <DashboardScreen onSelect={openIncident} onQueue={() => navigate("/queue")} />}
            {page === "queue" && <QueueScreen initialSearch={new URLSearchParams(location.search).get("q") ?? ""} onSelect={openIncident} />}
            {page === "investigation" && <InvestigationScreen incident={activeIncident} onNavigate={navigate} onRecommendation={() => navigate("/recommendations/TRT-2026-7821")} />}
            {page === "intelligence" && <IntelligenceScreen />}
            {page === "history" && <HistoryScreen />}
            {page === "recommendations" && <RecommendationsScreen selectedAction={selectedAction} setSelectedAction={setSelectedAction} decision={analystDecision} setDecision={setAnalystDecision} notes={analystNotes} setNotes={setAnalystNotes} status={actionStatus} onSubmit={submitRecommendation} onUdt={() => navigate("/udt/TRT-2026-7821")} />}
            {page === "udt" && <UdtScreen status={udtStatus} setStatus={setUdtStatus} />}
          </main>
          <aside className={`copilot-panel${copilotOpen ? "" : " copilot-collapsed"}`} aria-label="AI Copilot panel">
            <div className="copilot-header"><div className="copilot-brand"><span className="copilot-icon"><Sparkles size={17} /></span><div><strong>AI Copilot</strong><small><i /> Context connected</small></div></div><button className="icon-button copilot-close" aria-label="Collapse Copilot panel" onClick={() => setCopilotOpen(false)}><X size={17} /></button></div>
            <div className="copilot-context"><span>ACTIVE INVESTIGATION</span><strong>TRT-2026-7821</strong><small>BIN Attack · Citibank India</small></div>
            {copilotAnswer ? <div className="copilot-answer"><div className="answer-title"><Bot size={15} /> Copilot response</div><p>{copilotAnswer}</p><small>Based on the current mock investigation data.</small></div> : <div className="copilot-welcome"><span className="copilot-spark"><Sparkles size={20} /></span><strong>Investigation Copilot</strong><p>Ask a question about this TRT. Responses use the current sandbox context.</p></div>}
            <div className="prompt-list"><span className="prompt-label">SUGGESTED PROMPTS</span>{prompts.map((prompt) => <button key={prompt} onClick={() => askCopilot(prompt)}>{prompt}<ArrowUpRight size={13} /></button>)}</div>
            <form className="copilot-composer" onSubmit={(event) => { event.preventDefault(); if (copilotInput.trim()) askCopilot(copilotInput); }}><input value={copilotInput} onChange={(event) => setCopilotInput(event.target.value)} placeholder="Ask about this investigation..." aria-label="Ask Copilot" /><button aria-label="Send question" type="submit"><Send size={15} /></button></form>
            <div className="copilot-disclaimer"><Shield size={13} /> AI-generated content. Analyst review required.</div>
          </aside>
        </div>
      </div>
      {!copilotOpen && <button className="copilot-reopen" onClick={() => setCopilotOpen(true)}><Sparkles size={16} /> AI Copilot</button>}
    </div>
  );
}

function DashboardScreen({ onSelect, onQueue }: { onSelect: (id: string) => void; onQueue: () => void }) {
  const kpis = [
    { label: "Open TRTs", value: "27", delta: "+4", tone: "red", icon: ClipboardList },
    { label: "High priority", value: "8", delta: "+2", tone: "amber", icon: CircleAlert },
    { label: "Awaiting analyst review", value: "5", delta: "2 due soon", tone: "blue", icon: Clock3 },
    { label: "Pending customer validation", value: "4", delta: "1 new", tone: "teal", icon: MessageSquareText },
    { label: "UDT actions pending", value: "3", delta: "1 approval", tone: "orange", icon: FileCheck2 },
    { label: "Closed today", value: "16", delta: "+18%", tone: "green", icon: BadgeCheck },
  ];
  return <section className="screen-page">
    <PageHeading eyebrow="TUESDAY, 03 NOVEMBER 2026 · OPERATIONS" title="TRT Command Center" description="Monitor active investigations and keep high-risk activity moving." action={<button className="button button-primary" onClick={onQueue}><Filter size={15} /> Review queue <ArrowRight size={15} /></button>} />
    <div className="kpi-grid">{kpis.map(({ label, value, delta, tone, icon: Icon }) => <article className="kpi-card" key={label}><div className={`kpi-icon kpi-${tone}`}><Icon size={17} /></div><span className="kpi-label">{label}</span><div className="kpi-bottom"><strong>{value}</strong><span className={tone === "red" || tone === "amber" ? "delta-alert" : "delta-neutral"}>{delta}</span></div></article>)}</div>
    <div className="dashboard-main-grid">
      <section className="surface recent-surface"><div className="surface-heading"><div><div className="heading-title-row"><h2>Recent TRTs</h2><span className="live-label"><i /> LIVE QUEUE</span></div><p>Highest priority incidents requiring attention</p></div><button className="text-action" onClick={onQueue}>View all <ArrowRight size={14} /></button></div><IncidentTable rows={incidentSeed.slice(0, 5)} onSelect={onSelect} /></section>
      <section className="critical-card"><div className="critical-top"><span className="critical-icon"><ShieldAlert size={18} /></span><span className="critical-label">CRITICAL INVESTIGATION ALERT</span><span className="pulse-dot" /></div><span className="critical-id">TRT-2026-7821</span><h2>Likely fraudulent<br />BIN Attack</h2><div className="critical-signals"><span><i />Crypto replay</span><span><i />Merchant concentration</span><span><i />Repeated PAN activity</span></div><div className="critical-footer"><div><small>AI CONFIDENCE</small><strong>94%</strong></div><button onClick={() => onSelect("TRT-2026-7821")}>Investigate <ArrowRight size={14} /></button></div><p className="critical-recommendation"><Shield size={14} /> Recommendation: Continue SafetyNet Blocking</p></section>
    </div>
    <section className="activity-strip"><div className="activity-heading"><span className="activity-icon"><Activity size={17} /></span><div><strong>Investigation activity</strong><small>Latest changes across your queue</small></div></div><div className="activity-event"><span className="activity-dot red-dot" /><span><b>TRT-2026-7834</b> flagged as critical</span><time>4 min ago</time></div><div className="activity-event"><span className="activity-dot green-dot" /><span><b>TRT-2026-7818</b> closed by M. Chen</span><time>18 min ago</time></div><div className="activity-event"><span className="activity-dot amber-dot" /><span>Customer validation received</span><time>36 min ago</time></div></section>
  </section>;
}

function QueueScreen({ initialSearch, onSelect }: { initialSearch: string; onSelect: (id: string) => void }) {
  const [search, setSearch] = useState(initialSearch);
  const [pattern, setPattern] = useState("All patterns");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState("newest");
  const [from, setFrom] = useState("2026-10-01");
  const [to, setTo] = useState("2026-10-31");
  const merchantNames = ["Ticketmaster", "Spotify", "Netflix", "Nike", "Amazon", "Walmart", "Flipkart", "Target"];
  const rows = incidentSeed.filter((item, index) => {
    const searchable = `${item.id} ${item.ica} ${item.cid} ${item.pattern} ${item.country} ${merchantNames[index % merchantNames.length]}`.toLowerCase();
    const matchesStatus = status === "All statuses" || item.status === status || (status === "Review Needed" && item.status === "Review Required");
    const incidentDate = item.created.slice(0, 10);
    return searchable.includes(search.toLowerCase()) &&
      (pattern === "All patterns" || item.pattern === pattern) && matchesStatus &&
      (!from || incidentDate >= from) && (!to || incidentDate <= to);
  }).sort((a, b) => sort === "confidence" ? b.confidence - a.confidence : sort === "priority" ? ["Critical", "High", "Medium", "Low"].indexOf(a.priority) - ["Critical", "High", "Medium", "Low"].indexOf(b.priority) : b.created.localeCompare(a.created));
  return <section className="screen-page"><PageHeading eyebrow="INVESTIGATIONS / INTAKE" title="TRT Queue" description="Search, filter, and triage active transaction review tickets." action={<span className="queue-count"><span>{rows.length}</span> of 20 TRTs</span>} />
    <section className="surface queue-surface"><div className="queue-toolbar"><label className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ICA, merchant, TRT ID..." /><kbd>⌘ K</kbd></label><label className="select-field"><span>Pattern</span><select value={pattern} onChange={(event) => setPattern(event.target.value)}><option>All patterns</option>{["BIN Attack", "ASI Attack", "Velocity Attack", "Merchant Attack", "Enumeration Attack"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="select-field"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{["Open", "Investigating", "Review Needed", "Review Required", "Pending Validation", "Awaiting Approval", "Closed"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="date-filter"><CalendarDays size={15} /><input type="date" aria-label="Created from" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label className="date-filter"><CalendarDays size={15} /><input type="date" aria-label="Created to" value={to} onChange={(event) => setTo(event.target.value)} /></label><label className="select-field sort-field"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="priority">Priority</option><option value="confidence">AI confidence</option></select><ArrowDownUp size={14} /></label></div><IncidentTable rows={rows} onSelect={onSelect} /><div className="table-pagination"><span>Showing <b>{rows.length ? 1 : 0}–{rows.length}</b> of 20 incidents</span><div><button aria-label="Previous page" disabled><ArrowLeft size={14} /></button><button className="pagination-active">1</button><button>2</button><button>3</button><button aria-label="Next page"><ArrowRight size={14} /></button></div></div></section>
  </section>;
}

function InvestigationScreen({ incident, onNavigate, onRecommendation }: { incident: Incident; onNavigate: (path: string) => void; onRecommendation: () => void }) {
  return <section className="screen-page"><div className="breadcrumbs"><span>TRT Queue</span><ArrowRight size={13} /><strong>{incident.id}</strong><span className="breadcrumb-status"><StatusPill>Review Required</StatusPill></span></div><PageHeading eyebrow="INVESTIGATION WORKSPACE" title={incident.id} description="Automated TRT · Triggered 29 Oct 2026, 11:15 UTC" action={<button className="button button-outline" onClick={() => onNavigate("/queue")}><ArrowLeft size={15} /> Back to queue</button>} />
    <div className="investigation-tabs"><button className="tab-active">Overview</button><button onClick={() => onNavigate(`/intelligence/${incident.id}`)}>Transaction intelligence <ArrowUpRight size={13} /></button><button onClick={() => onNavigate("/history")}>Similar cases <ArrowUpRight size={13} /></button><button onClick={onRecommendation}>Recommendation <ArrowUpRight size={13} /></button></div>
    <div className="investigation-layout"><div className="investigation-primary"><section className="surface assessment-card"><div className="assessment-heading"><span className="assessment-mark"><Sparkles size={18} /></span><div><span className="eyebrow">AI ASSESSMENT</span><h2>Likely fraudulent BIN Attack</h2></div><span className="fraud-badge"><i />Fraud suspected</span></div><p className="assessment-summary">Transaction behavior strongly indicates coordinated card testing activity targeting a concentrated BIN range. Multiple independent signals align with historical fraud patterns.</p><div className="assessment-footer"><div className="confidence-meter"><span>AI confidence</span><strong>94%</strong><div><i /></div></div><div className="assessment-meta"><span><Clock3 size={14} />Last analyzed 11:21 UTC</span><span><Bot size={14} />SafetyNet model v2.4</span></div></div></section>
      <section className="surface event-info"><div className="surface-heading"><div><h2>Event information</h2><p>Core TRT details and originating context</p></div><span className="event-type"><Zap size={13} /> AUTOMATED TRT</span></div><dl className="info-grid"><div><dt>Pattern type</dt><dd><span className="pattern-symbol">◉</span>{incident.pattern}</dd></div><div><dt>ICA</dt><dd>{incident.ica}</dd></div><div><dt>CID</dt><dd>{incident.cid}</dd></div><div><dt>Country</dt><dd><span className="country-flag">{incident.country === "India" ? "IN" : incident.country.slice(0, 2).toUpperCase()}</span>{incident.country}</dd></div><div><dt>Channel</dt><dd>{incident.channel}</dd></div><div><dt>Trigger time (UTC)</dt><dd>29 Oct 2026 · 11:15</dd></div></dl></section>
      <section className="surface indicators-surface"><div className="surface-heading"><div><h2>Key indicators</h2><p>Signals evaluated for this investigation</p></div><button className="text-action" onClick={() => onNavigate(`/intelligence/${incident.id}`)}>Explore transactions <ArrowRight size={14} /></button></div><div className="indicator-grid">{[{ name: "Crypto replay", state: "Detected", icon: ShieldAlert }, { name: "PAN repetition", state: "Detected", icon: Target }, { name: "Merchant concentration", state: "Detected", icon: BriefcaseBusiness }, { name: "Velocity spike", state: "Detected", icon: TrendingUp }, { name: "Geographic anomaly", state: "Not detected", icon: Activity }].map(({ name, state, icon: Icon }) => <div className={`indicator-item${state === "Detected" ? " indicator-detected" : ""}`} key={name}><span className="indicator-icon"><Icon size={16} /></span><div><strong>{name}</strong><small className={state === "Detected" ? "indicator-positive" : ""}>{state === "Detected" ? <CircleAlert size={12} /> : <Check size={12} />}{state}</small></div></div>)}</div></section>
    </div><aside className="decision-rail"><div className="rail-heading"><h2>Analyst decision</h2><span>STEP 1 OF 3</span></div><p>Review the AI assessment and select how you want to proceed.</p><button className="decision-option decision-recommended" onClick={onRecommendation}><span className="decision-radio"><i /></span><span><strong>Approve recommendation</strong><small>Continue SafetyNet Blocking</small></span><span className="recommended-tag">AI SUGGESTED</span></button><button className="decision-option" onClick={onRecommendation}><span className="decision-radio" /><span><strong>Request validation</strong><small>Ask issuer for more context</small></span></button><button className="decision-option" onClick={onRecommendation}><span className="decision-radio" /><span><strong>Escalate investigation</strong><small>Route to senior review</small></span></button><button className="decision-option" onClick={onRecommendation}><span className="decision-radio" /><span><strong>Reject recommendation</strong><small>Fraud assessment not supported</small></span></button><div className="rail-divider" /><div className="next-step"><span className="next-step-icon"><ArrowRight size={15} /></span><div><strong>Next: Recommendation center</strong><small>Record the final analyst decision</small></div></div><button className="button button-primary full-button" onClick={onRecommendation}>Continue review <ArrowRight size={15} /></button><div className="rail-compliance"><Shield size={13} /> Decision is recorded locally in this sandbox.</div></aside></div>
  </section>;
}

function IntelligenceScreen() {
  return <section className="screen-page"><div className="breadcrumbs"><Link to="/investigation/TRT-2026-7821">Investigation</Link><ArrowRight size={13} /><strong>TRT-2026-7821</strong></div><PageHeading eyebrow="INVESTIGATION / TRANSACTION INTELLIGENCE" title="Transaction Intelligence" description="145,231 transactions · 29 Oct 2026 · 00:00–14:00 UTC" action={<button className="button button-outline"><Download size={15} /> Export data</button>} />
    <div className="transaction-kpis">{[{ label: "Total transactions", value: "145,231", className: "" }, { label: "SafetyNet declined", value: "118,721", className: "metric-red" }, { label: "Issuer declined", value: "15,948", className: "metric-muted" }, { label: "Approved", value: "10,562", className: "metric-green" }].map((item) => <article className="surface transaction-kpi" key={item.label}><span>{item.label}</span><strong className={item.className}>{item.value}</strong><small><span className="metric-dot" />Current incident window</small></article>)}</div>
    <div className="chart-grid"><section className="surface chart-surface volume-surface"><div className="surface-heading"><div><h2>Transaction volume timeline</h2><p>Transactions per 30-minute interval · UTC</p></div><span className="chart-chip"><i />Observed volume</span></div><div className="volume-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={volumeData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}><defs><linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d84a24" stopOpacity={0.28} /><stop offset="96%" stopColor="#d84a24" stopOpacity={0.015} /></linearGradient></defs><CartesianGrid stroke="#e9e9e4" strokeDasharray="3 4" vertical={false} /><XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#868a82", fontSize: 10 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#868a82", fontSize: 10 }} tickFormatter={(value: number) => `${value / 1000}k`} /><Tooltip formatter={(value) => [Number(value).toLocaleString(), "Transactions"]} contentStyle={{ border: "1px solid #e6e4dd", borderRadius: 6, fontSize: 12 }} /><Area type="monotone" dataKey="transactions" stroke="#d84a24" strokeWidth={2.2} fill="url(#volumeFill)" activeDot={{ r: 4, fill: "#d84a24" }} /></AreaChart></ResponsiveContainer></div><div className="spike-callout"><span className="spike-line" /><span><b>+380% velocity spike</b> · baseline exceeded at 10:30 UTC</span></div></section>
      <section className="surface chart-surface distribution-surface"><div className="surface-heading"><div><h2>Country distribution</h2><p>Share of transactions</p></div><button className="icon-button" aria-label="More country chart options"><ChevronDown size={15} /></button></div><div className="country-chart-wrap"><div className="country-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={countryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={76} paddingAngle={3} stroke="none">{countryData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => [`${value}%`, "Share"]} /></PieChart></ResponsiveContainer><div className="donut-total"><strong>145k</strong><small>transactions</small></div></div><ul className="country-legend">{countryData.map((item) => <li key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><b>{item.value}%</b></li>)}</ul></div></section></div>
    <div className="intel-lower-grid"><section className="surface merchant-surface"><div className="surface-heading"><div><h2>Top merchants</h2><p>Concentration across active transaction set</p></div><span className="merchant-total">4 leading</span></div><div className="merchant-table"><div><span className="merchant-rank">01</span><b>Ticketmaster</b><span className="merchant-track"><i style={{ width: "100%" }} /></span><strong>53,210</strong><span className="merchant-share">36.6%</span></div><div><span className="merchant-rank">02</span><b>Spotify</b><span className="merchant-track"><i style={{ width: "79%" }} /></span><strong>42,000</strong><span className="merchant-share">28.9%</span></div><div><span className="merchant-rank">03</span><b>Netflix</b><span className="merchant-track"><i style={{ width: "40%" }} /></span><strong>21,120</strong><span className="merchant-share">14.5%</span></div><div><span className="merchant-rank">04</span><b>Nike</b><span className="merchant-track"><i style={{ width: "25%" }} /></span><strong>13,421</strong><span className="merchant-share">9.2%</span></div></div></section><section className="surface signal-surface"><div className="surface-heading"><div><h2>Fraud signals</h2><p>Pattern checks across transaction set</p></div><span className="signal-count">5 signals</span></div><div className="signal-list">{["Crypto replay", "Same amount pattern", "PAN concentration", "Merchant concentration", "Velocity burst"].map((signal) => <div key={signal}><span className="signal-check"><Check size={12} /></span><span>{signal}</span><strong>Found</strong></div>)}</div></section></div>
    <section className="surface channel-distribution"><div className="surface-heading"><div><h2>Channel distribution</h2><p>Transaction mix by acceptance channel</p></div></div><div className="channel-bars">{channelData.map((channel) => <div key={channel.name}><div className="channel-bar-label"><span>{channel.name}</span><strong>{channel.share}%</strong></div><span className="channel-bar-track"><i style={{ width: `${channel.share * 2.5}%` }} /></span><small>{channel.count} transactions</small></div>)}</div></section>
    <section className="surface raw-data-surface"><div className="surface-heading"><div><h2>Raw transaction data</h2><p>Masked synthetic sample · 50 records shown</p></div><span className="synthetic-label"><Shield size={12} /> Synthetic data</span></div><div className="table-scroll"><table className="data-table transaction-table"><thead><tr><th>PAN</th><th>Merchant</th><th>Amount</th><th>Country</th><th>Acquirer</th><th>Issuer</th><th>ADC indicator</th><th>Cryptogram</th><th>Time (UTC)</th></tr></thead><tbody>{transactions.map((row, index) => <tr key={`${row.pan}-${index}`}><td className="pan-cell">{row.pan}</td><td>{row.merchant}</td><td>${row.amount.toFixed(2)}</td><td>{row.country}</td><td>{row.acquirer}</td><td>{row.issuer}</td><td><span className={row.adc === "Mismatch" ? "adc-mismatch" : "adc-valid"}>{row.adc}</span></td><td className="crypto-cell">{row.cryptogram}</td><td>{row.time}</td></tr>)}</tbody></table></div></section>
  </section>;
}

function HistoryScreen() {
  const cases = [
    { id: "TRT-2025-1234", pattern: "BIN Attack", similarity: 92, outcome: "Threshold increased", action: "UDT submitted", merchant: "Ticketmaster" },
    { id: "TRT-2024-8811", pattern: "BIN Attack", similarity: 87, outcome: "Whitelisted", action: "No further action", merchant: "Ticketmaster" },
    { id: "TRT-2023-6731", pattern: "BIN Attack", similarity: 85, outcome: "Escalated", action: "SafetyNet rule updated", merchant: "Amazon" },
    { id: "TRT-2025-0892", pattern: "Velocity Attack", similarity: 81, outcome: "Threshold increased", action: "UDT submitted", merchant: "Spotify" },
    { id: "TRT-2024-2190", pattern: "Merchant Attack", similarity: 78, outcome: "Customer validated", action: "Monitoring period", merchant: "Nike" },
  ];
  return <section className="screen-page"><PageHeading eyebrow="INVESTIGATION / CASE CONTEXT" title="Historical Cases" description="Compare this incident with resolved investigations and external context." action={<span className="history-context"><Sparkles size={14} />Current pattern: BIN Attack</span>} />
    <div className="history-layout"><section className="surface history-table-surface"><div className="surface-heading"><div><h2>Similar incidents</h2><p>Ranked by pattern and behavioral similarity</p></div><button className="icon-button" aria-label="Filter historical cases"><Filter size={16} /></button></div><div className="table-scroll"><table className="data-table history-table"><thead><tr><th>TRT ID</th><th>Pattern</th><th>Similarity</th><th>Outcome</th><th>Action taken</th><th /></tr></thead><tbody>{cases.map((item, index) => <tr key={item.id}><td><strong className="id-cell">{item.id}</strong></td><td>{item.pattern}</td><td><span className={`similarity-score${index === 0 ? " similarity-best" : ""}`}><i style={{ width: `${item.similarity}%` }} />{item.similarity}%</span></td><td>{item.outcome}</td><td>{item.action}</td><td><ArrowUpRight size={14} /></td></tr>)}</tbody></table></div></section><aside className="surface best-match-card"><span className="best-match-eyebrow"><Sparkles size={14} /> AI SIMILARITY MATCH</span><strong className="best-match-score">92<small>%</small></strong><span className="best-match-label">Highest similarity</span><div className="best-match-rule" /><dl><div><dt>Matched case</dt><dd>TRT-2025-1234</dd></div><div><dt>Merchant</dt><dd>Ticketmaster</dd></div><div><dt>Prior outcome</dt><dd>Threshold increased</dd></div></dl><button className="button button-outline full-button">View case details <ArrowUpRight size={14} /></button></aside></div>
    <section className="external-context"><div className="external-heading"><span className="external-icon"><Activity size={17} /></span><div><h2>External Context Intelligence</h2><p>Public events that may influence transaction volume</p></div><span className="context-updated">UPDATED 10:45 UTC</span></div><div className="context-events"><article><span className="context-event-icon event-pink">T</span><div><strong>Taylor Swift ticket release</strong><p>Major ticket release driving unusually high demand across ticketing merchants.</p><small><span />LIVE EVENT · TICKETING</small></div><span className="context-impact">HIGH RELEVANCE</span></article><article><span className="context-event-icon event-yellow">N</span><div><strong>Nike Diwali promotion</strong><p>Large-scale regional promotion may contribute to India transaction volume.</p><small><span />PROMOTION · RETAIL</small></div><span className="context-impact context-medium">MEDIUM RELEVANCE</span></article><article><span className="context-event-icon event-green">S</span><div><strong>Spotify membership campaign</strong><p>Subscription campaign can explain a portion of recurring payment activity.</p><small><span />CAMPAIGN · SUBSCRIPTION</small></div><span className="context-impact context-medium">MEDIUM RELEVANCE</span></article></div><div className="ai-interpretation"><Sparkles size={15} /><span><strong>AI interpretation</strong>Current activity may be influenced by public events. Ticketmaster's release is a plausible contributor, but it does not explain cryptogram reuse and repeated PAN behavior observed in this incident.</span></div></section>
  </section>;
}

function RecommendationsScreen({ selectedAction, setSelectedAction, decision, setDecision, notes, setNotes, status, onSubmit, onUdt }: { selectedAction: string; setSelectedAction: (value: string) => void; decision: string; setDecision: (value: string) => void; notes: string; setNotes: (value: string) => void; status: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onUdt: () => void }) {
  const actions = ["Continue Blocking", "Whitelist Merchant", "Increase Threshold", "Request Customer Validation", "Escalate", "No Action"];
  return <section className="screen-page"><div className="breadcrumbs"><Link to="/investigation/TRT-2026-7821">TRT-2026-7821</Link><ArrowRight size={13} /><strong>Recommendation</strong></div><PageHeading eyebrow="INVESTIGATION / DECISION" title="Recommendation Center" description="Review the evidence, select an action, and record your analyst decision." action={<StatusPill>Review Required</StatusPill>} />
    <div className="recommendation-layout"><div className="recommendation-main"><section className="recommendation-hero"><div className="recommendation-hero-top"><span className="recommendation-spark"><Sparkles size={18} /></span><span>PRIMARY RECOMMENDATION</span><span className="recommendation-confidence">94% confidence</span></div><h2>Continue SafetyNet Blocking</h2><p>Coordinated fraud signals remain active. Current evidence does not support a merchant whitelist or threshold increase.</p><div className="recommendation-evidence">{["Repeated cryptogram values", "Merchant concentration", "Velocity spike", "PAN repetition"].map((item) => <span key={item}><Check size={13} />{item}</span>)}</div></section>
      <section className="surface action-selection"><div className="surface-heading"><div><h2>Recommended action</h2><p>Choose an operational action for this investigation.</p></div><span className="recommended-tag">AI SUGGESTED</span></div><div className="action-radio-grid">{actions.map((action) => <label key={action} className={selectedAction === action ? "action-selected" : ""}><input type="radio" name="recommended-action" checked={selectedAction === action} onChange={() => setSelectedAction(action)} /><span className="radio-indicator" /><span>{action}</span></label>)}</div></section>
      <form className="surface analyst-form" onSubmit={onSubmit}><div className="surface-heading"><div><h2>Analyst decision</h2><p>Record the disposition and rationale for the case file.</p></div></div><div className="form-two-columns"><label className="form-field"><span>Decision</span><select value={decision} onChange={(event) => setDecision(event.target.value)}><option>Approve</option><option>Modify</option><option>Reject</option></select></label><label className="form-field"><span>Selected action</span><input readOnly value={selectedAction} /></label></div><label className="form-field"><span>Analyst notes <b>Required</b></span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Document the evidence reviewed and rationale for your decision..." rows={4} required /></label>{status && <p className={`form-status${status.startsWith("Add") ? " form-status-error" : ""}`} role="status">{status}</p>}<div className="form-actions"><button className="button button-outline" type="button" onClick={() => setNotes(notes || "Draft review: validate issuer context before final submission.")}>Save draft</button><button className="button button-primary" type="submit"><Check size={15} />Submit investigation</button></div></form></div>
      <aside className="recommendation-aside"><section className="surface recommendation-aside-card"><span className="eyebrow">CASE SUMMARY</span><strong>TRT-2026-7821</strong><div className="case-summary-line"><span>Pattern</span><b>BIN Attack</b></div><div className="case-summary-line"><span>ICA / Country</span><b>Citibank India · India</b></div><div className="case-summary-line"><span>Priority</span><StatusPill>Critical</StatusPill></div><div className="case-summary-line"><span>AI confidence</span><b>94%</b></div><Link to="/investigation/TRT-2026-7821" className="summary-link">Back to investigation <ArrowUpRight size={14} /></Link></section><section className="udt-promo"><span><FileCheck2 size={17} /></span><h3>Threshold adjustment?</h3><p>Prepare a UDT request with supporting historical context.</p><button onClick={onUdt}>Open UDT assistant <ArrowRight size={14} /></button></section><div className="decision-note"><Shield size={14} />Changes are saved in the local POC workspace only.</div></aside></div>
  </section>;
}

function UdtScreen({ status, setStatus }: { status: string; setStatus: (value: string) => void }) {
  const [merchant, setMerchant] = useState("Nike");
  const [threshold, setThreshold] = useState("4000");
  const [justification, setJustification] = useState("Legitimate promotional activity detected. Historical case TRT-2025-1234 showed a similar campaign-driven increase and was resolved with a temporary threshold adjustment.");
  function downloadUdt() {
    const printable = `<html><head><title>UDT Request TRT-2026-7821</title><style>body{font:14px Arial,sans-serif;padding:40px;color:#24302a}h1{font-size:22px}dt{font-weight:bold;margin-top:16px}dd{margin:5px 0}</style></head><body><h1>UDT Request · TRT-2026-7821</h1><dl><dt>ICA</dt><dd>Citibank India</dd><dt>Merchant</dt><dd>${escapeHtml(merchant)}</dd><dt>Country</dt><dd>India</dd><dt>Current threshold</dt><dd>1,000 transactions/hour</dd><dt>Suggested threshold</dt><dd>${escapeHtml(threshold)} transactions/hour</dd><dt>Business justification</dt><dd>${escapeHtml(justification)}</dd><dt>Expected duration</dt><dd>24 hours</dd></dl><script>window.print()</script></body></html>`;
    const blob = new Blob([printable], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const windowRef = window.open(url, "_blank", "noopener,noreferrer");
    if (!windowRef) setStatus("Allow pop-ups to open the print-to-PDF view.");
    else setStatus("Print view opened. Choose Save as PDF to create the UDT document.");
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  return <section className="screen-page"><div className="breadcrumbs"><Link to="/recommendations/TRT-2026-7821">Recommendation</Link><ArrowRight size={13} /><strong>UDT Assistant</strong></div><PageHeading eyebrow="INVESTIGATION / OPERATIONAL CHANGE" title="UDT Assistant" description="Prepare a threshold change request for analyst review." action={<span className="sandbox-badge"><Shield size={13} /> Sandbox · not submitted</span>} />
    <div className="udt-layout"><div className="udt-main"><section className="udt-recommendation"><div className="udt-icon"><Sparkles size={18} /></div><div><span className="eyebrow">AI-GENERATED RECOMMENDATION</span><h2>Temporary threshold adjustment</h2><p>Similar promotional activity may be contributing to legitimate traffic. Apply a time-limited threshold adjustment while monitoring fraud signals.</p></div><span className="udt-similarity"><strong>89%</strong><small>similarity</small></span></section><form className="surface udt-form" onSubmit={(event) => { event.preventDefault(); setStatus("UDT draft generated locally. No BEARS connection is configured."); }}><div className="surface-heading"><div><h2>UDT request details</h2><p>Complete the fields below before preparing the request.</p></div><span className="draft-pill"><i />DRAFT</span></div><div className="form-two-columns"><label className="form-field"><span>ICA</span><select defaultValue="Citibank India"><option>Citibank India</option><option>Citibank US</option><option>HSBC UK</option><option>ANZ Australia</option><option>Standard Bank SA</option></select></label><label className="form-field"><span>Country</span><select defaultValue="India"><option>India</option><option>USA</option><option>UK</option><option>Singapore</option><option>Australia</option><option>Canada</option></select></label><label className="form-field"><span>Merchant</span><select value={merchant} onChange={(event) => setMerchant(event.target.value)}>{["Ticketmaster", "Spotify", "Netflix", "Nike", "Amazon", "Walmart", "Flipkart", "Target"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field"><span>Expected duration</span><select defaultValue="24 hours"><option>6 hours</option><option>12 hours</option><option>24 hours</option><option>48 hours</option><option>7 days</option></select></label><label className="form-field"><span>Current threshold</span><div className="input-with-unit"><input value="1000" readOnly /><span>txns / hour</span></div></label><label className="form-field"><span>Suggested threshold</span><div className="input-with-unit"><input type="number" min="1000" step="500" value={threshold} onChange={(event) => setThreshold(event.target.value)} /><span>txns / hour</span></div></label></div><label className="form-field"><span>Business justification</span><textarea value={justification} onChange={(event) => setJustification(event.target.value)} rows={4} /></label><div className="historical-support"><span><BriefcaseBusiness size={15} /></span><div><strong>Historical support · TRT-2025-1234</strong><small>Threshold increased · UDT submitted · 89% similarity</small></div><ArrowUpRight size={14} /></div>{status && <p className="form-status" role="status">{status}</p>}<div className="form-actions udt-actions"><button className="button button-outline" type="button" onClick={() => setStatus("Draft saved locally in this session.")}>Save draft</button><button className="button button-outline" type="button" onClick={downloadUdt}><Download size={15} />Download PDF</button><button className="button button-outline" type="button" onClick={() => setStatus("BEARS is not connected in this POC. Request remains local and unsent.")}>Send to BEARS <ArrowUpRight size={14} /></button><button className="button button-primary" type="submit"><FileCheck2 size={15} />Generate UDT</button></div></form></div><aside className="udt-side"><section className="surface udt-side-card"><span className="eyebrow">AI JUSTIFICATION</span><div className="justification-score"><strong>89%</strong><span>historical similarity</span></div><p>Legitimate promotion detected. Similar seasonal traffic patterns were previously resolved with a temporary merchant threshold increase.</p><div className="justification-tag"><Check size={13} />Analyst review required</div></section><div className="udt-safety-note"><Shield size={16} /><div><strong>Change control</strong><p>Generating a UDT creates a local draft only. A designated approver must review the change before any operational submission.</p></div></div></aside></div>
  </section>;
}