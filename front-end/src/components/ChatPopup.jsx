import React, { useEffect, useState, useCallback } from 'react';
import useChatSocket from '../api/useChatSocket';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import {
  getConversations,
  getMessages,
  createOrGetConversation,
  sendMessage,
  markMessagesRead,
  checkConversation
} from '../services/chatService';
import { getReceptionist } from '../api/api';

const ChatPopup = ({ isOpen, onClose }) => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageOffset, setMessageOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);

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

  // Load conversation cho bệnh nhân
  useEffect(() => {
    if (isOpen) {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser) {
        checkConversation(currentUser.userId).then(res => {
          if (res.data.length > 0) {
            const conv = res.data[0];
            setSelectedConversation(conv);
            setMessageOffset(0);
            setHasMoreMessages(true);
            setLoadingMoreMessages(false);
            getMessages(conv.conversationId, 50, 0).then(msgRes => {
              setMessages(msgRes.data.reverse());
              if (msgRes.data.length < 50) setHasMoreMessages(false);
              markMessagesRead(conv.conversationId);
            });
          }
        }).catch(err => console.error('Lỗi tải conversation', err));
      }
    }
  }, [isOpen]);

  // Realtime: nhận tin nhắn mới qua socket
  useChatSocket((message) => {
    if (selectedConversation && message.conversationId === selectedConversation.conversationId) {
      setMessages(prev => [...prev, message]);
      markMessagesRead(message.conversationId);
    }
  });

  const handleSendMessage = async (content, messageType = 'text') => {
    if (!selectedConversation) return;
    const res = await sendMessage(selectedConversation.conversationId, content, messageType);
    setMessages(prev => [...prev, res.data]);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      width: '350px',
      height: '500px',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e0e0e0',
        background: '#2ECCB6',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ fontWeight: 'bold' }}>Chat với Lễ tân</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
    </div>
  );
};

export default ChatPopup;