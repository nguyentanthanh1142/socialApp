import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AdminAuthContext } from "../context/AdminAuthContext";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";

const AdminProtectedRoute = () => {
  const { isAuthenticated, loading, error, refresh } = useContext(AdminAuthContext);

  if (loading) {
    return <Spinner size="lg" label="Verifying access…" />;
  }

  if (error) {
    return (
      <ErrorBanner
        title="Cannot connect to the server"
        message="A network error occurred, or the server is temporarily unavailable. Please try again."
        onRetry={refresh}
        retryLabel="Retry"
      />
    );
  }

  if (isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;