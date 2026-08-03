import { io } from "socket.io-client";
import { getToken } from "../storage/localStorageService";
import { getDeviceId, getTabId } from "../device/deviceService";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8999";

let socketInstance = null;

export const createSocket = ({ token, deviceId, tabId } = {}) => {
  const authToken = token || getToken();

  if (!authToken) {
    return null;
  }

  socketInstance = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false,
    query: {
      token: authToken,
      deviceId: deviceId || getDeviceId(),
      tabId: tabId || getTabId(),
    },
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