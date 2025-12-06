// src/controllers/adminController.js
const {
  fetchAllUsers,
  fetchUserById,
  addUser,
  editUser,
  removeUser,
} = require("../services/adminService");

// GET /admin/users
async function getAllUsersController(req, res) {
  try {
    const users = await fetchAllUsers();
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

// GET /admin/users/:id
async function getUserController(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = await fetchUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

// POST /admin/users
async function createUserController(req, res) {
  try {
    const user = await addUser(req.body);
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

// PUT /admin/users/:id
async function updateUserController(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    await editUser(userId, req.body);
    res.status(200).json({ success: true, message: "User updated" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

// DELETE /admin/users/:id
async function deleteUserController(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    await removeUser(userId);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

module.exports = {
  getAllUsersController,
  getUserController,
  createUserController,
  updateUserController,
  deleteUserController,
};
