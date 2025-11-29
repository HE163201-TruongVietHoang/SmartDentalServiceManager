import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '../services/chatService';
import { getReceptionist } from '../api/api';

const ChatPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});  // Theo dõi số tin nhắn chưa đọc cho mỗi cuộc trò chuyện
  const [receptionistId, setReceptionistId] = useState(null);

  // Load danh sách cuộc trò chuyện
  useEffect(() => {
    getConversations().then(res => setConversations(res.data));
  }, []);

  // Load receptionist
  useEffect(() => {
    getReceptionist().then(res => setReceptionistId(res.userId)).catch(err => console.error('Không tìm thấy lễ tân', err));
  }, []);

  // Realtime: nhận tin nhắn mới qua socket
  useChatSocket((message) => {
    // Nếu đang xem đúng cuộc trò chuyện thì thêm vào messages và đánh dấu đã đọc
    if (selectedConversation && message.conversationId === selectedConversation.conversationId) {
      setMessages(prev => [...prev, message]);
      markMessagesRead(message.conversationId);  // Tự động đánh dấu đã đọc tin nhắn mới
    } else {
      // Tăng số tin nhắn chưa đọc cho cuộc trò chuyện khác
      setUnreadCounts(prev => ({ ...prev, [message.conversationId]: (prev[message.conversationId] || 0) + 1 }));
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
    // Reset số tin nhắn chưa đọc về 0
    setUnreadCounts(prev => ({ ...prev, [conversation.conversationId]: 0 }));
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
    <div style={{ display: 'flex', height: '100vh', background: '#f8f9fa' }}>
      <ChatList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        onStartConversation={handleStartConversation}
        unreadCounts={unreadCounts}
        defaultUserId={receptionistId}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0', background: '#ffffff', display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2ECCB6',
              fontSize: '18px',
              marginRight: '12px',
              cursor: 'pointer'
            }}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          {selectedConversation ? (
            <>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#2ECCB6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '18px',
                marginRight: '12px'
              }}>
                <i className="fas fa-user"></i>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#333' }}>
                  {(() => {
                    const currentUser = JSON.parse(localStorage.getItem('user'));
                    const otherId = selectedConversation.participant1Id === currentUser.userId ? selectedConversation.participant2Id : selectedConversation.participant1Id;
                    const otherName = selectedConversation.participant1Id === currentUser.userId ? selectedConversation.participant2Name : selectedConversation.participant1Name;
                    return otherName || `User ${otherId}`;
                  })()}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Đang hoạt động</div>
              </div>
            </>
          ) : (
            <>
              <i className="fas fa-comments" style={{ fontSize: '24px', color: '#2ECCB6', marginRight: '12px' }}></i>
              <div style={{ fontSize: '18px', color: '#666' }}>Chọn cuộc trò chuyện</div>
            </>
          )}
        </div>
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
