import { useEffect } from "react";
import { useSocket } from "../../app/providers/useSocket";

export const useNotificationSocket = (handler) => {
  const { subscribe } = useSocket();

  useEffect(() => {
    if (!handler) return undefined;

    const unsubscribe = subscribe("notification_message", handler);
    return () => unsubscribe && unsubscribe();
  }, [handler, subscribe]);
};
            prev.includes(conversationId) ? prev : [...prev, conversationId];

