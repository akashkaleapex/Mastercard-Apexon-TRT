import { createBrowserRouter } from "react-router-dom";
import { BRDWorkspace } from "@/features/brd/BRDWorkspace";
import { PortalLanding } from "@/features/pages/PortalLanding";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <PortalLanding />,
  },
  
  {
    path: "/brd/*",
    element: <BRDWorkspace />,
  },
  {
    path: "/trt/*",
    element: <BRDWorkspace />,
  },
]);