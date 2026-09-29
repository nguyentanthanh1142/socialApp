import React, { Suspense } from "react";
import { AuthContext } from "./AuthContext";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/Spinner";

export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  // Hiển thị Spinner toàn ứng dụng trong lúc gọi check-auth xác minh phiên
  if (auth.loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spinner size="lg" label="Checking session..." />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <Suspense fallback={<Spinner size="lg" label="Loading…" />}>
        {children}
      </Suspense>
    </AuthContext.Provider>
  );
};

export default AuthProvider;