import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatSocket from '../api/useChatSocket';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesRead,
  transferConversation
} from '../services/chatService';
import { getReceptionists } from '../api/api';

const ChatPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});  // Theo dõi số tin nhắn chưa đọc cho mỗi cuộc trò chuyện
  const [user, setUser] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [receptionists, setReceptionists] = useState([]);
  const [selectedReceptionist, setSelectedReceptionist] = useState(null);
  const [messageOffset, setMessageOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);

  // Load user info
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);

  // Load danh sách cuộc trò chuyện
  useEffect(() => {
    if (user) {
      console.log('Loading conversations for user:', user);
      getConversations()
        .then(res => {
          console.log('Conversations loaded:', res.data);
          setConversations(res.data);
        })
        .catch(err => {
          console.error('Error loading conversations:', err);
        });
    }
  }, [user]);

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
    setMessageOffset(0);
    setHasMoreMessages(true);
    setLoadingMoreMessages(false);
    getMessages(conversation.conversationId, 50, 0)
      .then(res => {
        setMessages(res.data.reverse());
        if (res.data.length < 50) setHasMoreMessages(false);
        markMessagesRead(conversation.conversationId);
      })
      .finally(() => setLoadingMessages(false));
    // Reset số tin nhắn chưa đọc về 0
    setUnreadCounts(prev => ({ ...prev, [conversation.conversationId]: 0 }));
  }, []);

  // Load thêm tin nhắn cũ hơn
  const loadMoreMessages = useCallback(async () => {
    if (!selectedConversation || !hasMoreMessages || loadingMoreMessages) return;
    setLoadingMoreMessages(true);
    try {
      const res = await getMessages(selectedConversation.conversationId, 50, messageOffset + 50);
      if (res.data.length > 0) {
        setMessages(prev => [...res.data.reverse(), ...prev]);
        setMessageOffset(prev => prev + 50);
        if (res.data.length < 50) setHasMoreMessages(false);
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error('Error loading more messages:', err);
    } finally {
      setLoadingMoreMessages(false);
    }
  }, [selectedConversation, hasMoreMessages, loadingMoreMessages, messageOffset]);

  // Gửi tin nhắn mới
  const handleSendMessage = async (content, messageType = 'text') => {
    if (!selectedConversation) return;
    const res = await sendMessage(selectedConversation.conversationId, content, messageType);
    setMessages(prev => [...prev, res.data]);
  };

  // Chuyển cuộc trò chuyện sang lễ tân khác
  const handleTransferConversation = async () => {
    if (!selectedConversation) return;
    try {
      const res = await getReceptionists();
      setReceptionists(res.filter(rec => rec.userId !== user.userId));
      setShowTransferModal(true);
    } catch (err) {
      console.error('Lỗi tải danh sách lễ tân', err);
    }
  };

  const confirmTransfer = async () => {
    if (!selectedReceptionist) return;
    try {
      await transferConversation(selectedConversation.conversationId, selectedReceptionist.userId);
      alert('Cuộc trò chuyện đã được chuyển sang lễ tân khác.');
      setShowTransferModal(false);
      setSelectedReceptionist(null);
      // Reload conversations
      getConversations().then(res => setConversations(res.data));
    } catch (err) {
      console.error('Lỗi chuyển cuộc trò chuyện', err);
      alert('Lỗi chuyển cuộc trò chuyện. Vui lòng thử lại sau.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8f9fa' }}>
      <ChatList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        unreadCounts={unreadCounts}
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
              <div style={{ flex: 1 }}>
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
              {user && user.roleName === 'Receptionist' && (
                <button
                  onClick={handleTransferConversation}
                  style={{
                    background: '#ff6b6b',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Chuyển lễ tân
                </button>
              )}
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
          onLoadMore={loadMoreMessages}
          loadingMore={loadingMoreMessages}
        />
        <MessageInput
          onSend={handleSendMessage}
          disabled={!selectedConversation}
        />
      </div>

      {/* Modal chuyển lễ tân */}
      {showTransferModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3>Chọn lễ tân để chuyển cuộc trò chuyện</h3>
            <div style={{ marginBottom: '20px' }}>
              {receptionists.map(rec => (
                <div
                  key={rec.userId}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    background: selectedReceptionist?.userId === rec.userId ? '#e8f5f3' : '#fff'
                  }}
                  onClick={() => setSelectedReceptionist(rec)}
                >
                  <div style={{ fontWeight: 'bold' }}>{rec.fullName}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{rec.email} - {rec.phone}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setShowTransferModal(false)}
                style={{
                  background: '#ccc',
                  color: '#333',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={confirmTransfer}
                disabled={!selectedReceptionist}
                style={{
                  background: selectedReceptionist ? '#ff6b6b' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: selectedReceptionist ? 'pointer' : 'not-allowed'
                }}
              >
                Xác nhận chuyển
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
