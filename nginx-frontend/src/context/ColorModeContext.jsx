// src/context/ColorModeContext.jsx
import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { getThemeMode, setThemeMode } from "../storage/localStorageService";

/**
 * Provides `mode` ('light' | 'dark'), `toggleColorMode()`, and `setMode(mode)`.
 * Persisted in localStorage under the key `social_app_theme_mode`.
 */
export const ColorModeContext = createContext({
  mode: "light",
  toggleColorMode: () => {},
  setMode: (_mode) => {},
});

export const ColorModeProvider = ({ children }) => {
  // Initialize from localStorage, fall back to system preference, then 'light'
  const [mode, setModeState] = useState(() => {
    const stored = getThemeMode();
    if (stored === "light" || stored === "dark") return stored;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  const toggleColorMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      setThemeMode(next);
      return next;
    });
  }, []);

  const setMode = useCallback((newMode) => {
    if (newMode !== "light" && newMode !== "dark") return;
    setThemeMode(newMode);
    setModeState(newMode);
  }, []);

  const value = useMemo(
    () => ({ mode, toggleColorMode, setMode }),
    [mode, toggleColorMode, setMode]
  );

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
};

/** Convenience hook — throws if used outside ColorModeProvider */
export const useColorMode = () => {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error("useColorMode must be used within ColorModeProvider");
  return ctx;
};

export default ColorModeContext;
