import React from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import { Box, Typography, IconButton, CircularProgress, Alert } from "@mui/material";

import ChatBox from "./ChatBox";
import MinimizedChatList from "./MinimizedChatList";
import { FriendListItem } from "./FriendListItem";
import { useFriendChat } from "../features/chat/hooks/useFriendChat";
import { PresenceProvider } from "../providers/PresenceProvider";
import { getCurrentUserId } from "../features/auth/services/authenticationService";

export default function FriendList() {
  const {
    contacts,
    loading,
    error,
    loadingMore,
    lastElementRef,
    openedChats,
    minimizedChats,
    loadConversations,
    openChatBox,
    closeChatBox,
    handleMinimize,
    handleRestoreChat,
  } = useFriendChat();

  const currentUserId = getCurrentUserId();

  const userIds = React.useMemo(() => {
    if (!contacts) return [];
    return contacts
      .map((contact) => {
        const target = contact.participants?.find(
          (participant) => String(participant.userId) !== String(currentUserId)
        );
        return target?.userId || contact.userId || contact.friendId || null;
      })
      .filter(Boolean);
  }, [contacts, currentUserId]);

  return (
    <PresenceProvider userIds={userIds}>
      <Box sx={{ pt: 2, pb: 1, width: "100%" }}>
        <Box sx={{ px: 2, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              letterSpacing: 0.5,
              textTransform: "uppercase",
              fontSize: "0.8rem",
            }}
          >
            Contacts
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert
              severity="error"
              action={
                <IconButton onClick={loadConversations} aria-label="retry">
                  <RefreshIcon />
                </IconButton>
              }
            >
              {error}
            </Alert>
          </Box>
        ) : !contacts || contacts.length === 0 ? (
          <Box sx={{ px: 2, py: 2.5, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No contacts yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: "100%", p: 0 }}>
            {contacts.map((contact, index) => {
              const isLast = index === contacts.length - 1;
              return (
                <FriendListItem
                  key={contact.id}
                  conversation={contact}
                  onClick={() => openChatBox(contact)}
                  lastElementRef={isLast ? lastElementRef : null}
                />
              );
            })}

            {loadingMore && (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </List>
        )}
      </Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          right: 0,
          display: "flex",
          flexDirection: "row-reverse",
          gap: 2,
          p: 2,
          zIndex: 1300,
        }}
      >
        {openedChats.map((chat, index) => (
          <Box
            key={chat.id}
            sx={{
              position: "fixed",
              bottom: 70,
              right: 20 + index * 340,
              width: 320,
              zIndex: 1300,
            }}
          >
            <ChatBox
              conversation={chat}
              onClose={() => closeChatBox(chat.id)}
              onMinimize={() => handleMinimize(chat)}
            />
          </Box>
        ))}
      </Box>

      <MinimizedChatList
        minimizedChats={minimizedChats}
        onRestore={handleRestoreChat}
        onClose={(id) => closeChatBox(id)}
      />
    </PresenceProvider>
  );
}
