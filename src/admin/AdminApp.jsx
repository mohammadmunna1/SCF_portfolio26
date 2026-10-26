import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SITE_NAME } from "../../shared/site.js";
import { clearTheme } from "../lib/theme";
import AdminLayout from "./AdminLayout";
import { AuthProvider, RequireAuth } from "./auth";
import AccountPage from "./pages/AccountPage";
import BackupPage from "./pages/BackupPage";
import CollectionPage from "./pages/CollectionPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import ThemePage from "./pages/ThemePage";
import { ToastProvider } from "./Toast";

/** The admin panel (lazy-loaded at /admin). */
export default function AdminApp() {
  useEffect(() => {
    // The admin always uses the default palette, so a custom one can never make it hard to use.
    clearTheme();
    const previous = document.title;
    document.title = `Admin · ${SITE_NAME}`;
    // Keep the admin out of search engines.
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => {
      document.title = previous;
      robots.remove();
    };
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="theme" element={<ThemePage />} />
            <Route path="collections/:name" element={<CollectionPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="backup" element={<BackupPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
