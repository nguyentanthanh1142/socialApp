import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Menu,
  MenuItem,
  CircularProgress,
  Avatar,
  Typography,
  Alert,
  Button,
  Badge,
} from "@mui/material";
import { useFriendChat } from "../hooks/useFriendChat";
import { getCurrentUserId } from "../../auth/services/authenticationService";

export default function MessageMenu({ anchorEl, open, onClose }) {
  const {
    contacts,
    loading,
    error,
    loadingMore,
    lastElementRef,
    loadConversations,
    openChatBox,
  } = useFriendChat();

  const currentUserId = getCurrentUserId();

  // Mỗi khi Menu được mở lên, gọi lại hàm load conversations để cập nhật dữ liệu mới nhất
  useEffect(() => {
    if (!open) return;
    loadConversations();
  }, [open, loadConversations]);

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 4,
        sx: {
          mt: 1.5,
          minWidth: 360,
          maxHeight: 450,
          overflowY: "auto",
        },
      }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Chats
        </Typography>
      </Box>

      {error && !loading && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={loadConversations}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      )}

      {!loading && (!contacts || contacts.length === 0) && !error && (
        <MenuItem disabled>No messages yet</MenuItem>
      )}

      {contacts.map((contact, index) => {
        const isLast = index === contacts.length - 1;
        
        // Tìm thông tin người đối thoại (không phải mình)
        const targetParticipant = contact.participants?.find(
          (p) => String(p.userId) !== String(currentUserId)
        );

        const name = targetParticipant?.name || contact.name || "Chat";
        const avatarUrl = targetParticipant?.avatarUrl || contact.avatarUrl || "";
        const lastMessage = contact.lastMessage?.content || "Say something to start chatting...";
        const updatedAt = contact.lastMessage?.createdAt || contact.updatedAt;

        return (
          <MenuItem
            key={contact.id}
            ref={isLast ? lastElementRef : null}
            onClick={() => {
              openChatBox(contact);
              onClose();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              py: 1.5,
              px: 2,
              whiteSpace: "normal",
            }}
          >
            <Avatar src={avatarUrl} alt={name} sx={{ width: 40, height: 40 }} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography fontSize={14} fontWeight="bold" noWrap>
                  {name}
                </Typography>
                <Typography fontSize={11} color="gray" sx={{ ml: 1, flexShrink: 0 }}>
                  {formatTime(updatedAt)}
                </Typography>
              </Box>
              <Typography fontSize={13} color="text.secondary" noWrap>
                {lastMessage}
              </Typography>
            </Box>
          </MenuItem>
        );
      })}

      {(loading || loadingMore) && (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <CircularProgress size={20} />
        </Box>
      )}
    </Menu>
  );
}