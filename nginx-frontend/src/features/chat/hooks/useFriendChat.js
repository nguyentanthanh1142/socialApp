import { useState, useEffect, useCallback, useRef } from "react";
import { useChat } from "../../../providers/ChatProvider";
import useInfiniteScroll from "../../../shared/hooks/useInfiniteScroll";
import { getListContactRelation } from "../../friends/services/friendService";
import { getCurrentUserId } from "../../auth/services/authenticationService";

const normalizeContact = (item) => {
  const currentUserId = getCurrentUserId();
  
  // Tìm người còn lại trong mảng participants (để lấy tên/avatar hiển thị nếu cần)
  const targetParticipant = item.participants?.find(
    (p) => String(p.userId) !== String(currentUserId)
  ) || item.participants?.[0];

  return {
    ...item,
    id: item.id, 
    conversationId: item.id,
    conversationName:
      item.conversationName ||
      targetParticipant?.username ||
      [targetParticipant?.firstname, targetParticipant?.lastname].filter(Boolean).join(" ") ||
      "Unknown",
    conversationAvatar:
      item.conversationAvatar || targetParticipant?.avatarUrl || targetParticipant?.avatar || "",
    unread: item.unread || 0,
    participants: item.participants || [],
  };
};

export function useFriendChat() {
  const {
    messagesMap,
    loadMessages,
    markConversationOpened,
    markConversationClosed,
    startConversation,
  } = useChat();

  const [contacts, setContacts] = useState([]);
  const [openedChats, setOpenedChats] = useState([]);
  const [minimizedChats, setMinimizedChats] = useState([]);

  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialLoadedRef = useRef(false);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getListContactRelation({ page: 0, size: 10 });
      const resultData = res?.data?.result;
      const list = (resultData?.data || []).map(normalizeContact);

      setContacts(list);
      setHasNext(Boolean(resultData?.hasNext));
      setPage(resultData?.currentPage ?? 0);
      initialLoadedRef.current = true;
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialLoadedRef.current) return;
    loadContacts();
  }, [loadContacts]);

  const fetchNextPage = useCallback(async () => {
    if (loadingMore || !hasNext) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getListContactRelation({ page: nextPage, size: 10 });
      const resultData = res?.data?.result;
      const newData = (resultData?.data || []).map(normalizeContact);

      setContacts((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const merged = [...prev];
        newData.forEach((item) => {
          if (item.id && !existingIds.has(item.id)) {
            merged.push(item);
          }
        });
        return merged;
      });
      setPage(nextPage);
      setHasNext(Boolean(resultData?.hasNext));
    } catch (err) {
      console.error("Error loading more contacts:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasNext, loadingMore]);

  const { lastElementRef } = useInfiniteScroll({
    hasNextPage: hasNext,
    isFetching: loadingMore,
    fetchNextPage,
  });

  useEffect(() => {
    try {
      const storedChats = localStorage.getItem("openedChats");
      const storedMinimized = localStorage.getItem("minimizeChats");
      if (storedChats) setOpenedChats(JSON.parse(storedChats));
      if (storedMinimized) setMinimizedChats(JSON.parse(storedMinimized));
    } catch (err) {
      console.warn("Failed to restore chat UI state:", err);
    }
  }, []);

  const openChatBox = useCallback(
    async (contactItem) => {
      const currentUserId = getCurrentUserId();
      
      const targetParticipant = contactItem.participants?.find(
        (p) => String(p.userId) !== String(currentUserId)
      );
      const targetUserId = targetParticipant?.userId || contactItem.userId;

      let actualConversationId = contactItem.conversationId; // Hoặc nếu backend lưu conversation riêng

      // NẾU BẠN BIẾT CHẮC contactItem.id HIỆN TẠI LÀ RELATION ID, HÃY DÙNG targetUserId ĐỂ GỌI LẤY CONVERSATION ID CHUẨN:
      if (targetUserId) {
        try {
          const newConv = await startConversation(targetUserId); 
          // newConv trả về từ startConversation chắc chắn là object Conversation xịn của Chat Service
          if (newConv?.id) {
            actualConversationId = newConv.id;
          }
        } catch (err) {
          console.error("Failed to get or create conversation:", err);
        }
      }

      if (!actualConversationId) return;

      // Tạo object chat hoàn chỉnh với ID phòng chat chuẩn 100%
      const chatToOpen = {
        ...contactItem,
        id: actualConversationId, // Ghi đè bằng conversationId chuẩn
        conversationId: actualConversationId,
        conversationName:
          contactItem.conversationName ||
          targetParticipant?.username ||
          [targetParticipant?.firstname, targetParticipant?.lastname].filter(Boolean).join(" ") ||
          "Unknown",
        conversationAvatar:
          contactItem.conversationAvatar || targetParticipant?.avatar || "",
      };

      setOpenedChats((prev) => {
        const exists = prev.find((c) => c.id === chatToOpen.id);
        if (exists) return prev;
        const newChats = [...prev, chatToOpen];
        localStorage.setItem("openedChats", JSON.stringify(newChats));
        return newChats;
      });

      setMinimizedChats((prev) => {
        const next = prev.filter((c) => c.id !== chatToOpen.id);
        localStorage.setItem("minimizeChats", JSON.stringify(next));
        return next;
      });

      setContacts((prev) =>
        prev.map((c) => (c.id === chatToOpen.id ? { ...c, unread: 0 } : c))
      );

      markConversationOpened(chatToOpen.id);
      loadMessages(chatToOpen.id); // Lúc này chắc chắn là conversationId chuẩn không cần chỉnh!
    },
    [loadMessages, markConversationOpened, startConversation]
  );
  const closeChatBox = useCallback(
    (id) => {
      setOpenedChats((prev) => {
        const newChats = prev.filter((c) => c.id !== id);
        localStorage.setItem("openedChats", JSON.stringify(newChats));
        return newChats;
      });

      setMinimizedChats((prev) => {
        const newChats = prev.filter((c) => c.id !== id);
        localStorage.setItem("minimizeChats", JSON.stringify(newChats));
        return newChats;
      });

      markConversationClosed(id);
    },
    [markConversationClosed]
  );

  const handleMinimize = useCallback(
    (chat) => {
      setOpenedChats((prev) => {
        const next = prev.filter((c) => c.id !== chat.id);
        localStorage.setItem("openedChats", JSON.stringify(next));
        return next;
      });
      setMinimizedChats((prev) => {
        const exists = prev.find((c) => c.id === chat.id);
        if (exists) return prev;
        const newChats = [...prev, chat];
        localStorage.setItem("minimizeChats", JSON.stringify(newChats));
        return newChats;
      });
      markConversationClosed(chat.id);
    },
    [markConversationClosed]
  );

  const handleRestoreChat = useCallback(
    (chat) => {
      setMinimizedChats((prev) => {
        const next = prev.filter((c) => c.id !== chat.id);
        localStorage.setItem("minimizeChats", JSON.stringify(next));
        return next;
      });
      setOpenedChats((prev) => {
        const exists = prev.find((c) => c.id === chat.id);
        if (exists) return prev;
        const newChats = [...prev, chat];
        localStorage.setItem("openedChats", JSON.stringify(newChats));
        return newChats;
      });
      markConversationOpened(chat.id);
      loadMessages(chat.id);
    },
    [loadMessages, markConversationOpened]
  );

  return {
    contacts,
    conversations: contacts,
    messagesMap,
    loading,
    error,
    loadingMore,
    hasNext,
    lastElementRef,
    openedChats,
    minimizedChats,
    loadConversations: loadContacts,
    openChatBox,
    closeChatBox,
    handleMinimize,
    handleRestoreChat,
  };
}
