import { ArrowDownUp, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EventTable } from "@/features/events/EventTable";
import { getDemoEvents } from "@/mocks/events/events";
import { EVENT_SOURCE_OPTIONS } from "@/mocks/shared/sources";
import type { EventSeverity, EventStatus, TrtEvent } from "@/types/events";

const severityOptions: EventSeverity[] = ["Critical", "High", "Medium", "Low"];
const statusOptions: EventStatus[] = [
  "Ready for review",
  "Analysis prepared",
  "Data incomplete",
];
const severityOrder: Record<EventSeverity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function eventDate(event: TrtEvent) {
  return event.receivedAt.slice(0, 10);
}

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const severity = searchParams.get("severity") ?? "";
  const status = searchParams.get("status") ?? "";
  const source = searchParams.get("source") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }

  const filteredEvents = getDemoEvents()
    .filter((event) => {
      const matchesSearch = `${event.id} ${event.source}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesSeverity = !severity || event.severity === severity;
      const matchesStatus = !status || event.status === status;
      const matchesSource = !source || event.source === source;
      const matchesFrom = !isValidDate(from) || eventDate(event) >= from;
      const matchesTo = !isValidDate(to) || eventDate(event) <= to;

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus &&
        matchesSource &&
        matchesFrom &&
        matchesTo
      );
    })
    .sort((left, right) => {
      if (sort === "oldest") return left.receivedAt.localeCompare(right.receivedAt);
      if (sort === "severity") {
        return severityOrder[left.severity] - severityOrder[right.severity];
      }
      if (sort === "confidence") {
        return (right.demoConfidence ?? -1) - (left.demoConfidence ?? -1);
      }
      return right.receivedAt.localeCompare(left.receivedAt);
    });

  const hasFilters = Boolean(search || severity || status || source || from || to || sort !== "newest");

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  return (
    <section className="screen-page" aria-labelledby="events-title">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">Workspace / event operations</p>
          <h1 id="events-title">Event inbox</h1>
          <p className="page-description">Review incoming events and open an analyst workspace.</p>
        </div>
      </div>

      <section className="inbox-section" aria-labelledby="event-results-heading">
        <div className="inbox-heading">
          <div>
            <h2 id="event-results-heading">Prepared events</h2>
            <p>{filteredEvents.length} of {getDemoEvents().length} events</p>
          </div>
          <label className="sort-control">
            <ArrowDownUp aria-hidden="true" />
            <span className="sr-only">Sort events</span>
            <select value={sort} onChange={(event) => updateFilter("sort", event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="severity">Highest severity</option>
              <option value="confidence">Confidence</option>
            </select>
          </label>
        </div>

        <div className="event-filters" aria-label="Filter events">
          <label className="search-control">
            <Search aria-hidden="true" />
            <span className="sr-only">Search event ID or source</span>
            <input
              type="search"
              value={search}
              placeholder="Search event or source"
              onChange={(event) => updateFilter("q", event.target.value)}
            />
          </label>

          <label className="filter-control">
            <span className="sr-only">Filter by severity</span>
            <select value={severity} onChange={(event) => updateFilter("severity", event.target.value)}>
              <option value="">All severities</option>
              {severityOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>

          <label className="filter-control">
            <span className="sr-only">Filter by status</span>
            <select value={status} onChange={(event) => updateFilter("status", event.target.value)}>
              <option value="">All statuses</option>
              {statusOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>

          <label className="filter-control source-filter">
            <span className="sr-only">Filter by source</span>
            <select value={source} onChange={(event) => updateFilter("source", event.target.value)}>
              <option value="">All sources</option>
              {EVENT_SOURCE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>

          <label className="date-control">
            <span>From</span>
            <input type="date" value={from} onChange={(event) => updateFilter("from", event.target.value)} />
          </label>
          <label className="date-control">
            <span>To</span>
            <input type="date" value={to} onChange={(event) => updateFilter("to", event.target.value)} />
          </label>

          {hasFilters && (
            <Button className="clear-filters" variant="ghost" size="sm" onClick={clearFilters}>
              <X aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </div>

        <EventTable
          events={filteredEvents}
          emptyMessage="No events match these filters. Clear filters to see all events."
        />
        <p className="table-footnote">Received times are shown in UTC. Confidence reflects the available event information.</p>
      </section>
    </section>
  );
}