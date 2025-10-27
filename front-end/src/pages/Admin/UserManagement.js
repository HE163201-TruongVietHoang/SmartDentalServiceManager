import React, { useState } from 'react';
import UsersTable from '../../components/admin/UsersTable';

function UserManagement() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#E6F4FF', // nền xanh da trời nhạt
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '50px 20px',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      <div
        style={{
          width: '90%',
          maxWidth: 1300, // mở rộng hơn
          backgroundColor: '#fff',
          borderRadius: 20,
          boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
          padding: '40px 50px',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            color: '#007BFF',
            marginBottom: 35,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          👥 Quản lý người dùng
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <UsersTable key={refresh} onRefresh={() => setRefresh(r => r + 1)} />
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
