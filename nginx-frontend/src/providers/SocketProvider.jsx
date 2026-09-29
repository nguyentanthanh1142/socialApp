import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createSocket } from "../services/socketService";
import { getDeviceId, getTabId } from "../services/deviceService";
import { getToken } from "../storage/localStorageService";
import { AuthContext } from "../context/AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const isAuth = authContext?.isAuthenticated;

  const socketRef = useRef(null);
  const listeners = useRef({});
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  const connectSocket = useCallback(() => {
    const token = getToken();

    if (!token) {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setConnected(false);
      return;
    }

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    }

    const nextSocket = createSocket({
      token,
      deviceId: getDeviceId(),
      tabId: getTabId(),
    });

    if (!nextSocket) {
      setSocket(null);
      setConnected(false);
      return;
    }

    socketRef.current = nextSocket;
    setSocket(nextSocket);

    nextSocket.on("connect", () => setConnected(true));
    nextSocket.on("disconnect", () => setConnected(false));
    nextSocket.onAny((event, payload) => {
      const handlers = listeners.current[event];

      console.log(`🔥 [SOCKET DEBUG] Event name:`, event);
      console.log(`🔥 [SOCKET DEBUG] Raw data received:`, payload);
      if (handlers) {
        handlers.forEach((handler) => handler(payload));
      }
    });

    nextSocket.connect();
  }, []);

  useEffect(() => {
    if (isAuth || getToken()) {
      connectSocket();
    } else {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setConnected(false);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectSocket, isAuth]);

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

  const emit = useCallback((event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log(`📤 [SOCKET EMIT] Sending event "${event}":`, data);
      socketRef.current.emit(event, data);
    } else {
      console.warn(`⚠️ [SOCKET] Cannot emit "${event}", socket is not connected!`);
    }
  }, []);

  const value = useMemo(
    () => ({
      socket,
      connected,
      subscribe,
      unSubscribe,
      unsubscribe: unSubscribe,
      reconnect: connectSocket,
      emit,
    }),
    [socket, connected, subscribe, unSubscribe, connectSocket, emit]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return context;
};