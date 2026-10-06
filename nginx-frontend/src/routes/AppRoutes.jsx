// src/routes/AppRoutes.jsx
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute"; // 1. Import PublicRoute
import Spinner from "../components/Spinner";

// ── Public pages ─────────────────────────────────────────────────────────────

const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const Authenticate = lazy(() => import("../features/auth/pages/Authenticate"));
const VerifyEmailSent = lazy(() => import("../features/auth/pages/VerifyEmailSent"));

// ── Authenticated user pages ──────────────────────────────────────────────────

const Home = lazy(() => import("../features/feed/pages/Home"));
const Profile = lazy(() => import("../features/profile/pages/Profile"));
const ProfileFacebook = lazy(() => import("../features/profile/pages/ProfileFacebook"));
const Friends = lazy(() => import("../features/friends/pages/Friends"));
const Chat = lazy(() => import("../features/chat/pages/Chat"));
const UserOnboarding = lazy(() => import("../features/auth/pages/UserOnboarding"));


const AppRoutes = () => {
  return (
    <Suspense fallback={<Spinner size="lg" label="Loading..." />}>
      <Routes>
        {/* ── Public routes (chặn user đã đăng nhập truy cập lại) ─────────────── */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/authenticated" element={<Authenticate />} />
          <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
        </Route>

        {/* ── Authenticated user routes (guarded by ProtectedRoute) ─────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/u/:username" element={<ProfileFacebook />} />
          <Route path="/onboarding" element={<UserOnboarding />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense >
  );
};

export default AppRoutes;