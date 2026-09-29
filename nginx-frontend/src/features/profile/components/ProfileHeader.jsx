import React, { useState } from "react";
import { Box, Avatar, Typography, Button, Snackbar, Alert, CircularProgress } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ChatIcon from "@mui/icons-material/Chat";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { sendFriendsRequest } from "../../friends/services/friendService";
import { useChat } from "../../../providers/ChatProvider";
import { useUser } from "../../../providers/UserProvider";

export default function ProfileHeader({ user }) {
  const navigate = useNavigate();
  const { startConversation } = useChat();
  const { currentUser } = useUser();

  const [requestSent, setRequestSent] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const displayName =
    [user?.firstname, user?.lastname].filter(Boolean).join(" ").trim() ||
    user?.name ||
    user?.username ||
    "User";

  const targetUserId = user?.id || user?.userId;
  const isMe =
    currentUser &&
    targetUserId &&
    (String(currentUser.id) === String(targetUserId) ||
      String(currentUser.username) === String(user?.username));

  const handleAddFriend = async () => {
    if (!targetUserId || requestSent || loadingAction) return;
    try {
      setLoadingAction(true);
      await sendFriendsRequest(targetUserId);
      setRequestSent(true);
      setSnackbar({ open: true, message: "Friend request sent!", severity: "success" });
    } catch (err) {
      console.error("Failed to send friend request:", err);
      setSnackbar({ open: true, message: "Unable to send friend request right now.", severity: "error" });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStartChat = async () => {
    if (!targetUserId) return;
    try {
      setLoadingAction(true);
      await startConversation(targetUserId);
      navigate("/chat");
    } catch (err) {
      console.error("Failed to start chat:", err);
      setSnackbar({ open: true, message: "Unable to start chat right now.", severity: "error" });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Box sx={{ position: "relative", mb: 3 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Cover Photo */}
      <Box
        sx={{
          width: "100%",
          height: 260,
          borderRadius: 3,
          backgroundColor: "#1976d2",
          backgroundImage: user?.coverUrl
            ? `url(${user.coverUrl})`
            : "linear-gradient(135deg, #1877f2 0%, #00c6ff 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Avatar */}
      <Avatar
        src={user?.avatarUrl || user?.avatar || ""}
        alt={displayName}
        sx={{
          width: 140,
          height: 140,
          position: "absolute",
          bottom: -50,
          left: { xs: 20, sm: 40 },
          border: "4px solid white",
          boxShadow: 3,
          bgcolor: "#1976d2",
          fontSize: 48,
        }}
      >
        {displayName?.[0]}
      </Avatar>

      {/* Info & Action Buttons */}
      <Box
        sx={{
          mt: 7,
          ml: { xs: 2, sm: 4 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "flex-end" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {displayName}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            @{user?.username} {user?.city ? `• ${user.city}` : ""}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, pb: 0.5 }}>
          {isMe ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate("/profile")}
              sx={{ borderRadius: 2, textTransform: "none", px: 2.5 }}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant={requestSent ? "outlined" : "contained"}
                color={requestSent ? "success" : "primary"}
                startIcon={
                  loadingAction ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : requestSent ? (
                    <CheckIcon />
                  ) : (
                    <PersonAddIcon />
                  )
                }
                onClick={handleAddFriend}
                disabled={requestSent || loadingAction}
                sx={{ borderRadius: 2, textTransform: "none", px: 2 }}
              >
                {requestSent ? "Request Sent" : "Add Friend"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ChatIcon />}
                onClick={handleStartChat}
                disabled={loadingAction}
                sx={{ borderRadius: 2, textTransform: "none", px: 2 }}
              >
                Message
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
