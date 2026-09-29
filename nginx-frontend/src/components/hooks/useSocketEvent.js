import { useEffect, useRef } from "react";
import { useSocket } from "../../providers/SocketProvider";

export default function useSocketEvent(eventName, handler) {
  const { subscribe } = useSocket();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!eventName) return undefined;

    const unsubscribe = subscribe(eventName, (payload) => {
      handlerRef.current?.(payload);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [eventName, subscribe]);
}
