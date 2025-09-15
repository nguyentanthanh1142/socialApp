import React, { useState, useEffect, useRef, useCallback } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";

import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import ChatIcon from "@mui/icons-material/Chat";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { getToken } from "../services/localStorageService";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import {
  getMyConversations,
  createConversation,
  getMessages,
  createMessage,
} from "../services/chatService";
import ChatBox from "./ChatBox";
const friends = ["Alice", "Bob", "Charlie"];

export default function FriendList() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [message, setMessage] = useState("");
  const messageContainerRef = useRef(null);
  const socketRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const friends = ["Alice", "Bob", "Charlie", "David"];
  const [openedChats, setOpenedChats] = useState([]);
  const [minimizedChats, setMinimizedChats] = useState([]);


  const handleMinimize = (chat) => {
    setMinimizedChats((prev) => {
      const exists = prev.find((c) => c.id === chat.id);
      if (exists) return prev; // đã mở thì không mở lại
      const newChat = [...prev, chat];
      localStorage.setItem("minimizeChats", JSON.stringify(newChat)); // lưu vào localStorage
      return newChat;
    });

    setOpenedChats((prev) => {
      const newChats = prev.filter((c) => c.id !== chat.id);

      localStorage.setItem("openedChats", JSON.stringify(newChats));
      return newChats;
    });
    setConversations((conversation) =>
      conversation.map((conv) =>
        conv.id == chat.id ? { ...conv, unread: 0 } : conv
      )
    );
  };
  const handleRestoreChat = (chat) => {
    if (!openedChats.find((c) => c.id === chat.id)) {
      setOpenedChats((prev) => {
        const exists = prev.find((c) => c.id === chat.id);
        if (exists) return prev; // đã mở thì không mở lại
        const newChat = [...prev, chat];
        localStorage.setItem("openedChats", JSON.stringify(newChat)); // lưu vào localStorage
        return newChat;
      });
    }
    setMinimizedChats((prev) => {
      const newChat = prev.filter((c) => c.id !== chat.id);
      localStorage.setItem("minimizeChats", JSON.stringify(newChat)); // lưu vào localStorage
      return newChat;
    });
  };

  const openChatBox = (conversation) => {
    setOpenedChats((prev) => {
      const exists = prev.find((c) => c.id === conversation.id);
      if (exists) return prev; // đã mở thì không mở lại
      const newChat = [...prev, conversation];
      localStorage.setItem("openedChats", JSON.stringify(newChat));
      return newChat;
    });

    setMinimizedChats((prev) => {
      const newChat = prev.filter((c) => c.id !== conversation.id);
      localStorage.setItem("minimizeChats", JSON.stringify(newChat));
      return newChat;
    });

  };
  useEffect(() => {
    const storedChats = localStorage.getItem("openedChats");
    const minimizeChats = localStorage.getItem("minimizeChats");
    if (storedChats) {
      try {
        const chats = JSON.parse(storedChats);
        setOpenedChats(chats);
      } catch (e) {
        console.error("Lỗi khi đọc localStorage:", e);
      }
    }
    if (minimizeChats) {
      try {
        const chats = JSON.parse(minimizeChats);
        setMinimizedChats(chats);
      } catch (e) {
        console.error("Lỗi khi đọc localStorage:", e);
      }
    }
  }, []);
  const closeChatBox = (id) => {
    setOpenedChats((prev) => {
      const newChats = prev.filter((c) => c.id !== id);
      localStorage.setItem("openedChats", JSON.stringify(newChats));
      return newChats;
    });
  };
  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      // Immediate scroll attempt
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;

      // Backup attempt with a small timeout to ensure DOM updates are complete
      setTimeout(() => {
        messageContainerRef.current.scrollTop =
          messageContainerRef.current.scrollHeight;
      }, 100);

      // Final attempt with a longer timeout
      setTimeout(() => {
        messageContainerRef.current.scrollTop =
          messageContainerRef.current.scrollHeight;
      }, 300);
    }
  }, []);
  const handleSelectNewChatUser = async (user) => {
    const response = await createConversation({
      type: "DIRECT",
      participantIds: [user.userId],
    });

    const newConversation = response?.data?.result;

    // Check if we already have a conversation with this user
    const existingConversation = conversations.find(
      (conv) => conv.id === newConversation.id
    );

    if (existingConversation) {
      // If conversation exists, just select it
      setSelectedConversation(existingConversation);
    } else {
      // Add to conversations list
      setConversations((prevConversations) => [
        newConversation,
        ...prevConversations,
      ]);

      // Select this new conversation
      setSelectedConversation(newConversation);
    }
  };

  // Fetch conversations from API
  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyConversations();
      setConversations(response?.data?.result || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations. Please try again later.");
    } finally {

      setLoading(false);
    }
  };

  // Load conversations when component mounts
  useEffect(() => {
    fetchConversations();
  }, []);

  // Initialize with first conversation selected when available
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Load messages from the conversation history when a conversation is selected
  useEffect(() => {
    const fetchMessages = async (conversationId) => {
      try {
        // Check if we already have messages for this conversation
        if (!messagesMap[conversationId]) {
          const response = await getMessages(conversationId);
          if (response?.data?.result) {
            // Sort messages by createdDate to ensure chronological order
            const sortedMessages = [...response.data.result].sort(
              (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
            );

            // Update messages map with the fetched messages
            setMessagesMap((prev) => ({
              ...prev,
              [conversationId]: sortedMessages,
            }));
          }
        }

        // Mark conversation as read when selected
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.id === conversationId ? { ...conv, unread: 0 } : conv
          )
        );

      } catch (err) {
        console.error(
          `Error fetching messages for conversation ${conversationId}:`,
          err
        );
      }
    };

    if (selectedConversation?.id) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, messagesMap]);
  const currentMessages = selectedConversation
    ? messagesMap[selectedConversation.id] || []
    : [];
  // Automatically scroll to the bottom when messages change or after sending a message
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  // Also scroll when the conversation changes
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, scrollToBottom]);

  useEffect(() => {
    // Initialize socket connection only once
    if (!socketRef.current) {
      console.log("Initializing socket connection...");

      const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8999";
      const connectionUrl = `${SOCKET_URL}?token=${getToken()}`;

      socketRef.current = new io(connectionUrl);

      socketRef.current.on("connect", () => {
        console.log("Socket connected");
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socketRef.current.on("message", (message) => {
        console.log("New message received:", message);

        const messageObject = JSON.parse(message);
        console.log("Parsed message object:", messageObject);

        // Update messages in the UI when a new message is received
        if (messageObject?.conversationId) {
          handleIncomingMessage(messageObject);
        }
      });
    }

    // Cleanup function - disconnect socket when component unmounts
    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Update unread count when conversation is selected
  useEffect(() => {
    if (selectedConversation?.id && socketRef.current) {
      // Mark the currently selected conversation as read
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === selectedConversation.id ? { ...conv, unread: 0 } : conv
        )
      );
    }
  }, [selectedConversation]);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    // Clear input field
    setMessage("");

    try {
      // Send message to API
      const response = await createMessage({
        conversationId: selectedConversation.id,
        message: message,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Helper function to handle incoming socket messages
  const handleIncomingMessage = useCallback(
    (message) => {

      // Add the new message to the appropriate conversation
      setMessagesMap((prev) => {
        const existingMessages = prev[message.conversationId] || [];

        // Check if message already exists to avoid duplicates
        const messageExists = existingMessages.some((msg) => {
          // Primary: Compare by ID if both messages have IDs
          if (msg.id && message.id) {
            return msg.id === message.id;
          }

          return false;
        });

        if (!messageExists) {
          const updatedMessages = [...existingMessages, message].sort(
            (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
          );

          return {
            ...prev,
            [message.conversationId]: updatedMessages,
          };
        }

        console.log("Message already exists, not adding");
        return prev;
      });

      // Update the conversation list with the new last message
      setConversations((prevConversations) => {
        const updatedConversations = prevConversations.map((conv) =>
          conv.id === message.conversationId
            ? {
              ...conv,
              lastMessage: message.message,
              lastTimestamp: new Date(message.createdDate).toLocaleString(),
              unread:
                selectedConversation?.id === message.conversationId
                  ? 0
                  : (conv.unread || 0) + 1,
              modifiedDate: message.createdDate,
            }
            : conv
        );

        return updatedConversations;
      });
    },
    [selectedConversation]
  );

  return (
    <>
      <Toolbar />
      <List>
        <Typography> Contacts</Typography>

        {(() => {
          if (loading) {
            return (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress size={28} />
              </Box>
            );
          }
          if (error) {
            return (
              <Box sx={{ p: 2 }}>
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  action={
                    <IconButton
                      color="inherit"
                      size="small"
                      onClick={fetchConversations}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  {error}
                </Alert>
              </Box>
            );
          }
          if (conversations == null || conversations.length === 0) {
            return (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No conversations yet. Start a new chat to begin.
                </Typography>
              </Box>
            );
          }
          return (
            <List sx={{ width: "100%", paddingY: 0 }}>

              {conversations.map((conversation) => (
                <React.Fragment key={conversation.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      //   onClick={() => handleConversationSelect(conversation)
                      onClick={() => openChatBox(conversation)
                      }
                      sx={{
                        py: 1,
                        px: 2,
                        "&:hover": {
                          backgroundColor: "#f0f2f5",
                        },
                      }}
                    >
                      <Badge
                        color="error"
                        badgeContent={conversation.unread}
                        invisible={conversation.unread === 0}
                        overlap="circular"
                      >
                        <Avatar
                          src={conversation.conversationAvatar || ""}
                        />
                      </Badge>
                      <ListItemText
                        primary={conversation.conversationName}
                        primaryTypographyProps={{
                          fontSize: 14,
                          pl: 3,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </React.Fragment>

              ))}
            </List>
          );
        })()}
      </List>
      <Divider />
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          right: 0,
          display: "flex",
          flexDirection: "row-reverse",
          gap: 2,
          p: 2,
          zIndex: 1300, // Trên tất cả
        }}
      >
        {/* {openedChats.map((conversation) => (
    <ChatBox
      key={conversation.id}
      conversation={conversation}
      onClose={() => closeChatBox(conversation.id)}
    />
  ))} */}
        {openedChats.map((chat, index) => (
          <ChatBox
            key={chat.id}
            conversation={chat}
            onMinimize={(c) => handleMinimize(c)}
            onClose={() => closeChatBox(chat.id)}
            sx={{
              position: "fixed",
              bottom: 70,
              right: 20 + index * 340,
              width: 320,
              boxShadow: 5,
            }}
          />
        ))}


        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            right: 0,
            display: "flex",
            gap: 1,
            p: 1,
            zIndex: 1300,
          }}
        >
          {minimizedChats.map((chat) => (
            <Avatar
              key={chat.id}
              alt={chat.conversationName}
              src={chat.conversationAvatar}
              sx={{
                width: 56,
                height: 56,
                cursor: "pointer",
                border: "2px solid #1976d2",
                boxShadow: 3,
              }}
              onClick={() => handleRestoreChat(chat)}
            />
          ))}
        </Box>
      </Box>
    </>

  );

}