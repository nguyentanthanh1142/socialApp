import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  adminLogIn,
  adminLogOut,
  isAdminAuthenticated,
} from "../services/admin/adminAuthService";

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async (abortSignal) => {
    console.log("🔄 [useAdminAuth] Chạy refresh check-auth... Signal aborted:", abortSignal?.aborted);
    setLoading(true);
    setError(null);

    try {
      const auth = await isAdminAuthenticated({ signal: abortSignal });
      console.log("📥 [useAdminAuth] Kết quả isAdminAuthenticated:", auth, "| Signal aborted:", abortSignal?.aborted);

      if (!abortSignal?.aborted) {
        console.log("✅ [useAdminAuth] Cập nhật State: isAuthenticated =", !!auth);
        setIsAuthenticated(!!auth);
      } else {
        console.warn("⚠️ [useAdminAuth] Request đã bị ABORT -> Bỏ qua set isAuthenticated");
      }
    } catch (err) {
      const isCanceled =
        abortSignal?.aborted ||
        axios.isCancel(err) ||
        err.name === "CanceledError" ||
        err.code === "ERR_CANCELED";

      console.log("❌ [useAdminAuth] Bắt lỗi Catch:", err.name, "| Is Canceled?:", isCanceled);

      if (isCanceled) return;

      setError(err);
      setIsAuthenticated(false);
    } finally {
      if (!abortSignal?.aborted) {
        console.log("🏁 [useAdminAuth] Tắt Loading (setLoading = false)");
        setLoading(false);
      } else {
        console.warn("🛑 [useAdminAuth] Signal bị ABORT -> GIỮ loading = true cho request kế tiếp!");
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    console.log("🚀 [useAdminAuth] Mount Component -> Khởi tạo AbortController");
    refresh(controller.signal);

    return () => {
      console.log("🧹 [useAdminAuth] Cleanup -> Gọi controller.abort()");
      controller.abort();
    };
  }, [refresh]);

  const doLogin = useCallback(
    async (credentials) => {
      setLoading(true);
      setError(null);
      try {
        await adminLogIn(credentials);
        await refresh();
      } catch (err) {
        setError(err);
        setIsAuthenticated(false);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const doLogout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await adminLogOut();
      setIsAuthenticated(false);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isAuthenticated,
    loading,
    error,
    login: doLogin,
    logout: doLogout,
    refresh,
  };
};

export default useAdminAuth;