import { Search, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getActionLabel } from "@/mocks/actions/recommendations";
import { getEventFinding } from "@/mocks/analysis/findings";
import { getMemoryRecords } from "@/mocks/memory/records";
import { formatDemoTimestamp } from "@/mocks/shared/timestamps";
import type { ActionKind } from "@/types/actions";
import type { EventSeverity, EventSource } from "@/types/events";
import type { MemoryRecord } from "@/types/memory";

const severities: EventSeverity[] = ["Critical", "High", "Medium", "Low"];
const sources: EventSource[] = ["TRT signal", "TRT report"];
const decisions: ActionKind[] = ["block", "monitor", "whitelist", "threshold-update", "no-action"];

function severityClass(severity: EventSeverity) {
  return `severity-label severity-${severity.toLowerCase()}`;
}

function matchesSearch(record: MemoryRecord, query: string) {
  const searchText = [
    record.eventId,
    record.pattern,
    record.outcome,
    record.summary,
    record.source,
    getActionLabel(record.decision),
  ].join(" ").toLowerCase();

  return searchText.includes(query.trim().toLowerCase());
}

export function MemoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const severity = searchParams.get("severity") ?? "";
  const decision = searchParams.get("decision") ?? "";
  const source = searchParams.get("source") ?? "";

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  const allRecords = getMemoryRecords();
  const records = allRecords
    .filter((record) =>
      matchesSearch(record, query) &&
      (!severity || record.severity === severity) &&
      (!decision || record.decision === decision) &&
      (!source || record.source === source),
    )
    .sort((left, right) => right.reviewedAt.localeCompare(left.reviewedAt));

  const filtersActive = Boolean(query || severity || decision || source);

  return (
    <section className="screen-page memory-page" aria-labelledby="memory-title">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">Workspace / event history</p>
          <h1 id="memory-title">Organizational Memory</h1>
          <p className="page-description">Review prior event patterns, decisions, and recorded outcomes.</p>
        </div>
      </div>

      <section className="memory-section" aria-labelledby="memory-records-title">
        <div className="memory-section-heading">
          <div>
            <h2 id="memory-records-title">Event history</h2>
            <p>{records.length} of {allRecords.length} records</p>
          </div>
        </div>

        <div className="memory-filters" aria-label="Filter event history">
          <label className="memory-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search history</span>
            <input
              type="search"
              value={query}
              placeholder="Search event, pattern, or outcome"
              onChange={(event) => updateFilter("q", event.target.value)}
            />
          </label>
          <label className="memory-filter-select">
            <span className="sr-only">Filter by severity</span>
            <select value={severity} onChange={(event) => updateFilter("severity", event.target.value)}>
              <option value="">All severities</option>
              {severities.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label className="memory-filter-select">
            <span className="sr-only">Filter by decision</span>
            <select value={decision} onChange={(event) => updateFilter("decision", event.target.value)}>
              <option value="">All decisions</option>
              {decisions.map((value) => <option key={value} value={value}>{getActionLabel(value)}</option>)}
            </select>
          </label>
          <label className="memory-filter-select">
            <span className="sr-only">Filter by source</span>
            <select value={source} onChange={(event) => updateFilter("source", event.target.value)}>
              <option value="">All sources</option>
              {sources.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          {filtersActive && (
            <Button className="clear-filters" variant="ghost" size="sm" onClick={clearFilters}>
              <X aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </div>

        {records.length === 0 ? (
          <p className="memory-empty-state">No history records match these filters.</p>
        ) : (
          <div className="memory-table-scroll" role="region" aria-label="Event history records" tabIndex={0}>
            <table className="memory-table">
              <thead>
                <tr>
                  <th scope="col">Event</th>
                  <th scope="col">Reviewed (UTC)</th>
                  <th scope="col">Severity</th>
                  <th scope="col">Pattern</th>
                  <th scope="col">Decision</th>
                  <th scope="col">Outcome</th>
                  <th scope="col">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const finding = getEventFinding(record.eventId);
                  const evidence = finding?.evidence.filter((item) => record.evidenceIds.includes(item.id)) ?? [];

                  return (
                    <tr key={record.eventId}>
                      <th scope="row">
                        <Link className="memory-event-link" to={`/events/${record.eventId}`}>
                          {record.eventId}
                        </Link>
                        <span className="memory-source">{record.source}</span>
                      </th>
                      <td className="memory-date">{formatDemoTimestamp(record.reviewedAt)}</td>
                      <td>
                        <span className={severityClass(record.severity)}>
                          <span aria-hidden="true" className="severity-dot" />
                          {record.severity}
                        </span>
                      </td>
                      <td>
                        <strong className="memory-pattern">{record.pattern}</strong>
                        <span className="memory-summary">{record.summary}</span>
                      </td>
                      <td><span className="memory-decision">{getActionLabel(record.decision)}</span></td>
                      <td className="memory-outcome">{record.outcome}</td>
                      <td>
                        {evidence.length > 0 ? (
                          <details className="memory-evidence">
                            <summary>{evidence.length} item{evidence.length === 1 ? "" : "s"}</summary>
                            <ul>
                              {evidence.map((item) => (
                                <li key={item.id}>
                                  <span>{item.id}</span>
                                  <strong>{item.label}</strong>
                                  <p>{item.detail}</p>
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : "None"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}