import React, { useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Avatar,
  TextField,
  Alert,
  Stack,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export default function ChatWindow({
  selectedConversation,
  messages,
  message,
  setMessage,
  onSendMessage,
  messageError,
}) {
  const messageContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
      setTimeout(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop =
            messageContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation, scrollToBottom]);

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      {selectedConversation ? (
        <>
          {/* Header của khung chat */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Avatar
              src={selectedConversation.conversationAvatar}
              sx={{ mr: 2 }}
            />
            <Typography variant="h6">
              {selectedConversation.conversationName}
            </Typography>
          </Box>

          {/* Khu vực chứa lịch sử tin nhắn */}
          <Box
            id="messageContainer"
            ref={messageContainerRef}
            sx={{
              flexGrow: 1,
              p: 2,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                margin: "auto 0 0 0",
              }}
            >
              {messageError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {messageError}
                </Alert>
              )}
              {messages.map((msg) => {
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
                        src={msg.sender?.avatarUrl || msg.sender?.avatar}
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
                        p: 2,
                        maxWidth: "70%",
                        backgroundColor,
                        borderRadius: 2,
                        opacity: msg.pending ? 0.7 : 1,
                      }}
                    >
                      <Typography variant="body1">{msg.message}</Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="flex-end"
                        sx={{ mt: 1 }}
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
                        <Typography
                          variant="caption"
                          sx={{ display: "block", textAlign: "right" }}
                        >
                          {new Date(msg.createdDate).toLocaleString()}
                        </Typography>
                      </Stack>
                    </Paper>
                    {msg.me && (
                      <Avatar
                        sx={{
                          ml: 1,
                          alignSelf: "flex-end",
                          width: 32,
                          height: 32,
                          bgcolor: "#1976d2",
                        }}
                      >
                        You
                      </Avatar>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Ô nhập tin nhắn */}
          <Box
            component="form"
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
            }}
            onSubmit={(e) => {
              e.preventDefault();
              onSendMessage();
            }}
          >
            <TextField
              fullWidth
              placeholder="Type a message"
              variant="outlined"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              size="small"
            />
            <IconButton
              color="primary"
              sx={{ ml: 1 }}
              onClick={onSendMessage}
              disabled={!message.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Select a conversation to start chatting
          </Typography>
        </Box>
      )}
    </Box>
  );
}