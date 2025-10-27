import React, { useEffect, useState } from 'react';

function EditModal({ user, onSave, onClose }) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    phone: user.phone || '',
    gender: user.gender || '',
    dob: user.dob ? user.dob.split('T')[0] : '',
    address: user.address || '',
    roleId: user.roleId || 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        width: '80%',
        maxWidth: 500
      }}>
        <h2>Chỉnh sửa người dùng</h2>
        <form onSubmit={handleSubmit}>
          {/* Username removed (DB no longer has username) */}
          <div style={{ marginBottom: 10 }}>
            <label>Họ tên:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              style={{ width: '100%', padding: 5 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Số điện thoại:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{ width: '100%', padding: 5 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Giới tính:</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              style={{ width: '100%', padding: 5 }}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Ngày sinh:</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              style={{ width: '100%', padding: 5 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Địa chỉ:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={{ width: '100%', padding: 5 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Vai trò:</label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              style={{ width: '100%', padding: 5 }}
            >
              <option value={1}>Admin</option>
              <option value={2}>Doctor</option>
              <option value={3}>Patient</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose}>Hủy</button>
            <button type="submit">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UsersTable({ onRefresh }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  async function fetchUsers() {
    try {
      const token = localStorage.getItem('token');
      const q = `?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
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
    <div>
      <div style={{ marginBottom: 12 }}>
        <input placeholder="Tìm kiếm" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
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
              <td>{u.email}</td>
              <td>{u.fullName}</td>
              <td>{u.roleName}</td>
              <td>{u.isActive ? 'Yes' : 'No'}</td>
              <td>
                <button onClick={() => handleEdit(u.userId)}>Edit</button>
                <button 
                  onClick={() => toggleActive(u.userId, !u.isActive)} 
                  style={{ marginLeft: 8 }}
                >
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  onClick={() => doDelete(u.userId)} 
                  style={{ marginLeft: 8 }}
                >
                  Delete
                </button>
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
