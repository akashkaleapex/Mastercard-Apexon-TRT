import {
  Activity,
  BrainCircuit,
  ClipboardCheck,
  LayoutDashboard,
  ListFilter,
  MessageSquareText,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const navigation = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Events", to: "/events", icon: ListFilter },
  { label: "Actions", to: "/actions", icon: ClipboardCheck },
  { label: "Memory", to: "/memory", icon: BrainCircuit },
];

export function AppShell() {
  const { pathname } = useLocation();
  const eventId = pathname.match(/^\/events\/([^/]+)/)?.[1];
  const isCopilotRoute = pathname.endsWith("/copilot");
  const contextualNavigation = eventId
    ? [...navigation, {
        label: "AI Co-Pilot",
        to: `/events/${eventId}/copilot`,
        icon: MessageSquareText,
      }]
    : navigation;

  return (
    <div className={`app-frame${isCopilotRoute ? " app-frame-copilot" : ""}`}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <aside className="sidebar">
        <NavLink className="brand" to="/dashboard" aria-label="TRT Operations dashboard">
          <span className="brand-icon">
            <Activity aria-hidden="true" />
          </span>
          <span className="brand-copy">
            <span className="brand-partners">Mastercard · Apexon</span>
            <span className="brand-name">TRT Operations</span>
          </span>
        </NavLink>

        <nav className="primary-nav" aria-label="Primary navigation">
          <span className="nav-caption">WORKSPACE</span>
          {contextualNavigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard" || to === "/events" || to.endsWith("/copilot")}
              className={({ isActive }) =>
                `nav-link${
                  isActive || (to === "/events" && Boolean(eventId) && !isCopilotRoute)
                    ? " nav-link-active"
                    : ""
                }`
              }
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="environment-indicator" aria-hidden="true" />
          <span className="environment-copy">
            <span>Operations center</span>
            <small>Event review workspace</small>
          </span>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-context">
            <span className="topbar-overline">TRT WORKSPACE</span>
            <span className="topbar-divider" aria-hidden="true" />
            <span className="topbar-current">Risk operations</span>
          </div>
          <span className="topbar-current">Analyst workspace</span>
        </header>

        <main className="main-content" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>

        <footer className="workspace-footer">
          Transaction risk operations
        </footer>
      </div>
    </div>
  );
}