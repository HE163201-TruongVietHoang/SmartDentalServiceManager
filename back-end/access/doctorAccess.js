const { getPool, sql } = require("../config/db");

const doctorAccess = {
  async getAll() {
    try {
      const pool = await getPool(); // kết nối SQL Server
      const result = await pool.request()
        .query(`
          SELECT u.userId, u.fullName, u.email, u.phone, u.gender, u.dob, u.address
          FROM Users u
          JOIN Roles r ON u.roleId = r.roleId
          WHERE r.roleName = 'Doctor' AND u.isActive = '1'
        `);
      return result.recordset;
    } catch (err) {
      console.error("Error in doctorAccess.getAllDoctors:", err);
      throw err;
    }
  },
};

module.exports = doctorAccess;