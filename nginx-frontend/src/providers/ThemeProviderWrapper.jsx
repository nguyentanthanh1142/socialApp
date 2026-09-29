// src/providers/ThemeProviderWrapper.jsx
import React, { useMemo } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ColorModeProvider, useColorMode } from "../context/ColorModeContext";

/**
 * Inner component that consumes ColorModeContext to build the MUI theme.
 * Must be a child of ColorModeProvider so useColorMode() works.
 */
function MuiThemeConsumer({ children }) {
  const { mode } = useColorMode();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                // ── Light palette ──────────────────────────────────────────
                primary:   { main: "#1877f2" },
                secondary: { main: "#42b72a" },
                background: { default: "#f0f2f5", paper: "#ffffff" },
                text: { primary: "#050505", secondary: "#65676b" },
              }
            : {
                // ── Dark palette ───────────────────────────────────────────
                primary:   { main: "#2d88ff" },
                secondary: { main: "#42b72a" },
                background: { default: "#18191a", paper: "#242526" },
                text: { primary: "#e4e6eb", secondary: "#b0b3b8" },
              }),
        },
        typography: {
          fontFamily: "'Inter', system-ui, sans-serif",
          button: { textTransform: "none" },
        },
        shape: { borderRadius: 8 },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: ({ theme: t }) => ({
                backgroundColor: t.palette.mode === "dark" ? "#242526" : "#ffffff",
                color:           t.palette.mode === "dark" ? "#e4e6eb" : "#050505",
                boxShadow:       "0 1px 3px rgba(0,0,0,.12)",
              }),
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: ({ theme: t }) => ({
                backgroundColor: t.palette.background.paper,
                borderRight: "none",
              }),
            },
          },
          MuiButton: {
            styleOverrides: {
              root: { borderRadius: 6, fontWeight: 600 },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: { borderRadius: 12 },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline normalises browser styles and applies palette.background.default */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

/**
 * ThemeProviderWrapper — outermost provider that should wrap <BrowserRouter>.
 * It nests:
 *   ColorModeProvider  (manages mode state + localStorage persistence)
 *     └─ MuiThemeConsumer  (builds MUI theme from mode, applies ThemeProvider + CssBaseline)
 *         └─ children
 */
export default function ThemeProviderWrapper({ children }) {
  return (
    <ColorModeProvider>
      <MuiThemeConsumer>{children}</MuiThemeConsumer>
    </ColorModeProvider>
  );
}
