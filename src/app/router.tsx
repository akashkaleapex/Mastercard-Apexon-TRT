import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { BRDWorkspace } from "@/features/brd/BRDWorkspace";
import { PortalLanding } from "@/features/pages/PortalLanding";
import { WorkshopMeetings } from "@/features/workshop/WorkshopMeetings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PortalLanding />,
  },
  {
    path: "/workshop/*",
    element: <WorkshopMeetings />,
  },
  {
    path: "/brd/*",
    element: <BRDWorkspace />,
  },
  {
    path: "/trt/*",
    element: <BRDWorkspace />,
  },
  {
    path: "/*",
    element: <AppShell />,
  },
]);