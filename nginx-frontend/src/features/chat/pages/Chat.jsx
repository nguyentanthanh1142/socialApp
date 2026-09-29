import React, { useState, useEffect } from "react";
import { Card } from "@mui/material";
import Scene from "../../../components/Scene";
import SideMenu from "../../../components/header/SideMenu";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import { useChat } from "../../../providers/ChatProvider"; // Sử dụng Global Provider
import usePageTitle from "../../../hooks/usePageTitle";

export default function Chat() {
  usePageTitle("Messages");

  const [message, setMessage] = useState("");
  const [newChatAnchorEl, setNewChatAnchorEl] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageError, setMessageError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🚀 Lấy toàn bộ state và hàm xử lý từ Global ChatProvider
  const {
    conversations,
    messagesMap,
    loadMessages,
    startConversation,
    sendMessage,
  } = useChat();

  const handleNewChatClick = (event) => {
    setNewChatAnchorEl(event.currentTarget);
  };

  const handleCloseNewChat = () => {
    setNewChatAnchorEl(null);
  };

  // Tạo hoặc chọn conversation mới thông qua hàm từ Provider
  const handleSelectNewChatUser = async (user) => {
    try {
      setMessageError(null);
      const newConversation = await startConversation(user.userId);
      if (newConversation) {
        setSelectedConversation(newConversation);
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setMessageError("Unable to start a new conversation right now.");
    }
  };

  // Tự động chọn cuộc hội thoại đầu tiên nếu chưa chọn gì
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Load tin nhắn khi đổi cuộc hội thoại
  useEffect(() => {
    if (selectedConversation?.id) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation, loadMessages]);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;
    const textToSend = message;
    setMessage("");

    try {
      await sendMessage(selectedConversation.id, textToSend);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessageError("Unable to send the message right now.");
    }
  };

  const currentMessages = selectedConversation
    ? messagesMap[selectedConversation.id] || []
    : [];

  return (
    <Scene sideMenu={<SideMenu />}>
      <Card
        sx={{
          width: "100%",
          height: "calc(100vh - 64px)",
          maxHeight: "100%",
          display: "flex",
          flexDirection: "row",
          mb: "-64px",
          overflow: "hidden",
        }}
      >
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          loading={loading}
          error={error}
          onRefresh={() => {}} // Provider đã tự load sẵn lúc khởi động
          newChatAnchorEl={newChatAnchorEl}
          onNewChatClick={handleNewChatClick}
          onCloseNewChat={handleCloseNewChat}
          onSelectNewChatUser={handleSelectNewChatUser}
        />

        <ChatWindow
          selectedConversation={selectedConversation}
          messages={currentMessages}
          message={message}
          setMessage={setMessage}
          onSendMessage={handleSendMessage}
          messageError={messageError}
        />
      </Card>
    </Scene>
  );
}