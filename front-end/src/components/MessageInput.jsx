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
    <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid #e0e0e0', padding: '12px 16px', background: '#ffffff', alignItems: 'center' }}>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Nhập tin nhắn..."
        className="form-control"
        style={{ flex: 1, borderRadius: '25px', padding: '10px 20px', border: '1px solid #ddd', marginRight: '12px', fontSize: '16px' }}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        style={{
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          background: '#2ECCB6',
          color: '#fff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
          opacity: disabled || !value.trim() ? 0.5 : 1
        }}
      >
        <i className="fas fa-paper-plane"></i>
      </button>
    </form>
  );
};

export default MessageInput;
