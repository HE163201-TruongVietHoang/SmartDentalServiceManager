const { getAllRoles, getRoleById, createRole, updateRole, deleteRole } = require('../services/roleService');

async function listRolesController(req, res) {
  try {
    const roles = await getAllRoles();
    res.json(roles);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getRoleController(req, res) {
  try {
    const role = await getRoleById(parseInt(req.params.id));
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function createRoleController(req, res) {
  try {
    const role = await createRole(req.body);
    res.status(201).json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateRoleController(req, res) {
  try {
    const role = await updateRole(parseInt(req.params.id), req.body);
    res.json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteRoleController(req, res) {
  try {
    await deleteRole(parseInt(req.params.id));
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  listRolesController,
  getRoleController,
  createRoleController,
  updateRoleController,
  deleteRoleController
};
