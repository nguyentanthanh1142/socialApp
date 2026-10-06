import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Stack,
  CircularProgress,
} from "@mui/material";

import RemoveIcon from "@mui/icons-material/Remove";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

import EmojiInput from "./EmojiInput";

import { useChat } from "../providers/ChatProvider"; // Chỉ cần dùng useChat là đủ
import { getAvatarUrl } from "../utils/avatarUtils";
import { formatLocaleTime } from "../utils/dateUtils";



export default function ChatBox({ conversation, onClose, onMinimize }) {
  const [message, setMessage] = useState("");
  const messageContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    messagesMap,
    loadMessages,
    sendMessageToConversation: sendMessage,
    typingMap,
    sendTyping, // Lấy hàm sendTyping từ ChatProvider
  } = useChat();

  const [error, setError] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const currentMessages = messagesMap[conversation.id] || [];
  const isTyping = typingMap[conversation.id];

  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        setError(null);
        await loadMessages(conversation.id);
      } catch (err) {
        console.error("Failed to load chat messages:", err);
        const errorCode = err?.response?.data?.code;
        const status = err?.response?.status;

        if (errorCode !== 1009 && status !== 404 && isMounted) {
          setError("Unable to load messages right now.");
        }
      } finally {
        if (isMounted) {
          setLoadingMessages(false);
        }
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [conversation.id, loadMessages]);

  useEffect(() => {
    if (!messageContainerRef.current) return;
    messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
  }, [currentMessages]);

  // Xử lý gõ phím và gửi trạng thái đang gõ
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (sendTyping) {
      sendTyping(conversation.id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (sendTyping) {
        sendTyping(conversation.id, false);
      }
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      setError(null);
      
      // Khi gửi tin nhắn thì hủy timeout đang đếm ngược và báo dừng gõ ngay lập tức
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (sendTyping) {
        sendTyping(conversation.id, false);
      }

      await sendMessage(conversation.id, message);
      setMessage("");
    } catch (err) {
      console.error("Failed to send chat message:", err);
      setError("Unable to send the message right now.");
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        width: 300,
        height: 400,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "#1877f2",
          color: "#fff",
          px: 2,
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={getAvatarUrl(conversation.conversationAvatar, conversation.gender)}
            alt={conversation.conversationName}
            sx={{ width: 32, height: 32, mr: 1 }}
          />
          <Typography variant="subtitle1" fontWeight="bold">
            {conversation.conversationName}
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={() => onMinimize(conversation)} sx={{ color: "#fff" }}>
            <RemoveIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Message Container */}
      <Box
        id="messageContainer"
        ref={messageContainerRef}
        sx={{ flex: 1, p: 2, overflowY: "auto", display: "flex", flexDirection: "column" }}
      >
        {loadingMessages ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress size={24} />
          </Box>
        ) : currentMessages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              p: 1,
            }}
          >
            <Avatar
              src={getAvatarUrl(conversation.conversationAvatar, conversation.gender)}
              sx={{ width: 56, height: 56, mb: 1.5 }}
            />
            <Typography variant="subtitle2" fontWeight="bold">
              {conversation.conversationName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: "13px" }}>
              You are connected on the system. Say hello!
            </Typography>
          </Box>
        ) : (
          currentMessages.map((msg) => {
            let backgroundColor = "#f5f5f5";
            if (msg.me) {
              backgroundColor = msg.failed ? "#ffebee" : "#e3f2fd";
            }

            return (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent: msg.me ? "flex-end" : "flex-start",
                  mb: 2,
                }}
              >
                {!msg.me && (
                  <Avatar
                    src={getAvatarUrl(msg.sender?.avatarUrl || msg.sender?.avatar, msg.sender?.gender)}
                    sx={{
                      mr: 1,
                      alignSelf: "flex-end",
                      width: 32,
                      height: 32,
                    }}
                  />
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: "70%",
                    backgroundColor,
                    borderRadius: 2,
                    opacity: msg.pending ? 0.7 : 1,
                  }}
                >
                  <Typography variant="body2">{msg.message}</Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{ mt: 0.5 }}
                  >
                    {msg.failed && (
                      <Typography variant="caption" color="error">
                        Failed to send
                      </Typography>
                    )}
                    {msg.pending && (
                      <Typography variant="caption" color="text.secondary">
                        Sending...
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ display: "block", textAlign: "right", fontSize: "10px" }}>
                      {formatLocaleTime(msg.createdDate, { hour: "2-digit", minute: "2-digit" }, "Just now")}
                    </Typography>
                  </Stack>
                </Paper>
                {msg.me && (
                  <Avatar
                    src={getAvatarUrl(msg.sender?.avatarUrl || msg.sender?.avatar, msg.sender?.gender)}
                    sx={{
                      ml: 1,
                      alignSelf: "flex-end",
                      width: 32,
                      height: 32,
                      bgcolor: "#1976d2",
                    }}
                  />
                )}
              </Box>
            );
          })
        )}
      </Box>

      {/* Hiển thị trạng thái đang gõ */}
      {isTyping && (
        <Typography
          variant="caption"
          sx={{ px: 2, py: 0.5, fontStyle: "italic", color: "text.secondary", fontSize: "11px" }}
        >
          {conversation.conversationName} is typing...
        </Typography>
      )}

      <Divider />

      {/* Input Box */}
      <Box
        component="form"
        sx={{ p: 1, display: "flex", alignItems: "center" }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <EmojiInput
          value={message}
          onChange={handleInputChange}
          size="small"
          fullWidth
          placeholder="Type a message..."
          variant="outlined"
        />
        <IconButton
          color="primary"
          sx={{ ml: 1 }}
          onClick={handleSendMessage}
          disabled={!message.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}