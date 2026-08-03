import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import {
  createConversation,
  createMessage,
  getMessages,
  getMyConversations,
} from "../../features/chat/services/chatService";

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { subscribe } = useSocket();

  const [messagesMap, setMessagesMap] = useState({});
  const [conversations, setConversations] = useState([]);
  const [openedConversationIds, setOpenedConversationIds] = useState([]);

  const handleIncomingMessage = useCallback(
    (event) => {
      const { conversationId, payload } = event;
      if (!conversationId || !payload) return;

      setMessagesMap((previous) => ({
        ...previous,
        [conversationId]: [
          ...(previous[conversationId] || []),
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
        ],
      }));

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                lastMessage: payload.content,
                lastTimestamp: payload.createdDate,
                unread:
                  openedConversationIds.includes(conversationId) || payload.me
                    ? 0
                    : (conversation.unread || 0) + 1,
              }
            : conversation
        )
      );
    },
    [openedConversationIds]
  );

  const loadConversations = useCallback(async () => {
    const response = await getMyConversations();
    const listConversations = response?.data?.result || [];

    setConversations(
      listConversations.map((conversation) => ({
        ...conversation,
        unread: conversation.unread || 0,
      }))
    );
  }, []);

  const loadMessages = useCallback(
    async (conversationId) => {
      if (messagesMap[conversationId]) return;

      const response = await getMessages(conversationId);
      const sorted =
        response?.data?.result?.sort(
          (left, right) => new Date(left.createdDate) - new Date(right.createdDate)
        ) || [];

      setMessagesMap((previous) => ({
        ...previous,
        [conversationId]: sorted,
      }));
    },
    [messagesMap]
  );

  const startConversation = useCallback(async (userId) => {
    const response = await createConversation({
      type: "DIRECT",
      participantIds: [userId],
    });

    const newConversation = response?.data?.result;
    setConversations((previous) => [newConversation, ...previous]);
    return newConversation;
  }, []);

  const sendMessage = useCallback(async (conversationId, content) => {
    if (!content.trim()) return;

    await createMessage({
      conversationId,
      message: content,
    });
  }, []);

  

  useEffect(() => {
    const unsubscribe = subscribe("chat_message", handleIncomingMessage);
    return () => unsubscribe && unsubscribe();
  }, [subscribe, handleIncomingMessage]);

  return (
    <ChatContext.Provider
      value={{
        messagesMap,
        conversations,
        openedConversationIds,
        loadConversations,
        loadMessages,
        startConversation,
        sendMessage,
        setOpenedConversationIds,
        setConversations,
        setMessagesMap,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
export const useChatContext = useChat;