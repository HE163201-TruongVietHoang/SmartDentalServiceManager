import React, { useState } from 'react';

const MessageInput = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value);
    setValue('');
  };

  return (
    <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8, background: '#fff' }}>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Nhập tin nhắn..."
        style={{ flex: 1, padding: 8, border: 'none', outline: 'none', fontSize: 16 }}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !value.trim()} style={{ marginLeft: 8 }}>
        Gửi
      </button>
    </form>
  );
};

export default MessageInput;
