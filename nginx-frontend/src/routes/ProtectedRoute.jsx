// src/routes/ProtectedRoute.jsx
import { useContext, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  isAuthenticated as checkIsAuthenticated,
  isFirstLoginFromStorage
} from "../features/auth/services/authenticationService";
import Spinner from "../components/Spinner";

export default function ProtectedRoute() {
  const { isAuthenticated, isFirstLogin, loading, refresh } = useContext(AuthContext);
  const { pathname } = useLocation();

  const hasValidToken = checkIsAuthenticated();
  const effectiveAuth = isAuthenticated || hasValidToken;

  const effectiveFirstLogin = Boolean(isFirstLogin || isFirstLoginFromStorage());

  useEffect(() => {
    if (hasValidToken && !isAuthenticated && typeof refresh === "function") {
      refresh();
    }
  }, [hasValidToken, isAuthenticated, refresh]);

  if (loading) {
    return <Spinner size="lg" label="Loading authentication..." />;
  }

  if (!effectiveAuth) {
    return <Navigate to="/login" replace state={{ from: pathname }} />;
  }

  if (effectiveFirstLogin && pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (!effectiveFirstLogin && pathname === "/onboarding") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}