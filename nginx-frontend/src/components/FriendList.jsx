import React, { useState, useEffect, useRef, useCallback } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";

import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useChat } from "../providers/ChatProvider";

import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  CircularProgress,
  Alert,
} from "@mui/material";

import {
  getMessages,
  createConversation,
  createMessage,
} from "../services/chatService";

import ChatBox from "./ChatBox";

export default function FriendList() {
  const {
    conversations,
    setConversations,
    messagesMap,
    setMessagesMap,
    loadConversations,
  } = useChat();

  const socketRef = useRef(null);

  const [selectedConversation, setSelectedConversation] = useState(null);

  const [openedChats, setOpenedChats] = useState([]);
  const [minimizedChats, setMinimizedChats] = useState([]);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // LocalStorage restore
  // =========================

  useEffect(() => {
    const storedChats = localStorage.getItem("openedChats");
    const minimizeChats = localStorage.getItem("minimizeChats");

    if (storedChats) {
      setOpenedChats(JSON.parse(storedChats));
    }

    if (minimizeChats) {
      setMinimizedChats(JSON.parse(minimizeChats));
    }
  }, []);

  // =========================
  // Open chat box
  // =========================

  const openChatBox = (conversation) => {
    setOpenedChats((prev) => {
      const exists = prev.find((c) => c.id === conversation.id);
      if (exists) return prev;

      const newChats = [...prev, conversation];

      localStorage.setItem("openedChats", JSON.stringify(newChats));

      return newChats;
    });

    setMinimizedChats((prev) =>
      prev.filter((c) => c.id !== conversation.id)
    );

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversation.id ? { ...c, unread: 0 } : c
      )
    );
  };

  // =========================
  // Close chat
  // =========================

  const closeChatBox = (id) => {
    setOpenedChats((prev) => {
      const newChats = prev.filter((c) => c.id !== id);

      localStorage.setItem("openedChats", JSON.stringify(newChats));

      return newChats;
    });
  };

  // =========================
  // Minimize
  // =========================

  const handleMinimize = (chat) => {
    setOpenedChats((prev) =>
      prev.filter((c) => c.id !== chat.id)
    );

    setMinimizedChats((prev) => {
      const exists = prev.find((c) => c.id === chat.id);
      if (exists) return prev;

      const newChats = [...prev, chat];

      localStorage.setItem("minimizeChats", JSON.stringify(newChats));

      return newChats;
    });
  };

  // =========================
  // Restore minimized
  // =========================

  const handleRestoreChat = (chat) => {
    setMinimizedChats((prev) =>
      prev.filter((c) => c.id !== chat.id)
    );

    setOpenedChats((prev) => {
      const exists = prev.find((c) => c.id === chat.id);
      if (exists) return prev;

      const newChats = [...prev, chat];

      localStorage.setItem("openedChats", JSON.stringify(newChats));

      return newChats;
    });
  };

  // =========================
  // Fetch messages
  // =========================

  useEffect(() => {
    const fetchMessages = async (conversationId) => {
      if (messagesMap[conversationId]) return;

      try {
        const res = await getMessages(conversationId);

        const msgs = res?.data?.result || [];

        const sorted = msgs.sort(
          (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
        );

        setMessagesMap((prev) => ({
          ...prev,
          [conversationId]: sorted,
        }));
      } catch (err) {
        console.error(err);
      }
    };

    if (selectedConversation?.id) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // =========================
  // UI
  // =========================

  return (
    <>
      {/* Đã xóa thẻ <Toolbar /> ở đây để tránh bị đẩy xuống quá sâu */}
      <List sx={{ pt: 2, width: "100%" }}>
        <Typography sx={{ pl: 2, fontWeight: "bold", color: "text.secondary" }}>
          Contacts
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert
              severity="error"
              action={
                <IconButton onClick={loadConversations}>
                  <RefreshIcon />
                </IconButton>
              }
            >
              {error}
            </Alert>
          </Box>
        ) : conversations?.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography color="text.secondary">No conversations yet</Typography>
          </Box>
        ) : (
          <List sx={{ width: "100%" }}>
            {conversations.map((conversation) => (
              <ListItem key={conversation.id} disablePadding>
                <ListItemButton onClick={() => openChatBox(conversation)}>
                  <Badge
                    color="error"
                    badgeContent={conversation.unread}
                    invisible={conversation.unread === 0}
                  >
                    <Avatar src={conversation.conversationAvatar} />
                  </Badge>

                  <ListItemText
                    primary={conversation.conversationName}
                    secondary={
                      messagesMap[conversation.id]?.length
                        ? messagesMap[conversation.id].slice(-1)[0].message
                        : "No messages"
                    }
                    primaryTypographyProps={{ pl: 3, fontSize: 14 }}
                    secondaryTypographyProps={{ pl: 3, fontSize: 12 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </List>

      <Divider />

      {/* CHAT BOX */}
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
          <ChatBox
            key={chat.id}
            conversation={chat}
            onClose={() => closeChatBox(chat.id)}
            onMinimize={() => handleMinimize(chat)}
            sx={{
              position: "fixed",
              bottom: 70,
              right: 20 + index * 340,
              width: 320,
            }}
          />
        ))}
      </Box>

      {/* MINIMIZED */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          right: 0,
          display: "flex",
          gap: 1,
          p: 1,
        }}
      >
        {minimizedChats.map((chat) => (
          <Avatar
            key={chat.id}
            src={chat.conversationAvatar}
            sx={{
              width: 56,
              height: 56,
              cursor: "pointer",
              border: "2px solid #1976d2",
            }}
            onClick={() => handleRestoreChat(chat)}
          />
        ))}
      </Box>
    </>
  );
}