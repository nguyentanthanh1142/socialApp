// src/hooks/useAuth.js
import { useState, useCallback, useEffect } from "react";
import {
  logIn,
  logOut,
  checkAuthApi,
  isAuthenticated as checkIsAuthenticated,
  isFirstLoginFromStorage,
  clearFirstLoginFlag,
  getCurrentUserId,
} from "../features/auth/services/authenticationService";
import {
  getToken,
  removeToken,
  setFirstLogin,
  removeFirstLogin,
  KEY_TOKEN,
  KEY_FIRST_LOGIN,
} from "../storage/localStorageService";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkIsAuthenticated());

  const [isFirstLogin, setIsFirstLogin] = useState(() => Boolean(isFirstLoginFromStorage()));

  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Xác thực phiên làm việc hiện tại với Backend bằng checkAuthApi
   */
  const verifySession = useCallback(async () => {
    const token = getToken();

    // 1. Không có token hoặc token quá hạn client-side -> Reset trạng thái
    if (!token || !checkIsAuthenticated()) {
      setIsAuthenticated(false);
      setIsFirstLogin(false);
      setUserId(null);
      setUser(null);
      setLoading(false);
      return;
    }

    // 2. Có token -> Gọi API check-auth xác nhận với Server
    try {
      setLoading(true);
      setError(null);
      const data = await checkAuthApi();

      if (data?.code === 1000 && data?.result?.authenticated) {
        const { firstLogin: serverFirstLogin, user: userData } = data.result;

        setIsAuthenticated(true);
        setIsFirstLogin(Boolean(serverFirstLogin));
        setUser(userData || null);
        setUserId(userData?.id || getCurrentUserId());

        // Đồng bộ lại cờ firstLogin dưới LocalStorage
        if (serverFirstLogin) {
          setFirstLogin(true);
        } else {
          removeFirstLogin();
        }
      } else {
        throw new Error("Invalid session");
      }
    } catch (err) {
      console.error("Session verification failed:", err);
      removeToken();
      removeFirstLogin();
      setIsAuthenticated(false);
      setIsFirstLogin(false);
      setUserId(null);
      setUser(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chạy check-auth ngay khi app/hook mount
  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // Lắng nghe thay đổi Storage từ các Tab khác
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (
        e.key === KEY_TOKEN ||
        e.key === KEY_FIRST_LOGIN ||
        e.key === "accessToken" ||
        e.key === "social_app_first_login" ||
        e.key === null
      ) {
        verifySession();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [verifySession]);

  const login = useCallback(
    async (username, password) => {
      setLoading(true);
      setError(null);
      try {
        const u = typeof username === "object" ? username.username : username;
        const p = typeof username === "object" ? username.password : password;
        const response = await logIn(u, p);

        await verifySession();
        return response;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [verifySession]
  );

  const logout = useCallback(() => {
    logOut();
    setIsAuthenticated(false);
    setIsFirstLogin(false);
    setUserId(null);
    setUser(null);
  }, []);

  const completeOnboardingFlag = useCallback(() => {
    clearFirstLoginFlag();
    setIsFirstLogin(false);
  }, []);

  return {
    isAuthenticated,
    isFirstLogin,
    userId,
    user,
    loading,
    error,
    login,
    logout,
    verifySession,
    completeOnboardingFlag,
    getCurrentUserId,
  };
};

export default useAuth;