import React, { useEffect, useState, useCallback } from 'react';
import useChatSocket from '../api/useChatSocket';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import {
  getConversations,
  getMessages,
  createOrGetConversation,
  sendMessage,
  markMessagesRead
} from '../api/chatService';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load danh sách cuộc trò chuyện
  useEffect(() => {
    getConversations().then(res => setConversations(res.data));
  }, []);

  // Realtime: nhận tin nhắn mới qua socket
  useChatSocket((message) => {
    // Nếu đang xem đúng cuộc trò chuyện thì thêm vào messages
    if (selectedConversation && message.conversationId === selectedConversation.conversationId) {
      setMessages(prev => [...prev, message]);
    }
    // Cập nhật lại lastMessageAt cho danh sách cuộc trò chuyện
    setConversations(prev => prev.map(c =>
      c.conversationId === message.conversationId
        ? { ...c, lastMessageAt: message.sentAt }
        : c
    ));
  });

  // Khi chọn 1 cuộc trò chuyện, load tin nhắn
  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
    setLoadingMessages(true);
    getMessages(conversation.conversationId)
      .then(res => {
        setMessages(res.data);
        markMessagesRead(conversation.conversationId);
      })
      .finally(() => setLoadingMessages(false));
  }, []);

  // Gửi tin nhắn mới
  const handleSendMessage = async (content, messageType = 'text') => {
    if (!selectedConversation) return;
    const res = await sendMessage(selectedConversation.conversationId, content, messageType);
    setMessages(prev => [...prev, res.data]);
  };

  // Tạo cuộc trò chuyện mới (nếu cần)
  const handleStartConversation = async (participant1Id, participant2Id) => {
    const res = await createOrGetConversation(participant1Id, participant2Id);
    setConversations(prev => {
      // Nếu đã có thì không thêm
      if (prev.some(c => c.conversationId === res.data.conversationId)) return prev;
      return [res.data, ...prev];
    });
    setSelectedConversation(res.data);
    handleSelectConversation(res.data);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <ChatList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        onStartConversation={handleStartConversation}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          loading={loadingMessages}
        />
        <MessageInput
          onSend={handleSendMessage}
          disabled={!selectedConversation}
        />
      </div>
    </div>
  );
};

export default ChatPage;
