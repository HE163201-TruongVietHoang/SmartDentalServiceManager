// services/materialService.js
const { getPool, sql } = require("../config/db");

module.exports = {
  /**
   * 🟢 1. Lấy danh sách tất cả vật tư hiện có trong kho
   * Dành cho: Admin
   */
  async getAllMaterials() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT materialId, materialName, unit, stockQuantity
      FROM Materials
      ORDER BY materialId DESC
    `);
    return result.recordset;
  },

  /**
   * 🟢 2. Lấy danh sách lịch sử giao dịch vật tư
   * Dành cho: Admin
   */
  async getAllTransactions() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT mt.transactionId, m.materialName, u.fullName AS userName,
             mt.appointmentId, mt.transactionType, mt.quantity,
             mt.transactionDate, mt.note
      FROM MaterialTransactions mt
      JOIN Materials m ON mt.materialId = m.materialId
      JOIN Users u ON mt.userId = u.userId
      ORDER BY mt.transactionDate DESC
    `);
    return result.recordset;
  },

  /**
   * 🟢 3. Thêm giao dịch vật tư (USE / RETURN / IMPORT)
   * Dành cho: Nurse (USE, RETURN) hoặc Admin (IMPORT)
   */
  async addTransaction({
    materialId,
    userId,
    appointmentId = null,
    transactionType,
    quantity,
    note,
  }) {
    const pool = await getPool();
    await pool
      .request()
      .input("materialId", sql.Int, materialId)
      .input("userId", sql.Int, userId)
      .input("appointmentId", sql.Int, appointmentId)
      .input("transactionType", sql.NVarChar(20), transactionType)
      .input("quantity", sql.Decimal(18, 2), quantity)
      .input("note", sql.NVarChar(255), note).query(`
        INSERT INTO MaterialTransactions (materialId, userId, appointmentId, transactionType, quantity, note)
        VALUES (@materialId, @userId, @appointmentId, @transactionType, @quantity, @note)
      `);
    return { message: `Transaction added: ${transactionType}` };
  },

  /**
   * 🟢 4. Ghi nhận vật tư thực tế đã dùng cho ca khám
   * Dành cho: Nurse
   */
  async addUsedMaterial({ appointmentId, materialId, quantityUsed, note }) {
    const pool = await getPool();
    await pool
      .request()
      .input("appointmentId", sql.Int, appointmentId)
      .input("materialId", sql.Int, materialId)
      .input("quantityUsed", sql.Decimal(18, 2), quantityUsed)
      .input("note", sql.NVarChar(255), note).query(`
        INSERT INTO UsedMaterials (appointmentId, materialId, quantityUsed, note)
        VALUES (@appointmentId, @materialId, @quantityUsed, @note)
      `);
    return { message: "Đã ghi nhận vật tư sử dụng thực tế" };
  },

  /**
   * 🟢 5. Lấy danh sách ca khám trong ngày hiện tại
   * Dành cho: Nurse
   */
  async getTodayAppointments() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT a.appointmentId, a.date, a.time,
             p.fullName AS patientName, s.serviceName
      FROM Appointments a
      JOIN Patients p ON a.patientId = p.patientId
      JOIN Services s ON a.serviceId = s.serviceId
      WHERE CAST(a.date AS DATE) = CAST(GETDATE() AS DATE)
    `);
    return result.recordset;
  },

  /**
   * 🟢 6. Lấy danh sách vật tư định mức cho 1 dịch vụ
   * Dành cho: Nurse
   */
  async getMaterialsByService(serviceId) {
    const pool = await getPool();
    const result = await pool.request().input("serviceId", sql.Int, serviceId)
      .query(`
        SELECT sm.materialId, m.materialName, sm.standardQuantity, m.unit
        FROM ServiceMaterials sm
        JOIN Materials m ON sm.materialId = m.materialId
        WHERE sm.serviceId = @serviceId
      `);
    return result.recordset;
  },

  /**
   * 🟢 7. Tạo báo cáo sử dụng vật tư (chuẩn vs thực tế)
   * Dành cho: Admin
   */
  async getMaterialUsageReport() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        s.serviceName,
        m.materialName,
        sm.standardQuantity AS Standard,
        um.quantityUsed AS Actual,
        (um.quantityUsed - sm.standardQuantity) AS Difference
      FROM UsedMaterials um
      JOIN Appointments a ON um.appointmentId = a.appointmentId
      JOIN Services s ON a.serviceId = s.serviceId
      JOIN ServiceMaterials sm ON sm.serviceId = s.serviceId AND sm.materialId = um.materialId
      JOIN Materials m ON m.materialId = um.materialId
    `);
    return result.recordset;
  },
};
