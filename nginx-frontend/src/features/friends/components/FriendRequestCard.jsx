import React from "react";
import { Card, CardMedia, Typography, Box } from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import RelationActionButtons from "./RelationActionButtons";

/**
 * Friend Request Card for incoming/outgoing friend requests
 * @param {Object} props
 * @param {Object} props.req - Request object adhering to RelationResponse / friend request
 * @param {Function} [props.onConfirm] - Callback on request accept
 * @param {Function} [props.onDelete] - Callback on request reject / cancel
 */
export default function FriendRequestCard({ req, onConfirm, onDelete }) {
  if (!req) return null;

  const targetId = req.targetUserId || req.userId || req.participantsHash || req.id;
  const name =
    req.conversationName ||
    req.fullName ||
    req.name ||
    [req.firstname, req.lastname].filter(Boolean).join(" ") ||
    "User";

  const avatar = req.avatarUrl || req.avatar || req.conversationAvatar || `https://i.pravatar.cc/300?u=${targetId}`;
  const isAccepted = req.status === "ACCEPTED" || req.status === "FRIENDS";
  const isSent = Boolean(req.isIssuer);

  const availableActions = isAccepted
    ? ["UNFRIEND", "BLOCK"]
    : isSent
      ? ["CANCEL_REQUEST"]
      : ["ACCEPT_REQUEST", "REJECT_REQUEST"];

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.09)",
        },
      }}
    >
      <Box sx={{ overflow: "hidden", aspectRatio: "1/1", bgcolor: "action.hover" }}>
        <CardMedia
          component="img"
          image={avatar}
          alt={name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.03)" },
          }}
        />
      </Box>

      <Box sx={{ p: 1.75, display: "flex", flexDirection: "column", flex: 1, gap: 0.5 }}>
        <Typography fontWeight={700} fontSize="0.95rem" noWrap>
          {name}
        </Typography>

        {req.username && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: -0.25 }}>
            @{req.username}
          </Typography>
        )}

        {req.mutualFriends || req.mutualFriendsCount ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
            <PeopleAltOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500} noWrap>
              {req.mutualFriends || req.mutualFriendsCount} mutual friend
              {(req.mutualFriends || req.mutualFriendsCount) > 1 ? "s" : ""}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: 18, mt: 0.5 }} />
        )}

        <Box sx={{ mt: "auto", pt: 1.5 }}>
          <RelationActionButtons
            targetUserId={targetId}
            targetUserName={name}
            availableActions={availableActions}
            status={req.status || "PENDING"}
            isIssuer={isSent}
            size="small"
            fullWidth
            layout={availableActions.length > 1 ? "row" : "compact"}
            onActionSuccess={(action) => {
              if (action === "ACCEPT_REQUEST") onConfirm?.(req);
              if (action === "REJECT_REQUEST" || action === "CANCEL_REQUEST") onDelete?.(targetId);
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}