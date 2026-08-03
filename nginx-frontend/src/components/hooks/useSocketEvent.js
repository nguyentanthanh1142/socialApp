import { useEffect } from "react";
import { useSocket } from "../../providers/";

export default function useSocketEvent(event, handler) {
    const {socket} = useSocket();

    useEffect(() => {
    if (!socket || !eventName || !handler) return;

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, eventName, handler]);
}