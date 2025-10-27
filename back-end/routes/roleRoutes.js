const express = require('express');
const router = express.Router();
const {
  listRolesController,
  getRoleController,
  createRoleController,
  updateRoleController,
  deleteRoleController
} = require('../controllers/roleController');

// GET /api/roles
router.get('/', listRolesController);
// GET /api/roles/:id
router.get('/:id', getRoleController);
// POST /api/roles
router.post('/', createRoleController);
// PUT /api/roles/:id
router.put('/:id', updateRoleController);
// DELETE /api/roles/:id
router.delete('/:id', deleteRoleController);

module.exports = router;
