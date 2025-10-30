import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

function EditModal({ user, onSave, onClose }) {
  const [formData, setFormData] = useState({
    username: user.username || '',
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
    <Modal show={true} title="Chỉnh sửa người dùng" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Họ tên:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Số điện thoại:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Giới tính:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="form-select"
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Ngày sinh:</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Địa chỉ:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Vai trò:</label>
          <select
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            className="form-select"
          >
            <option value={1}>Admin</option>
            <option value={2}>Doctor</option>
            <option value={3}>Patient</option>
          </select>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="primary">Lưu</Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditModal;
