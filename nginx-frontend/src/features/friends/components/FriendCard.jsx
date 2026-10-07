import React from "react";
import {
  Card,
  Avatar,
  Typography,
  Box,
  Button,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/dateUtils";
import { useChat } from "../../../providers/ChatProvider";
import RelationActionButtons from "./RelationActionButtons";

/**
 * Friend Card adhering strictly to RelationResponse structure
 * @param {Object} props
 * @param {import('../types/relationTypes').RelationResponse} props.relation
 * @param {string} [props.currentUserId]
 * @param {Function} [props.onUnfriend]
 * @param {Function} [props.onBlock]
 */
export default function FriendCard({
  relation,
  currentUserId,
  onUnfriend,
  onBlock,
}) {
  const navigate = useNavigate();
  const { startConversation } = useChat();

  if (!relation) return null;

  // Identify the other participant
  const otherParticipant =
    relation.participants?.find((p) => p.userId !== currentUserId) ||
    relation.participants?.[0] ||
    {};

  const displayName =
    relation.conversationName ||
    [otherParticipant.firstname, otherParticipant.lastname].filter(Boolean).join(" ") ||
    otherParticipant.username ||
    "Friend";

  const avatarSrc =
    relation.conversationAvatar ||
    otherParticipant.avatar ||
    "";

  const targetUserId = otherParticipant.userId || relation.participantsHash || relation.id;

  const handleOpenChat = async () => {
    try {
      if (otherParticipant.userId) {
        await startConversation(otherParticipant.userId);
        navigate("/chat");
      }
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  };

  const handleProfileClick = () => {
    if (otherParticipant.username || otherParticipant.userId) {
      navigate(`/u/${otherParticipant.username || otherParticipant.userId}`);
    }
  };

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 2,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          borderColor: "divider",
        },
      }}
    >
      {/* Friend Info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0, flex: 1 }}>
        <Avatar
          src={avatarSrc}
          alt={displayName}
          onClick={handleProfileClick}
          sx={{
            width: 56,
            height: 56,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            transition: "opacity 0.2s",
            "&:hover": { opacity: 0.85 },
          }}
        >
          {displayName?.[0]}
        </Avatar>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            noWrap
            onClick={handleProfileClick}
            sx={{
              cursor: "pointer",
              lineHeight: 1.3,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {displayName}
          </Typography>

          {otherParticipant.username && (
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              @{otherParticipant.username}
            </Typography>
          )}

          {relation.createdDate && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              Friends since {formatRelativeTime(relation.createdDate)}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Action Buttons: Message + Unfriend/Block */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, alignSelf: { xs: "stretch", sm: "center" } }}>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<ChatIcon />}
          onClick={handleOpenChat}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 2,
            whiteSpace: "nowrap",
          }}
        >
          Message
        </Button>

        <RelationActionButtons
          targetUserId={targetUserId}
          targetUserName={displayName}
          availableActions={["UNFRIEND", "BLOCK"]}
          status="ACCEPTED"
          size="small"
          onActionSuccess={(action) => {
            if (action === "UNFRIEND") onUnfriend?.(targetUserId);
            if (action === "BLOCK") onBlock?.(targetUserId);
          }}
        />
      </Box>
    </Card>
  );
}
