import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Divider,
  Avatar,
  Stack,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";


import RemoveIcon from "@mui/icons-material/Remove";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

import { useChat } from "../providers/ChatProvider";


// import {
//   getMyConversations,
//   createConversation,
//   getMessages,
//   createMessage,
// } from "../services/chatService"
// import { io } from "socket.io-client";
// import { getToken } from "../services/localStorageService";
// import { useSocket } from "../components/SocketContext"


export default function ChatBox({ conversation, onClose, onMinimize }) {
  const [message, setMessage] = useState("");
  const messageContainerRef = useRef(null);
  const {
    messagesMap,
    loadMessages,
    sendMessage,
  } = useChat();
  const [error, setError] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const currentMessages = messagesMap[conversation.id] || [];

//  Load messges
  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        setError(null);
        await loadMessages(conversation.id);
      } catch (error) {
        console.error("Failed to load chat messages:", error);
        if (isMounted) {
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

  const handleSendMessage = async () =>{
    if(!message.trim()) return;
    try {
      setError(null);
      await sendMessage(conversation.id,message);
      setMessage("");
    } catch (error) {
      console.error("Failed to send chat message:", error);
      setError("Unable to send the message right now.");
    }
  };





  // const [newChatAnchorEl, setNewChatAnchorEl] = useState(null);
  // const [loading, setLoading] = useState(false);
  // const [selectedConversation, setSelectedConversation] = useState(null);
  // const [messagesMap, setMessagesMap] = useState({});
  // const [conversations, setConversations] = useState([]);
  // const messageContainerRef = useRef(null);
  // const [openedChats, setOpenedChats] = useState([]);
  // const [minimizedChats, setMinimizedChats] = useState([]);

  // const socketRef = useRef(null);

  // const { socket, connected } = useSocket();

  // const handleMinimize = (chat) => {
  //   setMinimizedChats((prev) => [...prev, chat]);
  //   setOpenedChats((prev) => prev.filter((c) => c.id !== chat.id));
  // };

  // const handleRestoreChat = (chat) => {
  //   if (!openedChats.find((c) => c.id === chat.id)) {
  //     setOpenedChats((prev) => [...prev, chat]);
  //   }
  //   setMinimizedChats((prev) => prev.filter((c) => c.id !== chat.id));
  // };

  // const scrollToBottom = useCallback(() => {
  //   if (messageContainerRef.current) {
  //     // Immediate scroll attempt
  //     messageContainerRef.current.scrollTop =
  //       messageContainerRef.current.scrollHeight;

  //     // Backup attempt with a small timeout to ensure DOM updates are complete
  //     setTimeout(() => {
  //       messageContainerRef.current.scrollTop =
  //         messageContainerRef.current.scrollHeight;
  //     }, 100);

  //     // Final attempt with a longer timeout
  //     setTimeout(() => {
  //       messageContainerRef.current.scrollTop =
  //         messageContainerRef.current.scrollHeight;
  //     }, 300);
  //   }
  // }, []);

  // // useEffect(() => {
  // //   // // Initialize socket connection only once
  // //   // const socket = getSocket();

  // //   socketRef.current = socket;
  // //   if (!socket.connected) {
  // //     socket.connect();
  // //   }

  // //   const handleMessage = (message) => {
  // //     try {
  // //       const messageObject = typeof message === "string" ? JSON.parse(message) : message;
  // //       console.log("📩 New message received:", messageObject);
  // //       if (messageObject?.conversationId) {
  // //         handleIncomingMessage(messageObject);
  // //       }
  // //     } catch (err) {
  // //       console.error("❌ Error parsing message:", err);
  // //     }
  // //   };
  // //   socket.on("message", handleMessage);
  // //   // Cleanup function - disconnect socket when component unmounts
  // //   return () => {
  // //     if (socketRef.current) {
  // //       // console.log("🔌 Disconnecting socket...");
  // //       socket.off("message", handleMessage);
  // //     }
  // //   };
  // // }, []);

  // useEffect(() => {

  //   if (!socket) return;


  //   const handleMessage = (message) => {
  //     try {
  //       const messageObject = typeof message === "string" ? JSON.parse(message) : message;
  //       console.log("📩 New message received:", messageObject);
  //       if (messageObject?.conversationId) {
  //         console.log(messageObject);
  //         handleIncomingMessage(messageObject);
  //       }
  //     } catch (err) {
  //       console.error("❌ Error parsing message:", err);
  //     }
  //   };

  //   socket.on("chat_message", handleMessage);
  //   // Cleanup function - disconnect socket when component unmounts
  //   return () => {
  //     if (socketRef.current) {
  //       // console.log("🔌 Disconnecting socket...");
  //       socket.off("chat_message", handleMessage);
  //     }
  //   };
  // }, [socket, connected]);


  // const handleIncomingMessage = useCallback(
  //   (event) => {

  //     const message = {
  //       id: event.payload.id,
  //       message: event.payload.content,
  //       createdDate: event.payload.createdDate,
  //       sender: {
  //         id: event.payload.sender?.id,
  //         avatar: event.payload.sender?.avatarUrl || "default-avatar-url", // fallback
  //         name: event.payload.sender?.name || "Unknown",
  //       },
  //       me: event.payload.me,
  //       conversationId: event.conversationId,
  //     }

  //     // Add the new message to the appropriate conversation
  //     setMessagesMap((prev) => {
  //       const existingMessages = prev[message.conversationId] || [];
  //       // Check if message already exists to avoid duplicates
  //       const messageExists = existingMessages.some((msg) => {
  //         // Primary: Compare by ID if both messages have IDs
  //         if (msg.id && message.id) {
  //           return msg.id === message.id;
  //         }

  //         return false;
  //       });

  //       if (!messageExists) {
  //         const updatedMessages = [...existingMessages, message].sort(
  //           (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
  //         );

  //         return {
  //           ...prev,
  //           [message.conversationId]: updatedMessages,
  //         };
  //       }

  //       console.log("Message already exists, not adding");
  //       return prev;
  //     });

  //     // Update the conversation list with the new last message
  //     setConversations((conversation) => {
  //       const updatedConversations = conversation.map((conv) =>
  //         conv.id === message.conversationId
  //           ? {
  //             ...conv,
  //             lastMessage: message.message,
  //             lastTimestamp: new Date(message.createdDate).toLocaleString(),
  //             modifiedDate: message.createdDate,
  //           }
  //           : conv
  //       );

  //       return updatedConversations;
  //     });
  //   },
  //   [selectedConversation]
  // );


  // // Load messages from the conversation history when a conversation is selected
  // useEffect(() => {
  //   const fetchMessages = async (conversationId) => {
  //     try {
  //       // Check if we already have messages for this conversation
  //       if (!messagesMap[conversationId]) {
  //         const response = await getMessages(conversationId);
  //         if (response?.data?.result) {
  //           // Sort messages by createdDate to ensure chronological order
  //           const sortedMessages = [...response.data.result].sort(
  //             (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
  //           );

  //           // Update messages map with the fetched messages
  //           setMessagesMap((prev) => ({
  //             ...prev,
  //             [conversationId]: sortedMessages,
  //           }));
  //         }
  //       }

  //       // Mark conversation as read when selected
  //       setConversations((conversation) =>
  //         conversation.map((conv) =>
  //           conv.id === conversationId ? { ...conv, unread: 0 } : conv
  //         )
  //       );
  //     } catch (err) {
  //       console.error(
  //         `Error fetching messages for conversation ${conversationId}:`,
  //         err
  //       );
  //     }
  //   };

  //   fetchMessages(conversation.id);

  // }, [selectedConversation, messagesMap]);

  // const currentMessages = conversation
  //   ? messagesMap[conversation.id] || []
  //   : [];
  // // Automatically scroll to the bottom when messages change or after sending a message
  // useEffect(() => {
  //   scrollToBottom();
  // }, [currentMessages, scrollToBottom]);

  // // Also scroll when the conversation changes
  // useEffect(() => {
  //   scrollToBottom();
  // }, [selectedConversation, scrollToBottom]);

  // const handleSendMessage = async () => {
  //   console.log("Message" + message.trim())
  //   console.log(conversation)
  //   if (!message.trim() || !conversation) return;

  //   // Clear input field
  //   setMessage("");

  //   try {
  //     // Send message to API
  //     const response = await createMessage({
  //       conversationId: conversation.id,
  //       message: message,
  //     });
  //   } catch (error) {
  //     console.error("Failed to send message:", error);
  //   }
  // };
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
            src={conversation.conversationAvatar || ""}
            alt={conversation.conversationName}
            sx={{ width: 32, height: 32, mr: 1 }}
          />
          <Typography variant="subtitle1" fontWeight="bold">
            {conversation.conversationName}
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={() => onMinimize(conversation)}
            sx={{ color: "#fff" }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box id="messageContainer"
        ref={messageContainerRef} sx={{ flex: 1, p: 1, overflowY: "auto" }}>
        {error && (
          <Alert
            severity="warning"
            sx={{ mb: 1 }}
            action={
              <Button color="inherit" size="small" onClick={() => loadMessages(conversation.id)}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        {loadingMessages ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : null}
        {currentMessages.map((msg) => {
          // Extract background color logic to avoid nested ternary
          let backgroundColor = "#f5f5f5"; // default for others
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
                  src={msg.sender?.avatar}
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
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Sending...
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    sx={{ display: "block", textAlign: "right" }}
                  >
                    {new Date(msg.createdDate).toLocaleString()}
                  </Typography>
                </Stack>{" "}
              </Paper>
              {msg.me && (
                <Avatar
                  src={msg.sender?.avatar}
                  sx={{
                    ml: 1,
                    alignSelf: "flex-end",
                    width: 32,
                    height: 32,
                    bgcolor: "#1976d2",
                  }}
                >
                </Avatar>
              )}
            </Box>
          );
        })}
      </Box>

      <Divider />

      <Box
        component="form"
        sx={{ p: 1 }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}>
        <TextField
          size="small"
          fullWidth
          value={message}
          placeholder="Nhập tin nhắn..."
          onChange={(e) => setMessage(e.target.value)}
          variant="outlined"
        />
        <IconButton
          color="primary"
          sx={{
            ml: -5, // đè icon vào trong TextField
            zIndex: 1,
          }}
          onClick={handleSendMessage}
          disabled={!message.trim()}

        >
          <SendIcon />
        </IconButton>
      </Box>

    </Paper>

  );

}