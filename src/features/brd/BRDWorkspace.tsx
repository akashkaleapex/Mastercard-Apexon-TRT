import { useState } from "react";
import { ClipboardList, FileSearch, History, LayoutDashboard, Lightbulb, Menu, Shield, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  EvidencePanel,
  HistoricalCasesPanel,
  OverviewPanel,
  RecommendationPanel,
  TRTDashboard,
  TRTHeader,
  TRTQueue,
} from "@/features/brd/components/BRDScreens";
import { trtCases } from "@/features/brd/data";
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
  const isQueue = pathname === "/brd/queue";
  const isDashboard = pathname === "/brd/dashboard";
  const incidentId = pathname.match(/\/(?:brd\/)?trt\/([^/]+)/)?.[1] ?? "TRT-2026-7821";
  const incident = trtCases.find((item) => item.id === incidentId) ?? trtCases[0];
  const openTRT = (id: string) => navigate(`/brd/trt/${id}`);
  const openInvestigation = () => {
    setActiveTab("Overview");
    if (isDashboard || isQueue) navigate(`/brd/trt/${incident.id}`);
  };
  const openEvidence = () => {
    setActiveTab("Evidence");
    if (isDashboard || isQueue) navigate(`/brd/trt/${incident.id}`);
  };

  return (
    <div className="brd-app">
      <header className="brd-topbar">
        <button className="brd-mobile-nav-toggle" aria-label={mobileNavigationOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileNavigationOpen} aria-controls="brd-sidebar" onClick={() => setMobileNavigationOpen((open) => !open)}>{mobileNavigationOpen ? <X size={19} /> : <Menu size={19} />}</button>
        <Link className="brd-topbar-brand" to="/">
          <span><Shield size={20} /></span>
          <span><small>MASTERCARD</small><strong>SafetyNet TRT Copilot</strong></span>
        </Link>
        <div className="brd-topbar-context"><span className="brd-topbar-environment"><i aria-hidden="true" />POC Sandbox</span><i className="brd-topbar-divider" aria-hidden="true" /><span className={isDashboard || isQueue ? "brd-topbar-view" : "brd-topbar-trt-id"}>{isDashboard ? "Operations" : isQueue ? "TRT Queue" : incident.id}</span></div>
        <span className="brd-analyst"><span className="brd-analyst-avatar" aria-hidden="true">AM</span><span className="brd-analyst-details"><strong>Alex Morgan</strong><small>Analyst</small></span></span>
      </header>
      <div className="brd-shell">
        {mobileNavigationOpen && <button className="brd-nav-scrim" aria-label="Dismiss navigation drawer" onClick={() => setMobileNavigationOpen(false)} />}
        <aside className={`brd-sidebar${mobileNavigationOpen ? " brd-sidebar-mobile-open" : ""}`} id="brd-sidebar">
          <div className="brd-sidebar-section"><span>Workspace</span><Link className={isDashboard ? "brd-nav-active" : ""} to="/brd/dashboard" onClick={() => setMobileNavigationOpen(false)}><LayoutDashboard size={16} />Dashboard</Link><Link className={isQueue ? "brd-nav-active" : ""} to="/brd/queue" onClick={() => setMobileNavigationOpen(false)}><ClipboardList size={16} />TRT Queue</Link></div>
          {!isDashboard && !isQueue && <div className="brd-sidebar-section brd-sidebar-current"><span>Current TRT</span>{workspaceTabs.map((tab) => { const Icon = workspaceTabIcons[tab]; return <button className={activeTab === tab ? "brd-nav-active" : ""} key={tab} onClick={() => { setActiveTab(tab); setMobileNavigationOpen(false); }}><Icon size={18} aria-hidden="true" />{tab}</button>; })}</div>}
          <div className="brd-sidebar-footer"><i aria-hidden="true" /><strong>POC Sandbox</strong><small>Mock environment</small></div>
        </aside>
        <main className="brd-main" id="brd-main-content">
          {isDashboard ? <TRTDashboard onQueue={() => navigate("/brd/queue")} onOpenTRT={openTRT} /> : isQueue ? <TRTQueue onOpenTRT={openTRT} /> : <>
            <TRTHeader incident={incident} />
            <div className="brd-tabs" role="tablist" aria-label="TRT investigation sections">{workspaceTabs.map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "brd-tab-active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>
            {activeTab === "Overview" && <OverviewPanel incident={incident} />}
            {activeTab === "Evidence" && <EvidencePanel />}
            {activeTab === "Historical Context" && <HistoricalCasesPanel />}
            {activeTab === "Recommendation" && <RecommendationPanel />}
          </>}
        </main>

      </div>
    </div>
  );
}