import { usePresence } from "../../../providers/PresenceProvider";
import { getCurrentUserId } from "../../auth/services/authenticationService";

export const useFriendPresence = (conversation) => {
  const currentUserId = getCurrentUserId();

  const targetParticipant = conversation?.participants?.find((participant) => {
    return String(participant.userId) !== String(currentUserId);
  });

  const targetUserId =
    targetParticipant?.userId ||
    conversation?.userId ||
    conversation?.friendId ||
    null;

  const { status, lastSeen } = usePresence(targetUserId);

  return {
    targetUserId,
    status,
    lastSeen,
    isOnline: String(status).toUpperCase() === "ONLINE",
  };
};
