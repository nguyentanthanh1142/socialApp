import { useCallback, useEffect, useRef, useState } from "react";
import { SocketContext } from "./SocketContext";
import { createSocket } from "../../shared/socket/socket";
import { getDeviceId, getTabId } from "../../shared/device/deviceService";
import { getToken } from "../../shared/storage/localStorageService";

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const listeners = useRef({});
  const [connected, setConnected] = useState(false);

  const connectSocket = useCallback(() => {
    const token = getToken();

    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    }

    const socket = createSocket({
      token,
      deviceId: getDeviceId(),
      tabId: getTabId(),
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.onAny((event, payload) => {
      const handlers = listeners.current[event];
      if (handlers) {
        handlers.forEach((handler) => handler(payload));
      }
    });

    socket.connect();
  }, []);

  useEffect(() => {
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectSocket]);

  const subscribe = useCallback((event, handler) => {
    if (!listeners.current[event]) {
      listeners.current[event] = [];
    }

    listeners.current[event].push(handler);

    return () => {
      listeners.current[event] = (listeners.current[event] || []).filter(
        (current) => current !== handler
      );
    };
  }, []);

  const unSubscribe = useCallback((event, handler) => {
    if (!listeners.current[event]) return;

    listeners.current[event] = listeners.current[event].filter(
      (current) => current !== handler
    );
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        subscribe,
        unSubscribe,
        unsubscribe: unSubscribe,
        reconnect: connectSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};