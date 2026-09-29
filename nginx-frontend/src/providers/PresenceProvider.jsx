import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSocket } from "./SocketProvider";
import { getPresencesBatch } from "../services/presenceService";

const PresenceContext = createContext({});

export const PresenceProvider = ({ children, userIds = [] }) => {
  const { subscribe } = useSocket();
  const [presences, setPresences] = useState({});

  const stableUserIds = useMemo(() => {
    return Array.from(new Set((userIds || []).filter(Boolean))).sort();
  }, [userIds]);

  const userIdsKey = stableUserIds.join(",");

  useEffect(() => {
    let cancelled = false;

    const fetchInitialPresences = async () => {
      if (stableUserIds.length === 0) return;

      try {
        const response = await getPresencesBatch(stableUserIds);
        const resData = response?.data || response;
        const actualData = resData?.result || resData;

        if (!cancelled && actualData) {
          setPresences((prev) => ({ ...prev, ...actualData }));
        }
      } catch (error) {
        console.error("Failed to load presence batch:", error);
      }
    };

    fetchInitialPresences();
    return () => {
      cancelled = true;
    };
  }, [userIdsKey, stableUserIds]);

  useEffect(() => {
    if (!subscribe) return undefined;

    const unsubscribe = subscribe("user_presence_changed", (data) => {
      if (!data?.userId) return;
      setPresences((prev) => ({
        ...prev,
        [data.userId]: {
          status: data.status,
          lastSeen: data.lastSeen,
        },
      }));
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [subscribe]);

  return (
    <PresenceContext.Provider value={presences}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = (userId) => {
  const presences = useContext(PresenceContext) || {};
  if (!userId) {
    return { status: "OFFLINE", lastSeen: null };
  }
  return (
    presences[userId] ||
    presences[String(userId)] || { status: "OFFLINE", lastSeen: null }
  );
};
