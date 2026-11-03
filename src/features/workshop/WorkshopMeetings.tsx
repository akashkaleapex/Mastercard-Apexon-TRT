import { ArrowLeft, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import "@/features/workshop/workshop.css";

export function WorkshopMeetings() {
  return (
    <main className="workshop-route">
      <header><Link to="/" aria-label="Back to workspace selection"><ArrowLeft size={17} />Workspace selection</Link><span>MASTERCARD · APEXON</span></header>
      <section><span className="workshop-route-icon"><CalendarDays size={21} /></span><p className="workshop-route-eyebrow">WORKSHOP MEETINGS</p><h1>Workshop workspace</h1><p>The Workshop Meetings implementation and its routes are not present in this checkout. This route is kept separate from the BRD investigation application.</p><Link className="workshop-route-link" to="/">Return to workspace selection <ArrowLeft size={14} /></Link></section>
    </main>
  );
}