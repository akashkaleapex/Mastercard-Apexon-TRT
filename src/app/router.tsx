import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { CopilotPage } from "@/features/copilot/CopilotPage";
import { ActionReviewPage } from "@/features/actions/ActionReviewPage";
import { EventAnalysisPage } from "@/features/events/EventAnalysisPage";
import { EventsPage } from "@/features/events/EventsPage";
import { MemoryPage } from "@/features/memory/MemoryPage";
import { ScreenPlaceholder } from "@/features/pages/ScreenPlaceholder";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "events",
        element: <EventsPage />,
      },
      {
        path: "events/:eventId",
        element: <EventAnalysisPage />,
      },
      {
        path: "events/:eventId/copilot",
        element: <CopilotPage />,
      },
      {
        path: "events/:eventId/actions",
        element: <ActionReviewPage />,
      },
      {
        path: "actions",
        element: (
          <ScreenPlaceholder
            title="Action queue"
            section="Workspace"
            phase="Pending confirmation"
            description="This proposed cross-event screen needs confirmation before its contents are implemented."
          />
        ),
      },
      {
        path: "memory",
        element: <MemoryPage />,
      },
      {
        path: "intake",
        element: (
          <ScreenPlaceholder
            title="Event intake"
            section="Workspace"
            phase="Conditional"
            description="Sample-file intake will be added only if the input path is approved."
          />
        ),
      },
      {
        path: "settings",
        element: (
          <ScreenPlaceholder
            title="Settings"
            section="Workspace"
            phase="Not defined"
            description="Settings behavior has not been specified in the reviewed requirements."
          />
        ),
      },
      {
        path: "*",
        element: (
          <ScreenPlaceholder
            title="Page not found"
            section="Workspace"
            phase="404"
            description="This route does not match a planned screen. Use the navigation to return to the workspace."
          />
        ),
      },
    ],
  },
]);