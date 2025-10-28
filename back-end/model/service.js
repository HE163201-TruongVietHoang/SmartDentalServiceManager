const { getPool } = require("../config/db");
const sql = require("mssql");

// Lấy tất cả dịch vụ
async function getAllServices() {
  const pool = await getPool();
  const result = await pool.request().query("SELECT * FROM [Service]");
  return result.recordset;
}

// Lấy dịch vụ theo ID
async function getServiceById(id) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("ServiceID", sql.Int, id)
    .query("SELECT * FROM [Service] WHERE ServiceID = @ServiceID");
  return result.recordset[0];
}

// Thêm mới dịch vụ
async function createService({ ServiceName, Description, Price, Treatment }) {
  const pool = await getPool();
  await pool
    .request()
    .input("ServiceName", sql.NVarChar, ServiceName)
    .input("Description", sql.NVarChar, Description)
    .input("Price", sql.Decimal(18, 2), Price)
    .input("Treatment", sql.NVarChar, Treatment).query(`
      INSERT INTO [Service] (ServiceName, Description, Price, Treatment)
      VALUES (@ServiceName, @Description, @Price, @Treatment)
    `);
}

// Cập nhật dịch vụ
async function updateService(
  id,
  { ServiceName, Description, Price, Treatment }
) {
  const pool = await getPool();
  await pool
    .request()
    .input("ServiceID", sql.Int, id)
    .input("ServiceName", sql.NVarChar, ServiceName)
    .input("Description", sql.NVarChar, Description)
    .input("Price", sql.Decimal(18, 2), Price)
    .input("Treatment", sql.NVarChar, Treatment).query(`
      UPDATE [Service]
      SET ServiceName = @ServiceName,
          Description = @Description,
          Price = @Price,
          Treatment = @Treatment
      WHERE ServiceID = @ServiceID
    `);
}

// Xóa dịch vụ
async function deleteService(id) {
  const pool = await getPool();
  await pool
    .request()
    .input("ServiceID", sql.Int, id)
    .query("DELETE FROM [Service] WHERE ServiceID = @ServiceID");
}

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
