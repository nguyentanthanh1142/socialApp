import React, { useState } from "react";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  Button,
  Tooltip,
  Chip,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import RelationActionButtons from "./RelationActionButtons";

/**
 * Friend Suggestion Card adhering strictly to SuggestionResponse model
 * @param {Object} props
 * @param {import('../types/relationTypes').SuggestionResponse} props.suggestion
 * @param {Function} [props.onAddFriend] - Callback when request sent
 * @param {Function} [props.onDismiss] - Callback when dismissed
 * @param {Function} [props.onUserClick] - Callback when avatar/name clicked
 */
export default function FriendSuggestionCard({
  suggestion,
  onAddFriend,
  onDismiss,
  onUserClick,
}) {
  const [requestSent, setRequestSent] = useState(false);

  if (!suggestion) return null;

  const {
    userId,
    username,
    fullName = username || "User",
    avatarUrl,
    mutualFriendsCount = 0,
    mutualFriendNames = [],
    headline,
    suggestionReason,
  } = suggestion;

  const handleDismiss = () => {
    onDismiss?.(userId);
  };

  const mutualTooltip =
    mutualFriendNames.length > 0
      ? `Mutual with: ${mutualFriendNames.join(", ")}`
      : `${mutualFriendsCount} mutual friends`;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.09)",
        },
      }}
    >
      {/* Dismiss Button */}
      {onDismiss && (
        <Tooltip title="Remove suggestion">
          <IconButton
            size="small"
            onClick={handleDismiss}
            aria-label="dismiss suggestion"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
              bgcolor: "rgba(0,0,0,0.45)",
              color: "white",
              p: 0.5,
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.7)",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}

      {/* Profile Image / Media */}
      <Box
        onClick={() => onUserClick?.(userId)}
        sx={{
          cursor: onUserClick ? "pointer" : "default",
          overflow: "hidden",
          bgcolor: "action.hover",
          aspectRatio: "1/1",
          position: "relative",
        }}
      >
        <CardMedia
          component="img"
          image={avatarUrl || `https://i.pravatar.cc/300?u=${userId}`}
          alt={fullName}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.03)" },
          }}
        />

        {/* Suggestion Reason Badge */}
        {suggestionReason && (
          <Chip
            size="small"
            label={suggestionReason}
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              bgcolor: "rgba(0, 0, 0, 0.65)",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: 600,
              height: 20,
              backdropFilter: "blur(4px)",
            }}
          />
        )}
      </Box>

      {/* User Details */}
      <Box sx={{ p: 1.75, display: "flex", flexDirection: "column", flex: 1, gap: 0.5 }}>
        <Typography
          fontWeight={700}
          fontSize="0.95rem"
          noWrap
          onClick={() => onUserClick?.(userId)}
          sx={{
            cursor: onUserClick ? "pointer" : "default",
            "&:hover": { color: onUserClick ? "primary.main" : "inherit" },
          }}
        >
          {fullName}
        </Typography>

        {username && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: -0.25 }}>
            @{username}
          </Typography>
        )}

        {headline && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
            }}
          >
            {headline}
          </Typography>
        )}

        {/* Mutual Friends */}
        {mutualFriendsCount > 0 ? (
          <Tooltip title={mutualTooltip} arrow>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
              <PeopleAltOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500} noWrap>
                {mutualFriendsCount} mutual friend{mutualFriendsCount > 1 ? "s" : ""}
              </Typography>
            </Box>
          </Tooltip>
        ) : (
          <Box sx={{ height: 18, mt: 0.5 }} />
        )}

        {/* Action Button */}
        <Box sx={{ mt: "auto", pt: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
          <RelationActionButtons
            targetUserId={userId}
            targetUserName={fullName}
            availableActions={requestSent ? ["CANCEL_REQUEST"] : ["SEND_REQUEST"]}
            status={requestSent ? "PENDING" : "NONE"}
            isIssuer={true}
            size="small"
            fullWidth
            onActionSuccess={(action) => {
              if (action === "SEND_REQUEST") setRequestSent(true);
              if (action === "CANCEL_REQUEST") setRequestSent(false);
              onAddFriend?.(userId);
            }}
          />

          {!requestSent && onDismiss && (
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              fullWidth
              onClick={handleDismiss}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8125rem",
                borderColor: "divider",
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover", borderColor: "divider" },
              }}
            >
              Remove
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
}
