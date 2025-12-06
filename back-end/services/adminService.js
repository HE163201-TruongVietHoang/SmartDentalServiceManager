// src/services/adminService.js
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../access/adminAccess");

async function fetchAllUsers() {
  return await getAllUsers();
}

async function fetchUserById(userId) {
  return await getUserById(userId);
}

async function addUser(data) {
  return await createUser(data);
}

async function editUser(userId, data) {
  return await updateUser({ userId, ...data });
}

async function removeUser(userId) {
  return await deleteUser(userId);
}

module.exports = {
  fetchAllUsers,
  fetchUserById,
  addUser,
  editUser,
  removeUser,
};
