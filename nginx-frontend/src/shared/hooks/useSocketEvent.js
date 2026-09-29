import { useEffect, useRef } from "react";
import { useSocket } from "../../providers/SocketProvider";

/**
 * Subscribe to a socket event with a stable handler reference.
 */
export default function useSocketEvent(eventName, handler) {
  const { subscribe } = useSocket();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!eventName) return undefined;

    return subscribe(eventName, (payload) => {
      handlerRef.current?.(payload);
    });
  }, [eventName, subscribe]);
}
