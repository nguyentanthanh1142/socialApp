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

  // 🟢 Kiểm tra 2 lớp: Context State HOẶC LocalStorage
  const effectiveFirstLogin = Boolean(isFirstLogin || isFirstLoginFromStorage());

  useEffect(() => {
    if (hasValidToken && !isAuthenticated && typeof refresh === "function") {
      refresh();
    }
  }, [hasValidToken, isAuthenticated, refresh]);

  // 1. Loading
  if (loading) {
    return <Spinner size="lg" label="Loading authentication..." />;
  }

  // 2. Chưa đăng nhập
  if (!effectiveAuth) {
    return <Navigate to="/login" replace state={{ from: pathname }} />;
  }

  // 3. User đăng nhập lần đầu -> Ép sang /onboarding
  if (effectiveFirstLogin && pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // 4. Đã xong onboarding mà cố truy cập /onboarding -> Đẩy về Home
  if (!effectiveFirstLogin && pathname === "/onboarding") {
    return <Navigate to="/" replace />;
  }

  // 5. Render child route
  return <Outlet />;
}