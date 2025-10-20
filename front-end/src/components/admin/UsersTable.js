import React, { useEffect, useState } from 'react';

function UsersTable({ onRefresh }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  async function fetchUsers() {
    try {
      const token = localStorage.getItem('token');
      const q = `?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
      const res = await fetch(`/api/auth/users${q}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setTotal(data.total || 0);
      } else {
        alert(data.error || 'Lỗi tải danh sách người dùng');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối');
    }
  }

  async function doDelete(userId) {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/auth/users/${userId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      onRefresh && onRefresh();
      fetchUsers();
    } else alert(data.error || 'Lỗi');
  }

  async function toggleActive(userId, isActive) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/auth/users/${userId}/active`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ isActive }) });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      fetchUsers();
    } else alert(data.error || 'Lỗi');
  }

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <input placeholder="Tìm kiếm" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Full name</th>
            <th>Role</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.fullName}</td>
              <td>{u.roleName}</td>
              <td>{u.isActive ? 'Yes' : 'No'}</td>
              <td>
                <button onClick={() => toggleActive(u.userId, !u.isActive)}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => doDelete(u.userId)} style={{ marginLeft: 8 }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span style={{ margin: '0 8px' }}>{page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}

export default UsersTable;
