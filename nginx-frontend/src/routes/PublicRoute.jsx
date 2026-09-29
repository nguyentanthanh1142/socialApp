// src/routes/PublicRoute.jsx
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Spinner from "../components/Spinner";

export default function PublicRoute() {
    const { isAuthenticated, user, loading } = useContext(AuthContext);

    // 1. Chờ khôi phục session/token
    if (loading) {
        return <Spinner size="lg" label="Checking status..." />;
    }

    // 2. Nếu đã đăng nhập -> Kiểm tra xem có cần Onboarding không
    if (isAuthenticated) {
        const needsOnboarding = Boolean(user?.isFirstLogin || !user?.username);
        return <Navigate to={needsOnboarding ? "/onboarding" : "/"} replace />;
    }

    // 3. Chưa đăng nhập -> Cho phép xem Login/Register/Authenticate
    return <Outlet />;
}