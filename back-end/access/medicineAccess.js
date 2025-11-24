// back-end/access/medicineAccess.js
const { sql, getPool } = require("../config/db");

module.exports = {
  // Lấy toàn bộ thuốc
  getAllMedicines: async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        medicineId,
        medicineName,
        unit,
        description
      FROM Medicines
      ORDER BY medicineId DESC
    `);

    return result.recordset;
  },

  // Thêm thuốc mới
  // category = NULL, price = 0, stockQuantity = 0
  addMedicine: async (medicineName, unit, description) => {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("medicineName", sql.NVarChar, medicineName)
      .input("unit", sql.NVarChar, unit || "")
      .input("description", sql.NVarChar, description || null).query(`
        INSERT INTO Medicines (medicineName, category, unit, price, stockQuantity, description)
        OUTPUT INSERTED.medicineId, INSERTED.medicineName, INSERTED.unit, INSERTED.description
        VALUES (@medicineName, NULL, @unit, 0, 0, @description);
      `);

    return result.recordset[0];
  },

  // Xoá thuốc (chỉ khi chưa dùng trong PrescriptionItems)
  deleteMedicine: async (medicineId) => {
    const pool = await getPool();

    // Kiểm tra có bị dùng trong PrescriptionItems không
    const used = await pool.request().input("id", sql.Int, medicineId).query(`
        SELECT TOP 1 itemId
        FROM PrescriptionItems
        WHERE medicineId = @id
    `);

    if (used.recordset.length > 0) {
      const err = new Error(
        "Thuốc này đã được sử dụng trong đơn thuốc, không thể xoá."
      );
      err.code = "IN_USE";
      throw err;
    }

    // Xoá thuốc nếu không bị dùng
    await pool.request().input("id", sql.Int, medicineId).query(`
        DELETE FROM Medicines
        WHERE medicineId = @id
    `);

    return true;
  },
};
