const { getPool } = require('../config/db');
const sql = require('mssql');

async function getAllRoles() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM Roles');
  return result.recordset;
}

async function getRoleById(roleId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('roleId', sql.Int, roleId)
    .query('SELECT * FROM Roles WHERE roleId = @roleId');
  return result.recordset[0];
}

async function createRole({ roleName }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('roleName', sql.NVarChar, roleName)
    .query('INSERT INTO Roles (roleName) OUTPUT INSERTED.* VALUES (@roleName)');
  return result.recordset[0];
}

async function updateRole(roleId, { roleName }) {
  const pool = await getPool();
  await pool.request()
    .input('roleId', sql.Int, roleId)
    .input('roleName', sql.NVarChar, roleName)
    .query('UPDATE Roles SET roleName = @roleName WHERE roleId = @roleId');
  return getRoleById(roleId);
}

async function deleteRole(roleId) {
  const pool = await getPool();
  await pool.request()
    .input('roleId', sql.Int, roleId)
    .query('DELETE FROM Roles WHERE roleId = @roleId');
}

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};
