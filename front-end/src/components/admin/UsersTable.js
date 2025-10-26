import React, { useEffect, useState } from 'react';
import Table from '../common/Table';
import Button from '../common/Button';
import Pagination from '../common/Pagination';
import SearchBar from '../common/SearchBar';
import EditModal from './EditModal';

function UsersTable({ onRefresh }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleId]);

  async function fetchRoles() {
    try {
      const res = await fetch('http://localhost:5000/api/roles');
      const data = await res.json();
      setRoles(data || []);
    } catch (err) {
      setRoles([]);
    }
  }

  async function fetchUsers() {
    try {
      const token = localStorage.getItem('token');
      let q = `?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
      if (roleId) q += `&roleId=${roleId}`;
      const res = await fetch(`http://localhost:5000/api/auth/users${q}`, {
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
    const res = await fetch(`http://localhost:5000/api/auth/users/${userId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      onRefresh && onRefresh();
      fetchUsers();
    } else alert(data.error || 'Lỗi');
  }

  async function toggleActive(userId, isActive) {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/auth/users/${userId}/active`, { 
      method: 'PATCH', 
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      }, 
      body: JSON.stringify({ isActive }) 
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      fetchUsers();
    } else alert(data.error || 'Lỗi');
  }

  async function handleEdit(userId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = await res.json();
    if (res.ok) {
      setEditingUser(user);
    } else {
      alert(user.error || 'Lỗi tải thông tin người dùng');
    }
  }

  async function handleSaveEdit(formData) {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/auth/users/${editingUser.userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message || 'Cập nhật thành công');
      setEditingUser(null);
      fetchUsers();
    } else {
      alert(data.error || 'Lỗi cập nhật');
    }
  }

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex align-items-center mb-3 gap-2">
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm người dùng..." />
        <select className="form-select" style={{ maxWidth: 200 }} value={roleId} onChange={e => { setRoleId(e.target.value); setPage(1); }}>
          <option value="">Tất cả vai trò</option>
          {roles.map(r => (
            <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
          ))}
        </select>
      </div>
      <Table
        columns={["ID", "Username", "Email", "Full name", "Role", "Active", "Actions"]}
        data={[]}
      >
        {users.map(u => (
          <tr key={u.userId}>
            <td>{u.userId}</td>
            <td>{u.username}</td>
            <td>{u.email}</td>
            <td>{u.fullName}</td>
            <td>{u.roleName}</td>
            <td>{u.isActive ? (
              <span className="badge bg-success">Yes</span>
            ) : (
              <span className="badge bg-secondary">No</span>
            )}</td>
            <td>
              <Button size="sm" variant="warning" onClick={() => handleEdit(u.userId)}>
                <i className="fa fa-edit me-1"></i>Edit
              </Button>
              <Button size="sm" variant={u.isActive ? "secondary" : "success"} onClick={() => toggleActive(u.userId, !u.isActive)} className="ms-2">
                {u.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              <Button size="sm" variant="danger" onClick={() => doDelete(u.userId)} className="ms-2">
                <i className="fa fa-trash me-1"></i>Delete
              </Button>
            </td>
          </tr>
        ))}
      </Table>
      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage(p => p - 1)}
        onNext={() => setPage(p => p + 1)}
      />
      {editingUser && (
        <EditModal
          user={editingUser}
          onSave={handleSaveEdit}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}

export default UsersTable;
