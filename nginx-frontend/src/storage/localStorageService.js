import { jwtDecode } from "jwt-decode";

export const KEY_TOKEN = "accessToken";
export const KEY_FIRST_LOGIN = "social_app_first_login";
export const KEY_THEME = "social_app_theme_mode";

export const setToken = (token) => {
  localStorage.setItem(KEY_TOKEN, token);
};

export const getToken = () => localStorage.getItem(KEY_TOKEN);

export const removeToken = () => localStorage.removeItem(KEY_TOKEN);

export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// ── First-login flag ────────────────────────────────────────────────────────
export const setFirstLogin = (value) =>
  localStorage.setItem(KEY_FIRST_LOGIN, JSON.stringify(Boolean(value)));

export const getFirstLogin = () => {
  const raw = localStorage.getItem(KEY_FIRST_LOGIN);
  if (raw === null) return false;
  try { return JSON.parse(raw); } catch { return false; }
};

export const removeFirstLogin = () => localStorage.removeItem(KEY_FIRST_LOGIN);

// ── Theme mode ──────────────────────────────────────────────────────────────
export const setThemeMode = (mode) =>
  localStorage.setItem(KEY_THEME, mode);

export const getThemeMode = () =>
  localStorage.getItem(KEY_THEME) || "light";
