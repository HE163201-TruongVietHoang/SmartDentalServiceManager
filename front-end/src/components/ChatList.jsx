import React from 'react';

const ChatList = ({ conversations, selectedConversation, onSelectConversation, onStartConversation }) => {
  // Lấy userId từ localStorage user object
  let currentUserId = 0;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    currentUserId = user?.userId || 0;
  } catch {
    currentUserId = 0;
  }
  return (
    <div style={{ width: '350px', borderRight: '1px solid #e0e0e0', overflowY: 'auto', background: '#ffffff' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold', fontSize: '18px', color: '#333', background: '#f0f0f0' }}>
        <i className="fas fa-comments" style={{ marginRight: '8px', color: '#2ECCB6' }}></i>
        Trò chuyện
      </div>
      {conversations.map(conv => {
        const otherId = conv.participant1Id === currentUserId ? conv.participant2Id : conv.participant1Id;
        const isSelected = selectedConversation && selectedConversation.conversationId === conv.conversationId;
        return (
          <div
            key={conv.conversationId}
            style={{
              padding: '12px 16px',
              background: isSelected ? '#e8f5f3' : '#ffffff',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={() => onSelectConversation(conv)}
            onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.target.style.background = isSelected ? '#e8f5f3' : '#ffffff'}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#2ECCB6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '20px',
              marginRight: '12px'
            }}>
              <i className="fas fa-user"></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#333', fontSize: '16px' }}>
                User {otherId}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>
                {conv.lastMessageAt ? `Tin nhắn cuối: ${new Date(conv.lastMessageAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Chưa có tin nhắn'}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#999', textAlign: 'right' }}>
              {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString('vi-VN') : ''}
            </div>
          </div>
        );
      })}
      <div style={{ padding: '16px', borderTop: '1px solid #e0e0e0' }}>
        <button
          className="btn w-100"
          style={{ background: '#2ECCB6', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px' }}
          onClick={() => {
            const otherId = prompt('Nhập userId muốn chat:');
            if (otherId) onStartConversation(currentUserId, Number(otherId));
          }}
        >
          <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
          Bắt đầu trò chuyện mới
        </button>
      </div>
    </div>
  );
};

export default ChatList;
