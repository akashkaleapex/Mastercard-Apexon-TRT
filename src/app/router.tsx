import { createBrowserRouter, Navigate } from "react-router-dom";
import { BRDWorkspace } from "@/features/brd/BRDWorkspace";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/dashboard", element: <BRDWorkspace /> },
  { path: "/queue", element: <BRDWorkspace /> },
  { path: "/trt/:trtId", element: <BRDWorkspace /> },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
