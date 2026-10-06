import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import {
  getRelationshipStatus,
  sendFriendsRequest,
  acceptFriendByTarget,
  rejectFriendByTarget,
  cancelFriendRequestByTarget,
  unfriendUser,
  blockUser,
  unblockUser,
} from "../../friends/services/friendService";
import { useChat } from "../../../providers/ChatProvider";

const btnSx = { borderRadius: 2, textTransform: "none", fontWeight: 600, px: 2 };

export default function ProfileRelationActions({ targetUserId, onMessage, onStatusChange }) {
  const navigate = useNavigate();
  const { startConversation } = useChat();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const refreshStatus = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const res = await getRelationshipStatus(targetUserId);
      const next = res?.data?.result || null;
      setStatusData(next);
      onStatusChange?.(next);
    } catch (err) {
      console.error("Failed to load relation status", err);
      setStatusData({
        status: "NONE",
        isIssuer: false,
        availableActions: ["SEND_REQUEST", "BLOCK"],
      });
    } finally {
      setLoading(false);
    }
  }, [targetUserId, onStatusChange]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const runAction = async (action) => {
    if (!targetUserId || acting) return;
    setActing(true);
    try {
      switch (action) {
        case "SEND_REQUEST":
          await sendFriendsRequest(targetUserId);
          break;
        case "CANCEL_REQUEST":
          await cancelFriendRequestByTarget(targetUserId);
          break;
        case "ACCEPT_REQUEST":
          await acceptFriendByTarget(targetUserId);
          break;
        case "REJECT_REQUEST":
          await rejectFriendByTarget(targetUserId);
          break;
        case "UNFRIEND":
          await unfriendUser(targetUserId);
          break;
        case "BLOCK":
          await blockUser(targetUserId);
          break;
        case "UNBLOCK":
          await unblockUser(targetUserId);
          break;
        default:
          break;
      }
      await refreshStatus();
    } catch (err) {
      console.error(`Relation action ${action} failed`, err);
    } finally {
      setActing(false);
      setMenuAnchor(null);
    }
  };

  const handleMessage = async () => {
    if (onMessage) {
      onMessage();
      return;
    }
    try {
      setActing(true);
      await startConversation(targetUserId);
      navigate("/chat");
    } catch (err) {
      console.error("Failed to start chat", err);
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const status = statusData?.status || "NONE";
  const isIssuer = Boolean(statusData?.isIssuer);
  const normalized = status === "REJECTED" || status === "NONE" ? "NONE" : status;

  const showMessage = normalized === "ACCEPTED";

  const renderPrimaryActions = () => {
    if (normalized === "PENDING") {
      if (isIssuer) {
        return (
          <Button
            variant="outlined"
            color="inherit"
            startIcon={acting ? <CircularProgress size={16} /> : <CloseIcon />}
            disabled={acting}
            onClick={() => runAction("CANCEL_REQUEST")}
            sx={btnSx}
          >
            Cancel Request
          </Button>
        );
      }
      return (
        <>
          <Button
            variant="contained"
            startIcon={acting ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
            disabled={acting}
            onClick={() => runAction("ACCEPT_REQUEST")}
            sx={btnSx}
          >
            Accept
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CloseIcon />}
            disabled={acting}
            onClick={() => runAction("REJECT_REQUEST")}
            sx={btnSx}
          >
            Reject
          </Button>
        </>
      );
    }

    if (normalized === "ACCEPTED") {
      return (
        <Button
          variant="outlined"
          color="inherit"
          startIcon={acting ? <CircularProgress size={16} /> : <PersonRemoveIcon />}
          disabled={acting}
          onClick={() => runAction("UNFRIEND")}
          sx={btnSx}
        >
          Unfriend
        </Button>
      );
    }

    if (normalized === "BLOCKED") {
      return (
        <Button
          variant="contained"
          startIcon={acting ? <CircularProgress size={16} color="inherit" /> : <LockOpenIcon />}
          disabled={acting}
          onClick={() => runAction("UNBLOCK")}
          sx={btnSx}
        >
          Unblock
        </Button>
      );
    }

    return (
      <>
        <Button
          variant="contained"
          startIcon={acting ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
          disabled={acting}
          onClick={() => runAction("SEND_REQUEST")}
          sx={btnSx}
        >
          Add Friend
        </Button>
        <IconButton
          aria-label="More actions"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
        >
          <MoreHorizIcon />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={() => runAction("BLOCK")} disabled={acting}>
            <ListItemIcon>
              <BlockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Block</ListItemText>
          </MenuItem>
        </Menu>
      </>
    );
  };

  return (
    <>
      {renderPrimaryActions()}
      {showMessage && (
        <Button
          variant="outlined"
          startIcon={<ChatIcon />}
          disabled={acting}
          onClick={handleMessage}
          sx={btnSx}
        >
          Message
        </Button>
      )}
    </>
  );
}
