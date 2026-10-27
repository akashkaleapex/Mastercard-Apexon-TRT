import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  Radio,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EventTable } from "@/features/events/EventTable";
import { getDemoAgentActivity, getDemoAgentStatus } from "@/mocks/agent/status";
import { getDemoEvents } from "@/mocks/events/events";
import { formatDemoTimestamp } from "@/mocks/shared/timestamps";

const activityIcons = [Radio, Database, Eye];

export function DashboardPage() {
  const status = getDemoAgentStatus();
  const events = getDemoEvents();
  const activity = getDemoAgentActivity();

  return (
    <section className="screen-page" aria-labelledby="dashboard-title">
      <div className="page-heading dashboard-heading">
        <div>
          <p className="page-eyebrow">Workspace / operations overview</p>
          <h1 id="dashboard-title">Agent Monitor</h1>
          <p className="page-description">Monitor event intake, review activity, and source readiness.</p>
        </div>
        <span className="phase-badge">Operations</span>
      </div>

      <section className="agent-status-strip" aria-label="Agent status">
        <div className="agent-status-primary">
          <span className="agent-status-icon"><Activity aria-hidden="true" /></span>
          <div>
            <span className="metric-label">Monitor state</span>
            <strong>{status.state}</strong>
          </div>
          <span className="agent-state-badge"><span aria-hidden="true" />Ready</span>
        </div>
        <div className="agent-status-detail">
          <span className="metric-label">Mode</span>
          <strong>{status.mode}</strong>
        </div>
        <div className="agent-status-detail">
          <span className="metric-label">Input channels</span>
          <strong>Signal and report</strong>
        </div>
      </section>

      <section className="summary-metrics" aria-label="Event summary">
        <div className="summary-metric">
          <span className="metric-label">Prepared events</span>
          <strong>{status.preparedEvents}</strong>
          <span className="metric-note">Available for review</span>
        </div>
        <div className="summary-metric">
          <span className="metric-label">Awaiting review</span>
          <strong>{status.awaitingReview}</strong>
          <span className="metric-note">Pending analyst decision</span>
        </div>
        <div className="summary-metric">
          <span className="metric-label">High priority</span>
          <strong>{events.filter((event) => event.severity === "Critical" || event.severity === "High").length}</strong>
          <span className="metric-note">Requires analyst attention</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-section activity-section" aria-labelledby="activity-title">
          <div className="section-heading">
            <div>
              <h2 id="activity-title">Recent activity</h2>
              <p>Latest event intake and review activity · UTC</p>
            </div>
            <span className="section-icon"><Clock3 aria-hidden="true" /></span>
          </div>
          <ol className="activity-list">
            {activity.map((item, index) => {
              const ActivityIcon = activityIcons[index] ?? CheckCircle2;

              return (
                <li className="activity-item" key={item.id}>
                  <span className="activity-icon"><ActivityIcon aria-hidden="true" /></span>
                  <div className="activity-content">
                    <div className="activity-title-row">
                      <strong>{item.title}</strong>
                      <span className="activity-state">{item.status}</span>
                    </div>
                    <span className="activity-detail">{item.detail}</span>
                    <time dateTime={item.timestamp}>{formatDemoTimestamp(item.timestamp)}</time>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="dashboard-section sources-section" aria-labelledby="source-title">
          <div className="section-heading">
            <div>
              <h2 id="source-title">Source activity</h2>
              <p>Current intake channels</p>
            </div>
            <span className="section-icon"><Database aria-hidden="true" /></span>
          </div>
          <ul className="source-list">
            <li>
              <span className="source-state-dot" aria-hidden="true" />
              <span>TRT signal</span>
              <span className="source-state-label">Available</span>
            </li>
            <li>
              <span className="source-state-dot" aria-hidden="true" />
              <span>TRT report</span>
              <span className="source-state-label">Available</span>
            </li>
          </ul>
          <p className="source-boundary">Review recent records and continue to an event workspace.</p>
        </section>
      </div>

      <section className="dashboard-section prepared-events-section" aria-labelledby="prepared-events-title">
        <div className="section-heading">
          <div>
            <h2 id="prepared-events-title">Prepared events</h2>
            <p>Open an event to review its analyst workspace.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/events">
              View event inbox
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <EventTable events={events.slice(0, 3)} emptyMessage="No events are available." />
      </section>
    </section>
  );
}