import React, { useEffect, useState, useCallback } from 'react';
import useChatSocket from '../api/useChatSocket';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import {
  getConversations,
  getMessages,
  createOrGetConversation,
  sendMessage,
  markMessagesRead
} from '../services/chatService';
import { getReceptionist } from '../api/api';

const ChatPopup = ({ isOpen, onClose }) => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [receptionistId, setReceptionistId] = useState(null);

  // Load receptionist và tạo conversation
  useEffect(() => {
    if (isOpen) {
      getReceptionist().then(res => {
        setReceptionistId(res.userId);
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
          createOrGetConversation(currentUser.userId, res.userId).then(convRes => {
            setSelectedConversation(convRes.data);
            getMessages(convRes.data.conversationId).then(msgRes => {
              setMessages(msgRes.data);
              markMessagesRead(convRes.data.conversationId);
            });
          });
        }
      }).catch(err => console.error('Không tìm thấy lễ tân', err));
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