// src/context/AuthContext.jsx
import { createContext } from "react";

/**
 * Default shape of AuthContext.
 * `isFirstLogin` drives the onboarding redirect in ProtectedRoute.
 * `completeOnboardingFlag` should be called after the onboarding API succeeds
 * to update in-memory state without a full page refresh.
 */
export const AuthContext = createContext({
  isAuthenticated: false,
  isFirstLogin: false,
  loading: false,
  error: null,
  login: async () => { },
  logout: async () => { },
  refresh: async () => { },
  completeOnboardingFlag: () => { },
});
