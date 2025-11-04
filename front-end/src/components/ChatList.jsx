import React from 'react';

const ChatList = ({ conversations, selectedConversation, onSelectConversation, onStartConversation }) => {
  // Giả sử userId hiện tại lấy từ localStorage
  const currentUserId = Number(localStorage.getItem('userId'));
  return (
    <div style={{ width: 300, borderRight: '1px solid #eee', overflowY: 'auto' }}>
      <div style={{ padding: 16, borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Danh sách trò chuyện</div>
      {conversations.map(conv => {
        const otherId = conv.participant1Id === currentUserId ? conv.participant2Id : conv.participant1Id;
        return (
          <div
            key={conv.conversationId}
            style={{
              padding: 12,
              background: selectedConversation && selectedConversation.conversationId === conv.conversationId ? '#f0f0f0' : 'white',
              cursor: 'pointer',
              borderBottom: '1px solid #eee'
            }}
            onClick={() => onSelectConversation(conv)}
          >
            <div>Đối thoại với User {otherId}</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {conv.lastMessageAt ? `Cập nhật: ${new Date(conv.lastMessageAt).toLocaleString()}` : ''}
            </div>
          </div>
        );
      })}
      {/* Demo nút tạo mới */}
      <div style={{ padding: 16 }}>
        <button onClick={() => {
          const otherId = prompt('Nhập userId muốn chat:');
          if (otherId) onStartConversation(currentUserId, Number(otherId));
        }}>Tạo cuộc trò chuyện mới</button>
      </div>
    </div>
  );
};

export default ChatList;
