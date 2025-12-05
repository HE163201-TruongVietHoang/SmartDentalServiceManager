// services/materialService.js
// Service layer cho module quản lý vật tư
// - Tất cả truy vấn SQL tương ứng trực tiếp với schema trong script.sql bạn đã upload
// - Mỗi hàm có comment giải thích mục đích, input, output

const { getPool, sql } = require("../config/db");

module.exports = {
  async addNewMaterial({ materialName, unit, unitPrice }) {
    const pool = await getPool();
    await pool
      .request()
      .input("materialName", sql.NVarChar(100), materialName)
      .input("unit", sql.NVarChar(50), unit)
      .input("unitPrice", sql.Decimal(18, 2), unitPrice).query(`
      INSERT INTO Materials (materialName, unit, unitPrice, stockQuantity, createdAt, updatedAt)
      VALUES (@materialName, @unit, @unitPrice, 0, GETDATE(), GETDATE())
    `);
    return { message: "Thêm vật tư mới thành công!" };
  },

  /**
   * getAllMaterials
   * Dành cho: Admin
   * Mô tả: Lấy danh sách tất cả vật tư hiện có cùng thông tin tồn kho
   * Trả về: array of materials (materialId, materialName, unit, unitPrice, stockQuantity, createdAt, updatedAt)
   */
  async getAllMaterials() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT materialId, materialName, unit, unitPrice, stockQuantity, createdAt, updatedAt
      FROM Materials
      ORDER BY materialId DESC
    `);
    return result.recordset;
  },

  /**
   * getAllTransactions
   * Dành cho: Admin
   * Mô tả: Lấy toàn bộ lịch sử giao dịch vật tư (nhập, xuất, trả, hỏng)
   * Join Users để biết ai thao tác; left join Appointments để xem ca liên quan; left join patient name
   */
  async getAllTransactions() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        mt.transactionId,
        mt.transactionType,
        mt.quantity,
        mt.transactionDate,
        mt.note,
        mt.appointmentId,
        m.materialId,
        m.materialName,
        u.userId AS operatorId,
        u.fullName AS operatorName,
        a.patientId,
        patient.fullName AS patientName,
        doc.userId AS doctorId,
        doc.fullName AS doctorName
      FROM MaterialTransactions mt
      JOIN Materials m ON mt.materialId = m.materialId
      JOIN Users u ON mt.userId = u.userId
      LEFT JOIN Appointments a ON mt.appointmentId = a.appointmentId
      LEFT JOIN Users patient ON a.patientId = patient.userId
      LEFT JOIN Users doc ON a.doctorId = doc.userId
      ORDER BY mt.transactionDate DESC
    `);
    return result.recordset;
  },

  /**
   * addTransaction
   * Dành cho: Nurse (USE/RETURN) hoặc Admin (IMPORT/DAMAGED)
   * Mô tả: Thêm 1 dòng vào MaterialTransactions
   * Input:
   *  - materialId (int)
   *  - userId (int)
   *  - appointmentId (int | null)
   *  - transactionType (string): 'USE'|'RETURN'|'IMPORT'|'DAMAGED'
   *  - quantity (decimal)
   *  - note (string)
   * Trả về: object message + inserted transaction id (nếu cần)
   *
   * LƯU Ý:
   *  - Trigger (nếu bạn tạo trong DB) sẽ update Materials.stockQuantity tự động.
   *  - Nếu bạn chưa có trigger, bạn cần tự cập nhật stockQuantity (mình có thể cung cấp đoạn SQL/logic nếu cần).
   */
  async addTransaction({
    materialId,
    userId,
    appointmentId = null,
    transactionType,
    quantity,
    note = null,
  }) {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const request = new sql.Request(transaction);
      request.input("materialId", sql.Int, materialId);

      // 🔍 1. Lấy số lượng tồn kho hiện tại
      const stockResult = await request.query(`
      SELECT stockQuantity FROM Materials WHERE materialId = @materialId
    `);

      if (stockResult.recordset.length === 0) {
        throw new Error("Không tìm thấy vật tư với materialId đã cung cấp.");
      }

      const currentStock = parseFloat(stockResult.recordset[0].stockQuantity);
      const qty = parseFloat(quantity);

      // 🔍 2. Kiểm tra loại giao dịch + xác thực tồn kho
      if (transactionType === "USE" || transactionType === "DAMAGED") {
        if (currentStock < qty) {
          throw new Error(
            `Không đủ tồn kho. Hiện còn ${currentStock}, cần ${qty}.`
          );
        }
      }

      // 🔹 3. Chèn vào bảng MaterialTransactions
      const insertReq = new sql.Request(transaction);
      insertReq
        .input("materialId", sql.Int, materialId)
        .input("userId", sql.Int, userId)
        .input("appointmentId", sql.Int, appointmentId)
        .input("transactionType", sql.NVarChar(20), transactionType)
        .input("quantity", sql.Decimal(18, 2), qty)
        .input("note", sql.NVarChar(255), note);

      await insertReq.query(`
      INSERT INTO MaterialTransactions
      (materialId, userId, appointmentId, transactionType, quantity, transactionDate, note)
      VALUES (@materialId, @userId, @appointmentId, @transactionType, @quantity, GETDATE(), @note)
    `);

      // 🔹 4. Cập nhật tồn kho trong Materials
      let newStock = currentStock;
      if (transactionType === "IMPORT" || transactionType === "RETURN") {
        newStock += qty;
      } else if (transactionType === "USE" || transactionType === "DAMAGED") {
        newStock -= qty;
      }

      const updateReq = new sql.Request(transaction);
      updateReq.input("materialId", sql.Int, materialId);
      updateReq.input("newStock", sql.Decimal(18, 2), newStock);
      await updateReq.query(`
      UPDATE Materials SET stockQuantity = @newStock, updatedAt = GETDATE()
      WHERE materialId = @materialId
    `);

      await transaction.commit();

      return {
        message: `Transaction ${transactionType} thành công.`,
        updatedStock: newStock,
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  /**
   * addUsedMaterial
   * Dành cho: Nurse khi ghi nhận vật tư thực tế đã dùng cho 1 diagnosisService (có thể từ appointment)
   * Input:
   *  - diagnosisServiceId (int) OR appointmentId (int) -> service will be found via Diagnoses + DiagnosisServices
   *  - materialId (int)
   *  - quantityUsed (decimal)
   *  - note (string)
   *
   * Hành động:
   *  - Nếu client gửi appointmentId thay vì diagnosisServiceId: tìm latest diagnosis cho appointment rồi lấy diagnosisServiceId
   *  - Insert vào UsedMaterials (diagnosisServiceId, materialId, usedQuantity, note, createdAt)
   */
  async addUsedMaterial({
    diagnosisServiceId = null,
    appointmentId = null,
    materialId,
    quantityUsed,
    note = null,
  }) {
    const pool = await getPool();

    // Nếu chưa có diagnosisServiceId nhưng có appointmentId -> tìm diagnosisId -> diagnosisServiceId (lấy bản ghi đầu/take TOP 1)
    if (!diagnosisServiceId && appointmentId) {
      // Tìm diagnosisId
      const diagRes = await pool
        .request()
        .input("appointmentId", sql.Int, appointmentId).query(`
          SELECT TOP 1 diagnosisId
          FROM Diagnoses
          WHERE appointmentId = @appointmentId
          ORDER BY createdAt DESC
        `);
      if (!diagRes.recordset || diagRes.recordset.length === 0) {
        throw new Error("Không tìm thấy diagnosis cho appointmentId này.");
      }
      const diagnosisId = diagRes.recordset[0].diagnosisId;

      // Tìm diagnosisServiceId
      const dsRes = await pool
        .request()
        .input("diagnosisId", sql.Int, diagnosisId).query(`
          SELECT TOP 1 diagnosisServiceId
          FROM DiagnosisServices
          WHERE diagnosisId = @diagnosisId
          ORDER BY createdAt DESC
        `);
      if (!dsRes.recordset || dsRes.recordset.length === 0) {
        throw new Error(
          "Không tìm thấy DiagnosisService tương ứng cho appointment này."
        );
      }
      diagnosisServiceId = dsRes.recordset[0].diagnosisServiceId;
    }

    if (!diagnosisServiceId) {
      throw new Error(
        "Cần cung cấp diagnosisServiceId hoặc appointmentId có diagnosis tương ứng."
      );
    }

    // Insert vào UsedMaterials
    await pool
      .request()
      .input("diagnosisServiceId", sql.Int, diagnosisServiceId)
      .input("materialId", sql.Int, materialId)
      .input("usedQuantity", sql.Decimal(18, 2), quantityUsed)
      .input("note", sql.NVarChar(255), note).query(`
        INSERT INTO UsedMaterials (diagnosisServiceId, materialId, usedQuantity, note, createdAt)
        VALUES (@diagnosisServiceId, @materialId, @usedQuantity, @note, GETDATE())
      `);

    return { message: "Đã ghi nhận vật tư sử dụng thực tế" };
  },

  /**
   * getTodayAppointments
   * Dành cho: Nurse
   * Mô tả: Lấy danh sách appointment cho ngày làm việc hiện tại.
   * Lưu ý: Appointments -> Slots -> Schedules có workDate; do đó chúng ta join để lọc workDate = GETDATE()
   * Trả về: thông tin appointment + patient + doctor + slot time + service (nếu đã có diagnosis/diagnosisService)
   */
  async getTodayAppointments() {
    const pool = await getPool();
    const result = await pool.request().query(`
    SELECT
    a.appointmentId,
    uPatient.userId AS patientId,
    uPatient.fullName AS patientName,
    uDoc.userId AS doctorId,
    uDoc.fullName AS doctorName,
    sch.workDate,
    CONVERT(VARCHAR(5), sl.startTime, 108) AS startTime,
    CONVERT(VARCHAR(5), sl.endTime, 108) AS endTime,

    -- GỘP TẤT CẢ DỊCH VỤ THÀNH 1 CHUỖI
    STRING_AGG(srv.serviceName, ', ') WITHIN GROUP (ORDER BY srv.serviceName) 
        AS serviceNames,

    -- Lấy 1 serviceId đầu tiên (nếu nurse cần để load vật tư)
    MIN(ds.serviceId) AS serviceId,

    a.status
FROM Appointments a
LEFT JOIN Users uPatient ON a.patientId = uPatient.userId
LEFT JOIN Users uDoc ON a.doctorId = uDoc.userId
LEFT JOIN Slots sl ON a.slotId = sl.slotId
LEFT JOIN Schedules sch ON sl.scheduleId = sch.scheduleId
LEFT JOIN Diagnoses d ON d.appointmentId = a.appointmentId
LEFT JOIN DiagnosisServices ds ON ds.diagnosisId = d.diagnosisId
LEFT JOIN Services srv ON srv.serviceId = ds.serviceId
WHERE 
    sch.workDate = CAST(GETDATE() AS DATE)
    AND a.status IN ('InProgress', 'DiagnosisCompleted')
GROUP BY 
    a.appointmentId,
    uPatient.userId,
    uPatient.fullName,
    uDoc.userId,
    uDoc.fullName,
    sch.workDate,
    sl.startTime,
    sl.endTime,
    a.status
ORDER BY sl.startTime;
  `);

    return result.recordset;
  },

  /**
   * getMaterialsByService
   * Dành cho: Nurse
   * Mô tả: Lấy danh sách vật tư định mức (ServiceMaterials) cho 1 serviceId
   * Trả về: materialId, materialName, unit, standardQuantity
   */
  async getMaterialsByService(serviceId) {
    const pool = await getPool();
    const result = await pool.request().input("serviceId", sql.Int, serviceId)
      .query(`
        SELECT
          sm.id,
          sm.serviceId,
          sm.materialId,
          m.materialName,
          m.unit,
          sm.standardQuantity
        FROM ServiceMaterials sm
        JOIN Materials m ON sm.materialId = m.materialId
        WHERE sm.serviceId = @serviceId
      `);
    return result.recordset;
  },

  /**
   * getMaterialsByAppointment
   * Lấy vật tư của TẤT CẢ dịch vụ trong 1 appointment
   * Trả về: vật tư gộp (không trùng), standardQuantity được cộng dồn
   */
  async getMaterialsByAppointment(appointmentId) {
    const pool = await getPool();

    // 1. Lấy diagnosisId từ appointment
    const diagRes = await pool
      .request()
      .input("appointmentId", sql.Int, appointmentId).query(`
      SELECT diagnosisId 
      FROM Diagnoses 
      WHERE appointmentId = @appointmentId
    `);

    if (!diagRes.recordset.length) return []; // chưa có diagnosis → chưa có vật tư

    const diagnosisId = diagRes.recordset[0].diagnosisId;

    // 2. Lấy danh sách serviceId của appointment này
    const dsRes = await pool
      .request()
      .input("diagnosisId", sql.Int, diagnosisId).query(`
      SELECT serviceId
      FROM DiagnosisServices
      WHERE diagnosisId = @diagnosisId
    `);

    if (!dsRes.recordset.length) return [];

    const serviceIds = dsRes.recordset.map((s) => s.serviceId);

    // 3. Lấy vật tư của tất cả service trong 1 query
    const smRes = await pool.request().query(`
      SELECT 
        sm.serviceId,
        sm.materialId,
        m.materialName,
        m.unit,
        sm.standardQuantity
      FROM ServiceMaterials sm
      JOIN Materials m ON sm.materialId = m.materialId
      WHERE sm.serviceId IN (${serviceIds.join(",")})
      ORDER BY sm.materialId
    `);

    const rows = smRes.recordset;

    // 4. Gộp vật tư trùng (nếu nhiều dịch vụ dùng chung)
    const map = {};

    rows.forEach((r) => {
      if (!map[r.materialId]) {
        map[r.materialId] = {
          materialId: r.materialId,
          materialName: r.materialName,
          unit: r.unit,
          standardQuantity: r.standardQuantity,
          serviceIds: [r.serviceId],
        };
      } else {
        map[r.materialId].standardQuantity += r.standardQuantity;
        map[r.materialId].serviceIds.push(r.serviceId);
      }
    });

    return Object.values(map);
  },
  /**
   * getMaterialUsageReport
   * Dành cho: Admin
   * Mô tả: Báo cáo so sánh "chuẩn (ServiceMaterials)" vs "thực tế (UsedMaterials)"
   * Trả về các cột: serviceName, materialName, Standard, Actual (usedQuantity), Difference
   */
  async getMaterialUsageReport() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        srv.serviceName,
        m.materialName,
        sm.standardQuantity AS Standard,
        um.usedQuantity AS Actual,
        (um.usedQuantity - sm.standardQuantity) AS Difference,
        ds.diagnosisServiceId,
        um.id AS usedRecordId
      FROM UsedMaterials um
      JOIN DiagnosisServices ds ON um.diagnosisServiceId = ds.diagnosisServiceId
      JOIN Services srv ON ds.serviceId = srv.serviceId
      JOIN Materials m ON um.materialId = m.materialId
      LEFT JOIN ServiceMaterials sm ON sm.serviceId = srv.serviceId AND sm.materialId = um.materialId
      ORDER BY srv.serviceName, m.materialName
    `);
    return result.recordset;
  },

  /**
   * updateServiceMaterial
   * Cập nhật standardQuantity trong ServiceMaterials
   */
  async updateServiceMaterial(serviceId, materialId, standardQuantity) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("serviceId", sql.Int, serviceId)
      .input("materialId", sql.Int, materialId)
      .input("standardQuantity", sql.Decimal(18, 2), standardQuantity).query(`
        UPDATE ServiceMaterials
        SET standardQuantity = @standardQuantity
        WHERE serviceId = @serviceId AND materialId = @materialId
      `);

    if (result.rowsAffected[0] === 0) {
      throw new Error("Không tìm thấy định mức vật tư để cập nhật");
    }

    return { message: "Cập nhật định mức thành công!" };
  },

  /**
   * addMaterialToService
   * Thêm mới 1 dòng vào ServiceMaterials
   */
  async addMaterialToService(serviceId, materialId, standardQuantity) {
    const pool = await getPool();

    // Kiểm tra trùng
    const exists = await pool
      .request()
      .input("serviceId", sql.Int, serviceId)
      .input("materialId", sql.Int, materialId).query(`
        SELECT 1 FROM ServiceMaterials
        WHERE serviceId = @serviceId AND materialId = @materialId
      `);

    if (exists.recordset.length > 0) {
      throw new Error("Vật tư này đã có trong dịch vụ");
    }

    await pool
      .request()
      .input("serviceId", sql.Int, serviceId)
      .input("materialId", sql.Int, materialId)
      .input("standardQuantity", sql.Decimal(18, 2), standardQuantity).query(`
        INSERT INTO ServiceMaterials (serviceId, materialId, standardQuantity)
        VALUES (@serviceId, @materialId, @standardQuantity)
      `);

    return { message: "Thêm vật tư vào dịch vụ thành công!" };
  },

  /**
   * removeMaterialFromService
   * Xóa 1 dòng khỏi ServiceMaterials
   */
  async removeMaterialFromService(serviceId, materialId) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("serviceId", sql.Int, serviceId)
      .input("materialId", sql.Int, materialId).query(`
        DELETE FROM ServiceMaterials
        WHERE serviceId = @serviceId AND materialId = @materialId
      `);

    if (result.rowsAffected[0] === 0) {
      throw new Error("Không tìm thấy định mức để xóa");
    }

    return { message: "Xóa vật tư khỏi dịch vụ thành công!" };
  },

  /**
   * getAllServices
   * Lấy danh sách dịch vụ
   */
  async getAllServices() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT serviceId, serviceName
      FROM Services
      ORDER BY serviceName
    `);
    return result.recordset;
  },

  /**
   * getAllServiceMaterials
   * Lấy toàn bộ ServiceMaterials + thông tin vật tư
   */
  async getAllServiceMaterials() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        sm.id,
        sm.serviceId,
        sm.materialId,
        sm.standardQuantity,
        m.materialName,
        m.unit
      FROM ServiceMaterials sm
      JOIN Materials m ON sm.materialId = m.materialId
      ORDER BY sm.serviceId, m.materialName
    `);
    return result.recordset;
  },
};
