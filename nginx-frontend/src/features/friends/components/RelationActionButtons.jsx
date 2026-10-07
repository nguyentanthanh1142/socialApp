import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import {
  sendFriendsRequest,
  cancelFriendRequestByTarget,
  acceptFriendByTarget,
  rejectFriendByTarget,
  unfriendUser,
  blockUser,
  unblockUser,
} from "../services/friendService";

/**
 * Dynamic Friend and Relation Action Buttons adhering to RelationStatusResponse
 * @param {Object} props
 * @param {string} props.targetUserId - The ID of the target user
 * @param {string} [props.targetUserName="this user"] - Display name for confirmation dialogs
 * @param {string[]} [props.availableActions=[]] - List of actions: SEND_REQUEST, CANCEL_REQUEST, ACCEPT_REQUEST, REJECT_REQUEST, UNFRIEND, BLOCK, UNBLOCK
 * @param {string} [props.status="NONE"] - NONE, PENDING, ACCEPTED, BLOCKED
 * @param {boolean} [props.isIssuer=false]
 * @param {Function} [props.onActionSuccess] - Callback when an action succeeds (actionName, targetUserId)
 * @param {Function} [props.onError] - Callback on action error
 * @param {"small" | "medium"} [props.size="medium"]
 * @param {boolean} [props.fullWidth=false]
 * @param {"row" | "column" | "compact"} [props.layout="row"]
 * @param {Object} [props.sx] - Additional styles
 */
export default function RelationActionButtons({
  targetUserId,
  targetUserName = "this user",
  availableActions = [],
  status = "NONE",
  isIssuer = false,
  onActionSuccess,
  onError,
  size = "medium",
  fullWidth = false,
  layout = "row",
  sx = {},
}) {
  const [activeActions, setActiveActions] = useState(availableActions);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [actingAction, setActingAction] = useState(null); // 'SEND_REQUEST', 'UNFRIEND', etc.
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    title: "",
    message: "",
  });

  // Local feedback toast
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleOpenConfirm = (action) => {
    handleCloseMenu();
    if (action === "UNFRIEND") {
      setConfirmDialog({
        open: true,
        action: "UNFRIEND",
        title: `Unfriend ${targetUserName}?`,
        message: `Are you sure you want to remove ${targetUserName} from your friends? They will no longer see your friend-only posts.`,
      });
    } else if (action === "BLOCK") {
      setConfirmDialog({
        open: true,
        action: "BLOCK",
        title: `Block ${targetUserName}?`,
        message: `Are you sure you want to block ${targetUserName}? They won't be able to find your profile, posts, or message you.`,
      });
    }
  };

  const handleCloseConfirm = () => {
    if (actingAction) return;
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  const executeAction = async (action) => {
    if (!targetUserId || actingAction) return;
    setActingAction(action);

    try {
      switch (action) {
        case "SEND_REQUEST":
          await sendFriendsRequest(targetUserId);
          setCurrentStatus("PENDING");
          setActiveActions(["CANCEL_REQUEST", "BLOCK"]);
          showToast(`Friend request sent to ${targetUserName}!`);
          break;

        case "CANCEL_REQUEST":
          await cancelFriendRequestByTarget(targetUserId);
          setCurrentStatus("NONE");
          setActiveActions(["SEND_REQUEST", "BLOCK"]);
          showToast("Friend request cancelled.");
          break;

        case "ACCEPT_REQUEST":
          await acceptFriendByTarget(targetUserId);
          setCurrentStatus("ACCEPTED");
          setActiveActions(["UNFRIEND", "BLOCK"]);
          showToast(`You and ${targetUserName} are now friends!`);
          break;

        case "REJECT_REQUEST":
          await rejectFriendByTarget(targetUserId);
          setCurrentStatus("NONE");
          setActiveActions(["SEND_REQUEST", "BLOCK"]);
          showToast("Friend request rejected.");
          break;

        case "UNFRIEND":
          await unfriendUser(targetUserId);
          setCurrentStatus("NONE");
          setActiveActions(["SEND_REQUEST", "BLOCK"]);
          showToast(`Unfriended ${targetUserName}.`);
          break;

        case "BLOCK":
          await blockUser(targetUserId);
          setCurrentStatus("BLOCKED");
          setActiveActions(["UNBLOCK"]);
          showToast(`Blocked ${targetUserName}.`);
          break;

        case "UNBLOCK":
          await unblockUser(targetUserId);
          setCurrentStatus("NONE");
          setActiveActions(["SEND_REQUEST", "BLOCK"]);
          showToast(`Unblocked ${targetUserName}.`);
          break;

        default:
          console.warn("Unknown relation action:", action);
      }

      onActionSuccess?.(action, targetUserId);
    } catch (err) {
      console.error(`Relation action ${action} failed:`, err);
      showToast(err?.response?.data?.message || `Failed to process ${action.toLowerCase().replace("_", " ")}.`, "error");
      onError?.(err);
    } finally {
      setActingAction(null);
      setConfirmDialog((prev) => ({ ...prev, open: false }));
    }
  };

  const actions = activeActions.length > 0 ? activeActions : availableActions;
  const isBusy = Boolean(actingAction);

  const hasSend = actions.includes("SEND_REQUEST");
  const hasCancel = actions.includes("CANCEL_REQUEST");
  const hasAccept = actions.includes("ACCEPT_REQUEST");
  const hasReject = actions.includes("REJECT_REQUEST");
  const hasUnfriend = actions.includes("UNFRIEND");
  const hasBlock = actions.includes("BLOCK");
  const hasUnblock = actions.includes("UNBLOCK");

  const commonBtnSx = {
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 600,
    fontSize: size === "small" ? "0.8125rem" : "0.875rem",
    boxShadow: "none",
    "&:hover": { boxShadow: "none" },
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: layout === "column" ? "column" : "row",
          alignItems: "center",
          gap: 1,
          width: fullWidth ? "100%" : "auto",
          ...sx,
        }}
      >
        {/* 1. SEND_REQUEST -> "Add Friend" */}
        {hasSend && (
          <Button
            variant="contained"
            color="primary"
            size={size}
            fullWidth={fullWidth}
            disabled={isBusy}
            startIcon={
              actingAction === "SEND_REQUEST" ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PersonAddIcon />
              )
            }
            onClick={() => executeAction("SEND_REQUEST")}
            sx={{
              ...commonBtnSx,
              bgcolor: "#1877f2",
              "&:hover": { bgcolor: "#166fe5" },
            }}
          >
            Add Friend
          </Button>
        )}

        {/* 2. CANCEL_REQUEST -> "Cancel Request" */}
        {hasCancel && (
          <Button
            variant="outlined"
            color="inherit"
            size={size}
            fullWidth={fullWidth}
            disabled={isBusy}
            startIcon={
              actingAction === "CANCEL_REQUEST" ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CloseIcon />
              )
            }
            onClick={() => executeAction("CANCEL_REQUEST")}
            sx={{
              ...commonBtnSx,
              borderColor: "divider",
              bgcolor: "action.hover",
              "&:hover": { bgcolor: "action.selected" },
            }}
          >
            Cancel Request
          </Button>
        )}

        {/* 3. ACCEPT_REQUEST & REJECT_REQUEST -> "Accept" and "Delete/Reject" side-by-side */}
        {hasAccept && (
          <Button
            variant="contained"
            color="primary"
            size={size}
            fullWidth={fullWidth}
            disabled={isBusy}
            startIcon={
              actingAction === "ACCEPT_REQUEST" ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckIcon />
              )
            }
            onClick={() => executeAction("ACCEPT_REQUEST")}
            sx={{
              ...commonBtnSx,
              bgcolor: "#1877f2",
              "&:hover": { bgcolor: "#166fe5" },
            }}
          >
            Accept
          </Button>
        )}

        {hasReject && (
          <Button
            variant="outlined"
            color="inherit"
            size={size}
            fullWidth={fullWidth}
            disabled={isBusy}
            startIcon={
              actingAction === "REJECT_REQUEST" ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CloseIcon />
              )
            }
            onClick={() => executeAction("REJECT_REQUEST")}
            sx={{
              ...commonBtnSx,
              borderColor: "divider",
              bgcolor: "action.hover",
              "&:hover": { bgcolor: "action.selected" },
            }}
          >
            Reject
          </Button>
        )}

        {/* 4. UNBLOCK -> "Unblock" */}
        {hasUnblock && (
          <Button
            variant="contained"
            color="warning"
            size={size}
            fullWidth={fullWidth}
            disabled={isBusy}
            startIcon={
              actingAction === "UNBLOCK" ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <LockOpenIcon />
              )
            }
            onClick={() => executeAction("UNBLOCK")}
            sx={commonBtnSx}
          >
            Unblock
          </Button>
        )}

        {/* 5. UNFRIEND or BLOCK -> MoreVert Menu */}
        {(hasUnfriend || hasBlock) && (
          <>
            {currentStatus === "ACCEPTED" && (
              <Button
                variant="outlined"
                color="inherit"
                size={size}
                disabled={isBusy}
                startIcon={<CheckIcon color="success" />}
                onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                sx={{
                  ...commonBtnSx,
                  borderColor: "divider",
                  color: "text.primary",
                }}
              >
                Friends
              </Button>
            )}

            <Tooltip title="More options">
              <IconButton
                size={size}
                disabled={isBusy}
                aria-label="friend options"
                onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {isBusy && (actingAction === "UNFRIEND" || actingAction === "BLOCK") ? (
                  <CircularProgress size={16} />
                ) : (
                  <MoreVertIcon fontSize={size === "small" ? "small" : "medium"} />
                )}
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleCloseMenu}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                elevation: 4,
                sx: { borderRadius: 2.5, minWidth: 170, p: 0.5 },
              }}
            >
              {hasUnfriend && (
                <MenuItem
                  onClick={() => handleOpenConfirm("UNFRIEND")}
                  sx={{ borderRadius: 1.5, py: 1, gap: 1.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 28, color: "error.main" }}>
                    <PersonRemoveIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: "body2", fontWeight: 600, color: "error" }}>
                    Unfriend
                  </ListItemText>
                </MenuItem>
              )}

              {hasBlock && (
                <MenuItem
                  onClick={() => handleOpenConfirm("BLOCK")}
                  sx={{ borderRadius: 1.5, py: 1, gap: 1.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
                    <BlockIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}>
                    Block
                  </ListItemText>
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Box>

      {/* Confirmation Dialog for Destructive Actions (Unfriend, Block) */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        aria-labelledby="relation-dialog-title"
        PaperProps={{
          sx: { borderRadius: 3, p: 1, maxWidth: 420 },
        }}
      >
        <DialogTitle
          id="relation-dialog-title"
          sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1, fontWeight: 700 }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              bgcolor: "error.light",
              color: "error.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WarningAmberRoundedIcon />
          </Box>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText sx={{ color: "text.primary" }}>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleCloseConfirm}
            disabled={isBusy}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => executeAction(confirmDialog.action)}
            disabled={isBusy}
            variant="contained"
            color="error"
            startIcon={isBusy ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 2.5 }}
          >
            {isBusy ? "Processing..." : confirmDialog.action === "UNFRIEND" ? "Unfriend" : "Block"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}
