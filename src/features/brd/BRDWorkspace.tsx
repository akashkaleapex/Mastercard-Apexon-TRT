import { useReducer, useState, type FormEvent } from "react";
import { ClipboardList, FileSearch, History, LayoutDashboard, Lightbulb, Menu, Search, Shield, X } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  EvidencePanel,
  HistoricalCasesPanel,
  OverviewPanel,
  RecommendationPanel,
  TRTDashboard,
  TRTHeader,
  TRTQueue,
} from "@/features/brd/components/BRDScreens";
import { casesWithReview, initialReview, reviewReducer } from "@/features/brd/review";
import "@/features/brd/brd.css";

const workspaceTabs = ["Overview", "Evidence", "Historical Context", "Recommendation"] as const;
type WorkspaceTab = typeof workspaceTabs[number];
const workspaceTabIcons = {
  Overview: LayoutDashboard,
  Evidence: FileSearch,
  "Historical Context": History,
  Recommendation: Lightbulb,
};

export function BRDWorkspace() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("Overview");
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [review, dispatch] = useReducer(reviewReducer, initialReview);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const patternQuery = searchParams.get("pattern") ?? "";
  const [search, setSearch] = useState(searchQuery);
  const isQueue = pathname === "/queue";
  const isDashboard = pathname === "/dashboard";
  const cases = casesWithReview(review);
  const incidentId = pathname.match(/^\/trt\/([^/]+)/)?.[1] ?? "TRT-2026-7821";
  const incident = cases.find((item) => item.id === incidentId) ?? cases.find((item) => item.id === "TRT-2026-7821")!;
  const openTRT = (id: string) => {
    setActiveTab("Overview");
    navigate(`/trt/${id}`);
  };
  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const value = search.trim();
    const exact = cases.find((item) => item.id.toLowerCase() === value.toLowerCase());
    if (exact) openTRT(exact.id);
    else navigate(value ? `/queue?q=${encodeURIComponent(value)}` : "/queue");
  }

  return (
    <div className="brd-app">
      <header className="brd-topbar">
        <button className="brd-mobile-nav-toggle" aria-label={mobileNavigationOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileNavigationOpen} aria-controls="brd-sidebar" onClick={() => setMobileNavigationOpen((open) => !open)}>{mobileNavigationOpen ? <X size={19} /> : <Menu size={19} />}</button>
        <Link className="brd-topbar-brand" to="/dashboard">
          <span><Shield size={20} /></span>
          <span><small>MASTERCARD</small><strong>SafetyNet TRT Copilot</strong></span>
        </Link>
        <div className="brd-topbar-context"><span className="brd-topbar-environment"><i aria-hidden="true" />POC Sandbox</span><i className="brd-topbar-divider" aria-hidden="true" /><span className={isDashboard || isQueue ? "brd-topbar-view" : "brd-topbar-trt-id"}>{isDashboard ? "Operations" : isQueue ? "TRT Queue" : incident.id}</span></div>
        <form className="brd-topbar-search" role="search" onSubmit={submitSearch}><label className="brd-search"><Search size={15} aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search TRT ID, ICA or BIN" aria-label="Search cases" /></label></form>
        <span className="brd-analyst"><span className="brd-analyst-avatar" aria-hidden="true">AM</span><span className="brd-analyst-details"><strong>Alex Morgan</strong><small>Analyst</small></span></span>
      </header>
      <div className="brd-shell">
        {mobileNavigationOpen && <button className="brd-nav-scrim" aria-label="Dismiss navigation drawer" onClick={() => setMobileNavigationOpen(false)} />}
        <aside className={`brd-sidebar${mobileNavigationOpen ? " brd-sidebar-mobile-open" : ""}`} id="brd-sidebar">
          <div className="brd-sidebar-section"><span>Workspace</span><Link className={isDashboard ? "brd-nav-active" : ""} to="/dashboard" onClick={() => setMobileNavigationOpen(false)}><LayoutDashboard size={16} />Dashboard</Link><Link className={isQueue ? "brd-nav-active" : ""} to="/queue" onClick={() => setMobileNavigationOpen(false)}><ClipboardList size={16} />TRT Queue</Link></div>
          {!isDashboard && !isQueue && <div className="brd-sidebar-section brd-sidebar-current"><span>Current TRT</span>{workspaceTabs.map((tab) => { const Icon = workspaceTabIcons[tab]; return <button className={activeTab === tab ? "brd-nav-active" : ""} key={tab} onClick={() => { setActiveTab(tab); setMobileNavigationOpen(false); }}><Icon size={18} aria-hidden="true" />{tab}</button>; })}</div>}
          <div className="brd-sidebar-section brd-sidebar-advisory"><span>Advisory only</span><p>The assistant prepares evidence and recommends next steps. Blocking, whitelisting, UDT requests and customer contact stay with the existing teams.</p></div>
          <div className="brd-sidebar-footer"><i aria-hidden="true" /><strong>POC Sandbox</strong><small>Mock environment</small></div>
        </aside>
        <main className="brd-main" id="brd-main-content">
          {isDashboard ? <TRTDashboard cases={cases} onQueue={(pattern) => navigate(pattern ? `/queue?pattern=${encodeURIComponent(pattern)}` : "/queue")} onOpenTRT={openTRT} /> : isQueue ? <TRTQueue key={`${searchQuery}|${patternQuery}`} initialQuery={searchQuery} initialPattern={patternQuery || undefined} onOpenTRT={openTRT} review={review} dispatch={dispatch} /> : <>
            <TRTHeader incident={incident} review={review} />
            <div className="brd-tabs" role="tablist" aria-label="TRT investigation sections">{workspaceTabs.map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "brd-tab-active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>
            {activeTab === "Overview" && <OverviewPanel incident={incident} review={review} dispatch={dispatch} />}
            {activeTab === "Evidence" && <EvidencePanel review={review} />}
            {activeTab === "Historical Context" && <HistoricalCasesPanel review={review} dispatch={dispatch} onOpenTRT={openTRT} />}
            {activeTab === "Recommendation" && <RecommendationPanel review={review} dispatch={dispatch} />}
          </>}
        </main>

      </div>
    </div>
  );
}