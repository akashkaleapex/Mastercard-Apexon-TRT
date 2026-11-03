import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/AppShell";

export const router = createBrowserRouter([
  {
    path: "/*",
    element: <AppShell />,
  },
]);