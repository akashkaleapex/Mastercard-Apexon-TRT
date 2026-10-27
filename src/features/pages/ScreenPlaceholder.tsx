import { ArrowUpRight, Clock3, PanelsTopLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

type ScreenPlaceholderProps = {
  title: string;
  section: string;
  phase: string;
  description: string;
};

export function ScreenPlaceholder({
  title,
  section,
  phase,
  description,
}: ScreenPlaceholderProps) {
  const { eventId } = useParams();

  return (
    <section className="screen-page" aria-labelledby="screen-title">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">{section}</p>
          <h1 id="screen-title">{title}</h1>
          {eventId && <p className="event-context">Event {eventId}</p>}
        </div>
        <span className="phase-badge">
          <Clock3 aria-hidden="true" />
          {phase}
        </span>
      </div>

      <div className="planned-state">
        <span className="planned-icon">
          <PanelsTopLeft aria-hidden="true" />
        </span>
        <div className="planned-copy">
          <p className="planned-kicker">Route ready</p>
          <h2>Screen content is planned</h2>
          <p>{description}</p>
          <Link className="text-link" to="/dashboard">
            Back to dashboard
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}