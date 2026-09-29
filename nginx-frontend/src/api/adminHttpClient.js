import axios from "axios";
import { CONFIG } from "../configurations/configuration";

export const adminHttpClient = axios.create({
  baseURL: CONFIG.API_GATEWAY,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

adminHttpClient.interceptors.response.use(
  // Success interceptor: log request URL and status
  (response) => {
    const requestUrl = response?.config?.url || "";
    console.log(`[adminHttpClient] SUCCESS ${requestUrl} → ${response.status}`);
    return response;
  },

  // Error interceptor: log request URL, status and error object
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    console.log(`[adminHttpClient] ERROR ${requestUrl} → ${status}`);
    console.log(error);
    if (
      status === 401 &&
      window.location.pathname.startsWith("/admin") &&
      window.location.pathname !== "/admin/login"
    ) {
      window.location.replace("/admin/login");
    }
    return Promise.reject(error);
  }
);

export default adminHttpClient;
