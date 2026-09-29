import { io } from "socket.io-client";
import { CONFIG } from "../configurations/configuration";
import { getToken } from "../storage/localStorageService";
import { getDeviceId, getTabId } from "./deviceService";

let socketInstance = null;

const resolveSocketUrl = () => {
  const fromRuntime = window._env_?.REACT_APP_SOCKET_URL;
  if (fromRuntime && fromRuntime.trim() && !fromRuntime.startsWith("$")) {
    return fromRuntime;
  }
  if (CONFIG.SOCKET_URL && !String(CONFIG.SOCKET_URL).startsWith("$")) {
    return CONFIG.SOCKET_URL;
  }
  // Same-origin via Nginx /socket.io proxy in production
  return window.location.origin;
};

export const createSocket = ({ token, deviceId, tabId } = {}) => {
  const authToken = token || getToken();

  if (!authToken) {
    console.warn("⚠️ [SOCKET] Cannot create socket: Missing auth token!");
    return null;
  }

  const socketUrl = resolveSocketUrl();
  console.log("🔌 [SOCKET] Connecting to URL:", socketUrl);

  socketInstance = io(socketUrl, {
    transports: ["websocket"],
    autoConnect: true, // ĐỔI THÀNH true ĐỂ NÓ TỰ ĐỘNG KẾT NỐI LUÔN!
    query: {
      token: authToken,
      deviceId: deviceId || getDeviceId(),
      tabId: tabId || getTabId(),
    },
  });

  // Thêm log để bắt sự kiện kết nối thành công hay thất bại ngay tại đây
  socketInstance.on("connect", () => {
    console.log("✅ [SOCKET] Connected successfully! ID:", socketInstance.id);
  });

  socketInstance.on("connect_error", (err) => {
    console.error("❌ [SOCKET] Connection Error:", err.message);
  });

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (!socketInstance) return;

  socketInstance.removeAllListeners();
  socketInstance.disconnect();
  socketInstance = null;
};

export const reconnectSocket = (token) => {
  disconnectSocket();
  return createSocket({ token });
};