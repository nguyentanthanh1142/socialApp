import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSocket } from "./SocketProvider";
import {
  createOrGetConversation,
  createMessage,
  getMessages,
  getMyConversations,
} from "../features/chat/services/chatService";
import { isAuthenticated } from "../features/auth/services/authenticationService";
import { AuthContext } from "../context/AuthContext";

export const ChatContext = createContext(null);

const filterUnique = (list) => {
  const uniqueMap = new Map();
  list.forEach((item) => {
    if (item?.id) {
      uniqueMap.set(item.id, item);
    }
  });
  return Array.from(uniqueMap.values());
};

export const ChatProvider = ({ children }) => {
  const { subscribe, emit } = useSocket();
  const authContext = useContext(AuthContext);
  const isAuth = authContext?.isAuthenticated;

  const [messagesMap, setMessagesMap] = useState({});
  const [conversations, setConversations] = useState([]);
  
  // Khởi tạo openedConversationIds từ localStorage
  const [openedConversationIds, setOpenedConversationIds] = useState(() => {
    try {
      const saved = localStorage.getItem("opened_conversations");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [typingMap, setTypingMap] = useState({});

  const openedIdsRef = useRef(openedConversationIds);
  const conversationsRef = useRef(conversations);
  const loadingMessagesRef = useRef(new Set());

  useEffect(() => {
    openedIdsRef.current = openedConversationIds;
    try {
      localStorage.setItem("opened_conversations", JSON.stringify(openedConversationIds));
    } catch (e) {
      console.error("Failed to save opened conversations to localStorage", e);
    }
  }, [openedConversationIds]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Hàm join phòng an toàn (SocketProvider của bạn sẽ tự chặn nếu chưa kết nối, nên ta dùng setInterval thử lại cho đến khi thành công hoặc socket connected)
  useEffect(() => {
    const joinAllOpenedRooms = () => {
      const currentOpened = openedIdsRef.current;
      if (currentOpened && currentOpened.length > 0) {
        console.log("🔄 [SOCKET] Re-joining rooms:", currentOpened);
        currentOpened.forEach((conversationId) => {
          if (conversationId) {
            emit("join_room", { conversationId });
          }
        });
      }
    };

    // Lắng nghe sự kiện connect từ SocketProvider
    const unsubscribeConnect = subscribe("connect", () => {
      console.log("🔌 [SOCKET] Connected event received, triggering room re-join...");
      joinAllOpenedRooms();
    });

    // Phòng hờ trường hợp socket đã connect trước khi component mount, ta thử kiểm tra sau 1s và 2s
    const timer = setTimeout(() => {
      joinAllOpenedRooms();
    }, 1000);

    return () => {
      if (typeof unsubscribeConnect === "function") unsubscribeConnect();
      clearTimeout(timer);
    };
  }, [subscribe, emit]);

  // Xử lý khi có tin nhắn đến từ Socket
  const handleIncomingMessage = useCallback((rawEvent) => {
    let event = rawEvent;
    if (typeof rawEvent === "string") {
      try {
        event = JSON.parse(rawEvent);
      } catch (e) {
        return;
      }
    }

    const { conversationId, payload } = event || {};
    if (!conversationId || !payload) return;

    setMessagesMap((previous) => {
      const currentList = previous[conversationId] || [];
      const exists = currentList.some((msg) => msg.id === payload.id);
      if (exists) return previous;

      const updatedMessages = [
        ...currentList,
        {
          id: payload.id,
          message: payload.content,
          sender: {
            id: payload.sender?.id,
            avatar: payload.sender?.avatarUrl,
            name: payload.sender?.name || "Unknown",
          },
          me: payload.me,
          createdDate: payload.createdDate,
        },
      ];
      return {
        ...previous,
        [conversationId]: updatedMessages,
      };
    });

    setConversations((previous) => {
      const updated = previous.map((conversation) => {
        if (conversation.id === conversationId) {
          const isOpened = openedIdsRef.current.includes(conversationId);
          return {
            ...conversation,
            lastMessage: payload.content,
            lastTimestamp: payload.createdDate,
            unread: isOpened || payload.me ? 0 : (conversation.unread || 0) + 1,
          };
        }
        return conversation;
      });
      return filterUnique(updated);
    });
  }, []);

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      const response = await getMyConversations();
      const listConversations = response?.data?.result || [];
      const formatted = listConversations.map((conversation) => ({
        ...conversation,
        unread: conversation.unread || 0,
      }));
      setConversations(filterUnique(formatted));
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  }, []);

  useEffect(() => {
    if (isAuth || isAuthenticated()) {
      loadConversations();
    } else {
      setConversations([]);
      setMessagesMap({});
    }
  }, [isAuth, loadConversations]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    if (loadingMessagesRef.current.has(conversationId)) return;

    let alreadyLoaded = false;
    setMessagesMap((previous) => {
      if (previous[conversationId]) alreadyLoaded = true;
      return previous;
    });
    if (alreadyLoaded) return;

    loadingMessagesRef.current.add(conversationId);
    try {
      const response = await getMessages(conversationId);
      const sorted =
        response?.data?.result?.sort(
          (left, right) =>
            new Date(left.createdDate) - new Date(right.createdDate)
        ) || [];

      setMessagesMap((previous) => ({
        ...previous,
        [conversationId]: sorted,
      }));
    } catch (err) {
      const status = err?.response?.status;
      const errorCode = err?.response?.data?.code;
      if (status === 404 || errorCode === 1009) {
        setMessagesMap((previous) => ({
          ...previous,
          [conversationId]: [],
        }));
      }
    } finally {
      loadingMessagesRef.current.delete(conversationId);
    }
  }, []);

  const markConversationOpened = useCallback((conversationId) => {
    if (!conversationId) return;

    emit("join_room", { conversationId });

    setOpenedConversationIds((previous) =>
      previous.includes(conversationId)
        ? previous
        : [...previous, conversationId]
    );

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unread: 0 }
          : conversation
      )
    );
  }, [emit]);

  const markConversationClosed = useCallback((conversationId) => {
    if (!conversationId) return;
    setOpenedConversationIds((previous) =>
      previous.filter((id) => id !== conversationId)
    );
  }, []);

  const startConversation = useCallback(async (userId) => {
    try {
      const response = await createOrGetConversation({
        type: "DIRECT",
        participantIds: [userId],
      });

      const newConversation = response?.data?.result;
      if (newConversation) {
        setConversations((previous) =>
          filterUnique([newConversation, ...previous])
        );
      }
      return newConversation;
    } catch (err) {
      console.error("Failed to start conversation:", err);
      throw err;
    }
  }, []);

  const sendMessageToConversation = useCallback(async (conversationId, content) => {
    if (!content?.trim() || !conversationId) return;

    try {
      const response = await createMessage({
        conversationId,
        message: content,
      });

      const sentMessage = response?.data?.result;

      if (sentMessage) {
        setConversations((previous) => {
          const updated = previous.map((conversation) => {
            if (conversation.id === conversationId) {
              return {
                ...conversation,
                lastMessage: sentMessage.message,
                lastTimestamp: sentMessage.createdDate,
              };
            }
            return conversation;
          });
          return filterUnique(updated);
        });
      }

      return sentMessage;
    } catch (err) {
      console.error("Failed to send message to conversation:", err);
      throw err;
    }
  }, []);

  const sendMessageToUser = useCallback(async (userId, content) => {
    if (!content?.trim() || !userId) return;

    let conversationId = null;

    const existingByParticipant = conversationsRef.current.find((c) => {
      if (c.type === "DIRECT" && c.participants) {
        return c.participants.some(
          (p) => String(p.userId || p.id) === String(userId)
        );
      }
      return false;
    });

    if (existingByParticipant) {
      conversationId = existingByParticipant.id;
    } else {
      try {
        const response = await createOrGetConversation({
          type: "DIRECT",
          participantIds: [userId],
        });

        const newConversation = response?.data?.result;
        if (!newConversation?.id) {
          throw new Error("Unable to get or create conversation");
        }

        conversationId = newConversation.id;
        setConversations((previous) =>
          filterUnique([newConversation, ...previous])
        );
      } catch (err) {
        console.error("Failed to get or create conversation for user:", err);
        throw err;
      }
    }

    return await sendMessageToConversation(conversationId, content);
  }, [sendMessageToConversation]);

  // Đăng ký nhận tin nhắn chat
  useEffect(() => {
    const unsubscribe = subscribe("chat_message", handleIncomingMessage);
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [subscribe, handleIncomingMessage]);

  const handleIncomingTyping = useCallback((rawEvent) => {
    let event = rawEvent;
    if (typeof rawEvent === "string") {
      try {
        event = JSON.parse(rawEvent);
      } catch (e) {
        return;
      }
    }

    const { conversationId, isTyping } = event || {};
    if (!conversationId) return;

    setTypingMap((prev) => ({
      ...prev,
      [conversationId]: isTyping,
    }));
  }, []);

  useEffect(() => {
    const unsubscribeTyping = subscribe("user_typing", handleIncomingTyping);
    return () => {
      if (typeof unsubscribeTyping === "function") unsubscribeTyping();
    };
  }, [subscribe, handleIncomingTyping]);

  const sendTyping = useCallback((conversationId, isTyping) => {
    if (typeof emit === "function") {
      emit("typing_start", { conversationId, isTyping });
    }
  }, [emit]);

  const value = useMemo(
    () => ({
      messagesMap,
      conversations,
      openedConversationIds,
      typingMap,
      loadConversations,
      loadMessages,
      startConversation,
      sendMessageToConversation,
      sendMessage: sendMessageToConversation,
      sendMessageToUser,
      markConversationOpened,
      markConversationClosed,
      sendTyping,
      setOpenedConversationIds,
      setConversations,
      setMessagesMap,
    }),
    [
      messagesMap,
      conversations,
      openedConversationIds,
      typingMap,
      loadConversations,
      loadMessages,
      startConversation,
      sendMessageToConversation,
      sendMessageToUser,
      markConversationOpened,
      markConversationClosed,
      sendTyping,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used inside ChatProvider");
  }
  return context;
};

export const useChatContext = useChat;