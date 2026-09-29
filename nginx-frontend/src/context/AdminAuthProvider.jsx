import React, { Suspense } from "react";
import { AdminAuthContext } from "./AdminAuthContext";
import { useAdminAuth } from "../hooks/useAdminAuth";
import Spinner from "../components/Spinner";

export const AdminAuthProvider = ({ children }) => {
  const adminAuth = useAdminAuth();

  return (
    <AdminAuthContext.Provider value={adminAuth}>
      <Suspense fallback={<Spinner size="lg" label="Verifying access…" />}>
        {children}
      </Suspense>
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
