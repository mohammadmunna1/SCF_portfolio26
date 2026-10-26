import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { adminApi } from "./api";
import { Spinner } from "./ui";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    adminApi
      .me()
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (email, password) => setAdmin(await adminApi.login(email, password)), []);
  const logout = useCallback(async () => {
    await adminApi.logout().catch(() => {});
    setAdmin(null);
  }, []);

  /** Call with any API error: an expired session sends the admin back to the login page. */
  const handleError = useCallback((error) => {
    if (error?.status === 401) setAdmin(null);
  }, []);

  const value = useMemo(() => ({ admin, checking, login, logout, handleError }), [admin, checking, login, logout, handleError]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export function RequireAuth({ children }) {
  const { admin, checking } = useAuth();
  const location = useLocation();
  if (checking) return <Spinner label="Checking session" />;
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
}
