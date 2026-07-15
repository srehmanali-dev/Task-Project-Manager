import { createBrowserRouter, Navigate } from "react-router";
import { PageNotFound, RouteLoadError } from "@superblocksteam/library";
import RegisteredApp from "./App.js";

export const router = createBrowserRouter([
  {
    Component: RegisteredApp,
    errorElement: <RouteLoadError />,
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "/dashboard",
        lazy: () =>
          import("./pages/Dashboard/index.js").then((mod) => ({
            Component: mod.default,
          })),
      },
      {
        path: "/projects",
        lazy: () =>
          import("./pages/Projects/index.js").then((mod) => ({
            Component: mod.default,
          })),
      },
      {
        path: "/projects/:projectId",
        lazy: () =>
          import("./pages/ProjectDetail/index.js").then((mod) => ({
            Component: mod.default,
          })),
      },
      {
        path: "/members",
        lazy: () =>
          import("./pages/Members/index.js").then((mod) => ({
            Component: mod.default,
          })),
      },
      {
        path: "*",
        Component: () => (
          <PageNotFound
            title="Page not found"
            errorMessage="Content not found"
            buttonPath="/dashboard"
            buttonText="Go to Dashboard"
          />
        ),
      },
    ],
  },
]);
