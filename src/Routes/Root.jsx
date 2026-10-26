import { createBrowserRouter } from "react-router-dom";
import NotFound from "../Components/NotFound";
import ProjectsDetails from "../Components/ProjectsDetails";
import Home from "../Layouts/Home";
import SiteLayout from "../Layouts/SiteLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SiteLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "projects", element: <ProjectsDetails /> },
      // Original URL of the projects page, kept so existing links keep working.
      { path: "ProjectsDetails", element: <ProjectsDetails /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    // The admin panel is a separate bundle, only downloaded when visiting /admin.
    path: "/admin/*",
    hydrateFallbackElement: <div className="min-h-screen bg-canvas" />,
    lazy: async () => {
      const { default: Component } = await import("../admin/AdminApp");
      return { Component };
    },
  },
]);
