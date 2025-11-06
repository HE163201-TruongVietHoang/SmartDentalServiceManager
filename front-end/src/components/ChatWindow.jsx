import React, { useRef, useEffect } from 'react';

const ChatWindow = ({ conversation, messages, loading }) => {
  const bottomRef = useRef();

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Chọn một cuộc trò chuyện</div>;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#fafbfc' }}>
      {loading ? <div>Đang tải tin nhắn...</div> : null}
      {messages.map(msg => (
        <div key={msg.messageId} style={{ marginBottom: 12, textAlign: msg.senderId === Number(localStorage.getItem('userId')) ? 'right' : 'left' }}>
          <div style={{ display: 'inline-block', background: msg.senderId === Number(localStorage.getItem('userId')) ? '#d1f7c4' : '#fff', padding: 8, borderRadius: 8, maxWidth: 300 }}>
            {msg.content}
          </div>
          <div style={{ fontSize: 10, color: '#aaa' }}>{new Date(msg.sentAt).toLocaleTimeString()}</div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
