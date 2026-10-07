import React from "react";
import FriendSuggestionCard from "./FriendSuggestionCard";

export default function SuggestionCard({ req, onPending, onDismiss, onUserClick }) {
  if (!req) return null;

  const normalized = {
    userId: req.userId || req.id,
    username: req.username || "",
    fullName: req.fullName || req.conversationName || req.name || req.username || "User",
    avatarUrl: req.avatarUrl || req.avatar || "",
    mutualFriendsCount: req.mutualFriendsCount ?? req.mutualFriends ?? 0,
    mutualFriendNames: req.mutualFriendNames || [],
    headline: req.headline || req.followed || "",
    suggestionReason: req.suggestionReason || (req.followed ? `Followed by ${req.followed}` : ""),
  };

  return (
    <FriendSuggestionCard
      suggestion={normalized}
      onAddFriend={onPending}
      onDismiss={onDismiss}
      onUserClick={onUserClick}
    />
  );
}

export { FriendSuggestionCard };
