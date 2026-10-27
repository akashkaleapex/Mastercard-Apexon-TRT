import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Info,
  MessageSquareText,
  ShieldAlert,
  Target,
} from "lucide-react";
import { lazy, Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getEventFinding, hasEventBaseline } from "@/mocks/analysis/findings";
import { getDemoEvents } from "@/mocks/events/events";
import { formatDemoTimestamp } from "@/mocks/shared/timestamps";
import type { TrtEvent } from "@/types/events";

const EventTrendChart = lazy(() =>
  import("@/features/events/EventTrendChart").then(({ EventTrendChart: Chart }) => ({
    default: Chart,
  })),
);

const numberFormatter = new Intl.NumberFormat("en-US");

function severityClass(severity: TrtEvent["severity"]) {
  return `severity-label severity-${severity.toLowerCase()}`;
}

function exportEventSummary(event: TrtEvent, finding: NonNullable<ReturnType<typeof getEventFinding>>) {
  const contents = JSON.stringify({
    event: {
      id: event.id,
      severity: event.severity,
      status: event.status,
      receivedAt: event.receivedAt,
      source: event.source,
    },
    analysis: finding,
  }, null, 2);
  const file = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${event.id}-analysis.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function EventAnalysisPage() {
  const { eventId = "" } = useParams();
  const event = getDemoEvents().find((item) => item.id === eventId);
  const finding = getEventFinding(eventId);

  if (!event || !finding) {
    return (
      <section className="screen-page" aria-labelledby="event-not-found-title">
        <p className="page-eyebrow">Workspace / events</p>
        <h1 className="analysis-page-title" id="event-not-found-title">Event not found</h1>
        <p className="page-description">The requested event could not be opened.</p>
        <Button asChild className="back-to-events" variant="outline">
          <Link to="/events">Back to event inbox</Link>
        </Button>
      </section>
    );
  }

  const baselineAvailable = hasEventBaseline(event.id);
  const coverageState = finding.missingData.length > 0 ? "coverage-partial" : "coverage-complete";

  return (
    <section className="screen-page analysis-page" aria-labelledby="analysis-title">
      <div className="analysis-breadcrumb">
        <Link to="/events">Events</Link>
        <ArrowRight aria-hidden="true" />
        <span>{event.id}</span>
      </div>

      <div className="analysis-heading">
        <div className="analysis-title-group">
          <p className="page-eyebrow">Event analysis</p>
          <div className="event-title-line">
            <h1 id="analysis-title">{event.id}</h1>
            <span className={severityClass(event.severity)}>
              <span aria-hidden="true" className="severity-dot" />
              {event.severity} severity
            </span>
          </div>
          <div className="event-metadata">
            <span><Clock3 aria-hidden="true" />Received {formatDemoTimestamp(event.receivedAt)}</span>
            <span><Target aria-hidden="true" />{event.source}</span>
            <span>{event.status}</span>
          </div>
        </div>
        <div className="analysis-actions">
          <Button
            variant="outline"
            onClick={() => exportEventSummary(event, finding)}
          >
            <ArrowDownToLine aria-hidden="true" />
            Export summary
          </Button>
          <Button asChild>
            <Link to={`/events/${event.id}/copilot`}>
              <MessageSquareText aria-hidden="true" />
              Ask Co-Pilot
            </Link>
          </Button>
        </div>
      </div>

      <section className="analysis-summary-grid" aria-label="Event analysis summary">
        <article className="analysis-summary-card coverage-card">
          <span className="analysis-card-label">Data coverage</span>
          <div className="coverage-value-row">
            <strong>{finding.coveragePercent}%</strong>
            <span className={`coverage-status ${coverageState}`}>
              {finding.missingData.length > 0 ? "Partial" : "Complete"}
            </span>
          </div>
          <p>{finding.coverageNote}</p>
        </article>
        <article className="analysis-summary-card confidence-card">
          <span className="analysis-card-label">Analysis confidence</span>
          <div className="coverage-value-row">
            <strong>{finding.confidence === null ? "Not available" : `${finding.confidence}%`}</strong>
            {finding.confidence !== null && <span className="confidence-indicator" aria-hidden="true" />}
          </div>
          <p>Confidence is based on the information available for this event.</p>
        </article>
        <article className="analysis-summary-card gate-card">
          <span className="analysis-card-label">Gate proximity</span>
          <div className="coverage-value-row">
            <strong>{finding.gateProximityPercent === null ? "Unavailable" : `${finding.gateProximityPercent}%`}</strong>
            <span className="gate-name">{finding.gateName}</span>
          </div>
          <p>{finding.gateNote}</p>
        </article>
      </section>

      <section className="analysis-section event-summary-section" aria-labelledby="event-summary-title">
        <div className="analysis-section-header">
          <div>
            <h2 id="event-summary-title">Event summary</h2>
            <p>Context and observed indicators for the selected event window.</p>
          </div>
          <span className="window-label">
            {formatDemoTimestamp(finding.timeWindowStart)} – {formatDemoTimestamp(finding.timeWindowEnd)}
          </span>
        </div>
        <p className="finding-summary">{finding.summary}</p>
        {finding.missingData.length > 0 && (
          <div className="data-gap-notice" role="status">
            <AlertTriangle aria-hidden="true" />
            <div>
              <strong>Context is incomplete</strong>
              <span>Unavailable: {finding.missingData.join(", ")}</span>
            </div>
          </div>
        )}
      </section>

      <section className="analysis-metrics" aria-label="Event metrics">
        <article className="analysis-metric">
          <span>Transactions</span>
          <strong>{numberFormatter.format(finding.metrics.transactionCount)}</strong>
          <small>Within selected window</small>
        </article>
        <article className="analysis-metric">
          <span>Transactions / hour</span>
          <strong>{numberFormatter.format(finding.metrics.transactionsPerHour)}</strong>
          <small>Latest observed interval</small>
        </article>
        <article className="analysis-metric">
          <span>Merchant concentration</span>
          <strong>{finding.metrics.merchantConcentrationPercent}%</strong>
          <small>Leading merchant share</small>
        </article>
        <article className="analysis-metric">
          <span>PAN concentration</span>
          <strong>{finding.metrics.panConcentrationPercent}%</strong>
          <small>Leading PAN share</small>
        </article>
        <article className="analysis-metric">
          <span>Geographic spread</span>
          <strong>{finding.metrics.geographicRegions}</strong>
          <small>Observed regions</small>
        </article>
      </section>

      <div className="analysis-detail-grid">
        <section className="analysis-section trend-section" aria-labelledby="trend-title">
          <div className="analysis-section-header">
            <div>
              <h2 id="trend-title">Transaction velocity</h2>
              <p>Hourly volume compared with the available reference period.</p>
            </div>
            <div className="chart-legend" aria-label="Chart series">
              <span><i className="legend-current" />Observed</span>
              {baselineAvailable && <span><i className="legend-baseline" />Reference</span>}
            </div>
          </div>
          {!baselineAvailable && (
            <div className="baseline-notice" role="status">
              <Info aria-hidden="true" />
              <span>No comparable baseline is available. The chart shows observed volume only.</span>
            </div>
          )}
          <div className="trend-chart" role="img" aria-label={`Hourly transaction volume for ${event.id}`}>
            <Suspense fallback={<div className="chart-loading">Preparing chart</div>}>
              <EventTrendChart data={finding.trend} hasBaseline={baselineAvailable} />
            </Suspense>
          </div>
          <details className="chart-data-details">
            <summary>View hourly values</summary>
            <div className="chart-data-scroll">
              <table>
                <thead>
                  <tr><th>Time (UTC)</th><th>Observed</th><th>Reference</th></tr>
                </thead>
                <tbody>
                  {finding.trend.map((point) => (
                    <tr key={point.timestamp}>
                      <td>{point.timestamp}</td>
                      <td>{numberFormatter.format(point.current)}</td>
                      <td>{point.baseline === null ? "Unavailable" : numberFormatter.format(point.baseline)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>

        <section className="analysis-section gate-context-section" aria-labelledby="drivers-title">
          <div className="analysis-section-header">
            <div>
              <h2 id="drivers-title">Observed indicators</h2>
              <p>Signals contributing to this event summary.</p>
            </div>
            <span className="section-icon"><ShieldAlert aria-hidden="true" /></span>
          </div>
          <ul className="driver-list">
            {finding.drivers.map((driver) => (
              <li key={driver}>
                <span className="driver-marker" aria-hidden="true" />
                <span>{driver}</span>
              </li>
            ))}
          </ul>
          <div className="gate-context-note">
            <Target aria-hidden="true" />
            <span>{finding.gateNote}</span>
          </div>
        </section>
      </div>

      <div className="analysis-detail-grid lower-analysis-grid">
        <section className="analysis-section merchants-section" aria-labelledby="merchants-title">
          <div className="analysis-section-header">
            <div>
              <h2 id="merchants-title">Impacted merchant groups</h2>
              <p>Leading groups within the selected event.</p>
            </div>
            <span className="analysis-inline-count">{event.merchantCount} groups</span>
          </div>
          <div className="merchant-list">
            {finding.impactedMerchants.map((merchant) => (
              <div className="merchant-row" key={merchant.name}>
                <div className="merchant-row-heading">
                  <strong>{merchant.name}</strong>
                  <span>{numberFormatter.format(merchant.transactions)} transactions · {merchant.sharePercent}%</span>
                </div>
                <div
                  className="merchant-share-track"
                  role="img"
                  aria-label={`${merchant.name}: ${merchant.sharePercent}% of event volume`}
                >
                  <span style={{ width: `${merchant.sharePercent}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="merchant-data-note">PAN count in event: {event.panCount}</p>
        </section>

        <section className="analysis-section evidence-section" aria-labelledby="evidence-title">
          <div className="analysis-section-header">
            <div>
              <h2 id="evidence-title">Evidence</h2>
              <p>Supporting observations and source details.</p>
            </div>
            <span className="analysis-inline-count">{finding.evidence.length} items</span>
          </div>
          <ol className="evidence-list">
            {finding.evidence.map((evidence) => (
              <li key={evidence.id}>
                <span className="evidence-index">{evidence.id}</span>
                <div>
                  <strong>{evidence.label}</strong>
                  <p>{evidence.detail}</p>
                </div>
                <ArrowUpRight aria-hidden="true" />
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="analysis-bottom-actions">
        <Link className="text-link" to="/events">
          Back to event inbox
          <ArrowRight aria-hidden="true" />
        </Link>
        <div>
          <Button asChild variant="outline">
            <Link to={`/events/${event.id}/actions`}>Review recommendations</Link>
          </Button>
          <Button asChild>
            <Link to={`/events/${event.id}/copilot`}>
              <MessageSquareText aria-hidden="true" />
              Ask Co-Pilot
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}