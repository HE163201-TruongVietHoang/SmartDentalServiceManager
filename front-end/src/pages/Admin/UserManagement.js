import React, { useEffect, useState } from 'react';
import UsersTable from '../../components/admin/UsersTable';

function UserManagement() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý người dùng</h2>
      <UsersTable key={refresh} onRefresh={() => setRefresh(r => r + 1)} />
    </div>
  );
}

export default UserManagement;
