// src/App.jsx
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";

// ── Context & Providers ────────────────────────────────────────────────────
import { AuthProvider } from "./context/AuthProvider";
import { AdminAuthProvider } from "./context/AdminAuthProvider";
import { UserProvider } from "./providers/UserProvider";
import { SocketProvider } from "./providers/SocketProvider";
import { ChatProvider } from "./providers/ChatProvider";

// ── Theme Provider (ColorModeContext + MUI ThemeProvider + CssBaseline) ────
import ThemeProviderWrapper from "./providers/ThemeProviderWrapper";

// ── Shared UI primitives ──
import Spinner from "./components/Spinner";

// ── Route guards ──
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import AppRoutes from "./routes/AppRoutes";

// ── Admin pages — lazy-loaded for code splitting ──
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminLayout = lazy(() => import("./features/admin/pages/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const PostManagement = lazy(() => import("./pages/admin/PostManagement"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));

function App() {
  return (
    <ThemeProviderWrapper>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <SocketProvider>
              <ChatProvider>
                <Routes>
                  {/* ── Admin Routes ── */}
                  <Route
                    path="/admin"
                    element={
                      <AdminAuthProvider>
                        <Suspense fallback={<Spinner size="lg" label="Loading module..." />}>
                          <Outlet />
                        </Suspense>
                      </AdminAuthProvider>
                    }
                  >
                    {/* Public admin login: /admin/login */}
                    <Route path="login" element={<AdminLogin />} />

                    {/* Protected admin route group: /admin/* */}
                    <Route element={<AdminProtectedRoute />}>
                      <Route element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="posts" element={<PostManagement />} />
                        <Route path="audit-logs" element={<AuditLogs />} />
                      </Route>
                    </Route>
                  </Route>

                  {/* ── All client / chat routes ───────────────────────────── */}
                  <Route path="/*" element={<AppRoutes />} />
                </Routes>
              </ChatProvider>
            </SocketProvider>
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProviderWrapper>
  );
}

export default App;