import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDemoTimestamp } from "@/mocks/shared/timestamps";
import type { TrtEvent, EventSeverity, EventStatus } from "@/types/events";

type EventTableProps = {
  events: TrtEvent[];
  emptyMessage: string;
};

const severityClasses: Record<EventSeverity, string> = {
  Critical: "severity-critical",
  High: "severity-high",
  Medium: "severity-medium",
  Low: "severity-low",
};

const statusPresentation: Record<
  EventStatus,
  { className: string; icon: typeof Clock3 }
> = {
  "Ready for review": { className: "status-ready", icon: Clock3 },
  "Analysis prepared": { className: "status-prepared", icon: CheckCircle2 },
  "Data incomplete": { className: "status-incomplete", icon: AlertTriangle },
};

export function EventTable({ events, emptyMessage }: EventTableProps) {
  if (events.length === 0) {
    return <p className="table-empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="event-table-scroll" role="region" aria-label="Event results" tabIndex={0}>
      <table className="event-table">
        <thead>
          <tr>
            <th scope="col">Event</th>
            <th scope="col">Severity</th>
            <th scope="col">Received (UTC)</th>
            <th scope="col">Status</th>
            <th scope="col">Source</th>
            <th scope="col">Merchants / PANs</th>
            <th scope="col">Confidence</th>
            <th scope="col"><span className="sr-only">Review</span></th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const StatusIcon = statusPresentation[event.status].icon;

            return (
              <tr key={event.id}>
                <th scope="row">
                  <Link className="event-id-link" to={`/events/${event.id}`}>
                    {event.id}
                  </Link>
                </th>
                <td>
                  <span className={`severity-label ${severityClasses[event.severity]}`}>
                    <span aria-hidden="true" className="severity-dot" />
                    {event.severity}
                  </span>
                </td>
                <td className="event-time">{formatDemoTimestamp(event.receivedAt)}</td>
                <td>
                  <span className={`event-status ${statusPresentation[event.status].className}`}>
                    <StatusIcon aria-hidden="true" />
                    {event.status}
                  </span>
                </td>
                <td>{event.source}</td>
                <td>{event.merchantCount} / {event.panCount}</td>
                <td>
                  {event.demoConfidence === null
                    ? "Not scored"
                    : `${event.demoConfidence}%`}
                </td>
                <td>
                  <Link className="table-action" to={`/events/${event.id}`}>
                    Review
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}