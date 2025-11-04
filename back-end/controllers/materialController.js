// controllers/materialController.js
// Controller gom các endpoint cho module Material (Admin + Nurse).
// Mỗi hàm chỉ nhận request, gọi service tương ứng và trả JSON response.
// Note: validate input ở controller trước khi gọi service (cơ bản).

const materialService = require("../access/materialAcess");

/**
 * GET /api/materials
 * Admin: Lấy toàn bộ vật tư
 */
exports.getAllMaterials = async (req, res) => {
  try {
    const data = await materialService.getAllMaterials();
    res.json(data);
  } catch (err) {
    console.error("getAllMaterials error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/materials/transactions
 * Admin: Lấy lịch sử giao dịch vật tư
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const data = await materialService.getAllTransactions();
    res.json(data);
  } catch (err) {
    console.error("getAllTransactions error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/materials/use
 * Nurse: Lấy vật tư (ghi 1 transaction 'USE')
 * Body: { materialId, userId, appointmentId (optional), quantity, note }
 */
exports.useMaterial = async (req, res) => {
  try {
    const {
      materialId,
      userId,
      appointmentId = null,
      quantity,
      note = null,
    } = req.body;
    if (!materialId || !userId || quantity == null) {
      return res
        .status(400)
        .json({ error: "materialId, userId và quantity là bắt buộc." });
    }
    const result = await materialService.addTransaction({
      materialId,
      userId,
      appointmentId,
      transactionType: "USE",
      quantity,
      note,
    });
    res.json(result);
  } catch (err) {
    console.error("useMaterial error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/materials/return
 * Nurse: Hoàn vật tư thừa (ghi 1 transaction 'RETURN')
 * Body: { materialId, userId, appointmentId (optional), quantity, note }
 */
exports.returnMaterial = async (req, res) => {
  try {
    const {
      materialId,
      userId,
      appointmentId = null,
      quantity,
      note = null,
    } = req.body;
    if (!materialId || !userId || quantity == null) {
      return res
        .status(400)
        .json({ error: "materialId, userId và quantity là bắt buộc." });
    }
    const result = await materialService.addTransaction({
      materialId,
      userId,
      appointmentId,
      transactionType: "RETURN",
      quantity,
      note,
    });
    res.json(result);
  } catch (err) {
    console.error("returnMaterial error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/materials/import
 * Admin: Nhập kho (ghi 1 transaction 'IMPORT')
 * Body: { materialId, userId, quantity, note }
 */
exports.importMaterial = async (req, res) => {
  try {
    const { materialId, userId, quantity, note = null } = req.body;
    if (!materialId || !userId || quantity == null) {
      return res
        .status(400)
        .json({ error: "materialId, userId và quantity là bắt buộc." });
    }
    const result = await materialService.addTransaction({
      materialId,
      userId,
      transactionType: "IMPORT",
      quantity,
      note,
    });
    res.json(result);
  } catch (err) {
    console.error("importMaterial error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/materials/used
 * Nurse: Ghi nhận vật tư thực tế đã dùng
 * Body: { diagnosisServiceId (preferred) OR appointmentId, materialId, quantityUsed, note }
 */
exports.addUsedMaterial = async (req, res) => {
  try {
    const {
      diagnosisServiceId = null,
      appointmentId = null,
      materialId,
      quantityUsed,
      note = null,
    } = req.body;
    if (!materialId || quantityUsed == null) {
      return res
        .status(400)
        .json({ error: "materialId và quantityUsed là bắt buộc." });
    }
    const result = await materialService.addUsedMaterial({
      diagnosisServiceId,
      appointmentId,
      materialId,
      quantityUsed,
      note,
    });
    res.json(result);
  } catch (err) {
    console.error("addUsedMaterial error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/materials/appointments
 * Nurse: Lấy danh sách ca khám hôm nay (kèm patient/doctor/service nếu có)
 */
exports.getTodayAppointments = async (req, res) => {
  try {
    const data = await materialService.getTodayAppointments();
    res.json(data);
  } catch (err) {
    console.error("getTodayAppointments error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/materials/service/:serviceId
 * Nurse: Lấy vật tư định mức cho 1 dịch vụ
 */
exports.getMaterialsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    if (!serviceId)
      return res.status(400).json({ error: "serviceId required" });
    const data = await materialService.getMaterialsByService(
      parseInt(serviceId, 10)
    );
    res.json(data);
  } catch (err) {
    console.error("getMaterialsByService error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/materials/report
 * Admin: Lấy báo cáo so sánh chuẩn vs thực tế sử dụng vật tư
 */
exports.getMaterialUsageReport = async (req, res) => {
  try {
    const data = await materialService.getMaterialUsageReport();
    res.json(data);
  } catch (err) {
    console.error("getMaterialUsageReport error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.addNewMaterial = async (req, res) => {
  try {
    const { materialName, unit, unitPrice } = req.body;
    if (!materialName || !unit || !unitPrice) {
      return res.status(400).json({ error: "Thiếu thông tin vật tư." });
    }
    const result = await materialService.addNewMaterial({
      materialName,
      unit,
      unitPrice,
    });
    res.json(result);
  } catch (err) {
    console.error("addNewMaterial error:", err);
    res.status(500).json({ error: err.message });
  }
};
