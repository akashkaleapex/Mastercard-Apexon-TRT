import { ArrowUpRight, CalendarDays, FileText, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const destinations = [
  // {
  //   title: "Workshop Meetings",
  //   description: "Open the separate Workshop Meetings workspace.",
  //   path: "/workshop",
  //   icon: CalendarDays,
  //   label: "WORKSHOP",
  // },
  {
    title: "BRD Docs",
    description: "Review the TRT investigation experience and supporting evidence.",
    path: "/brd/trt/TRT-2026-7821",
    icon: FileText,
    label: "BUSINESS REQUIREMENTS",
  },
];

export function PortalLanding() {
  return (
    <main className="portal-page">
      <header className="portal-header">
        <Link className="portal-brand" to="/">
          <span className="portal-mark"><Shield size={20} /></span>
          <span><small>MASTERCARD · APEXON</small><strong>SafetyNet TRT</strong></span>
        </Link>
        <span className="portal-environment"><i />POC SANDBOX</span>
      </header>
      <section className="portal-content" aria-labelledby="portal-title">
        <p className="portal-eyebrow">TRANSACTION RISK TECHNOLOGY</p>
        <h1 id="portal-title">Investigation workspace</h1>
        <p className="portal-description">Choose a workspace to continue.</p>
        <div className="portal-destinations">
          {destinations.map(({ title, description, path, icon: Icon, label }) => (
            <Link className="portal-destination" key={path} to={path}>
              <span className="portal-destination-icon"><Icon size={19} /></span>
              <span className="portal-destination-copy">
                <small>{label}</small>
                <strong>{title}</strong>
                <span>{description}</span>
              </span>
              <ArrowUpRight className="portal-destination-arrow" size={17} />
            </Link>
          ))}
        </div>
      </section>
      <footer className="portal-footer">Analyst review required · Mock data environment</footer>
    </main>
  );
}