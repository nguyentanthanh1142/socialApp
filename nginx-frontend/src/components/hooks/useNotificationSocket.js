import { useEffect, useRef } from "react";
import { useSocket } from "../../providers/SocketProvider";

export const useNotificationSocket = (handler) => {
  const { subscribe } = useSocket();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const unsubscribe = subscribe("notification_message", (payload) => {
      handlerRef.current?.(payload);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [subscribe]);
};
