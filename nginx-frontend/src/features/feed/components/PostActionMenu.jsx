import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
  Divider,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";

export const DEFAULT_OWNER_ACTIONS = ["EDIT", "DELETE", "SAVE", "SHARE"];
export const DEFAULT_VIEWER_ACTIONS = ["HIDE", "REPORT", "SAVE", "SHARE"];

export default function PostActionMenu({
  actions,
  isOwner = false,
  isSaved = false,
  onActionClick,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  const handleItemClick = (actionKey, event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
    if (onActionClick) {
      onActionClick(actionKey);
    }
  };

  // Determine dynamic actions list
  const rawActions = Array.isArray(actions) && actions.length > 0
    ? actions
    : isOwner
      ? DEFAULT_OWNER_ACTIONS
      : DEFAULT_VIEWER_ACTIONS;

  const normalizedActions = rawActions.map((a) =>
    (typeof a === "string" ? a : a.type || a.action || "").toUpperCase()
  );

  const actionDefinitions = {
    EDIT: {
      key: "EDIT",
      label: "Edit post",
      icon: EditOutlinedIcon,
      isDestructive: false,
    },
    DELETE: {
      key: "DELETE",
      label: "Delete post",
      icon: DeleteOutlineIcon,
      isDestructive: true,
    },
    SAVE: {
      key: "SAVE",
      label: isSaved ? "Unsave post" : "Save post",
      icon: isSaved ? BookmarkIcon : BookmarkBorderIcon,
      isDestructive: false,
    },
    BOOKMARK: {
      key: "SAVE",
      label: isSaved ? "Unsave post" : "Save post",
      icon: isSaved ? BookmarkIcon : BookmarkBorderIcon,
      isDestructive: false,
    },
    HIDE: {
      key: "HIDE",
      label: "Hide post",
      icon: VisibilityOffOutlinedIcon,
      isDestructive: false,
    },
    REPORT: {
      key: "REPORT",
      label: "Report post",
      icon: ReportOutlinedIcon,
      isDestructive: false,
    },
    SHARE: {
      key: "SHARE",
      label: "Share post",
      icon: ShareOutlinedIcon,
      isDestructive: false,
    },
  };

  // Separate regular and destructive actions (e.g. DELETE at the bottom with divider)
  const availableItems = normalizedActions
    .map((key) => actionDefinitions[key])
    .filter(Boolean);

  if (availableItems.length === 0) {
    return null;
  }

  const regularItems = availableItems.filter((i) => !i.isDestructive);
  const destructiveItems = availableItems.filter((i) => i.isDestructive);

  return (
    <>
      <Tooltip title="Options">
        <IconButton
          size="small"
          onClick={handleOpen}
          aria-label="post actions"
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          sx={{
            color: "text.secondary",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "action.hover",
              color: "text.primary",
            },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: 2.5,
            minWidth: 190,
            mt: 0.5,
            p: 0.5,
            border: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        {regularItems.map((item) => {
          const IconComp = item.icon;
          return (
            <MenuItem
              key={item.key}
              onClick={(e) => handleItemClick(item.key, e)}
              sx={{
                borderRadius: 1.5,
                my: 0.25,
                py: 1,
                px: 1.5,
                gap: 1.5,
                transition: "background-color 0.15s ease",
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
                <IconComp fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2" fontWeight={500}>
                  {item.label}
                </Typography>
              </ListItemText>
            </MenuItem>
          );
        })}

        {regularItems.length > 0 && destructiveItems.length > 0 && (
          <Divider sx={{ my: 0.5 }} />
        )}

        {destructiveItems.map((item) => {
          const IconComp = item.icon;
          return (
            <MenuItem
              key={item.key}
              onClick={(e) => handleItemClick(item.key, e)}
              sx={{
                borderRadius: 1.5,
                my: 0.25,
                py: 1,
                px: 1.5,
                gap: 1.5,
                color: "error.main",
                "&:hover": {
                  backgroundColor: "error.lighter",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: "error.main" }}>
                <IconComp fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2" fontWeight={600} color="error">
                  {item.label}
                </Typography>
              </ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
