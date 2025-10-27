// controllers/materialController.js
const materialService = require("../services/materialService");

// 🟢 1. Xem tồn kho (Admin)
exports.getAllMaterials = async (req, res) => {
  try {
    const data = await materialService.getAllMaterials();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 2. Xem lịch sử vật tư (Admin)
exports.getAllTransactions = async (req, res) => {
  try {
    const data = await materialService.getAllTransactions();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 3. Lấy vật tư (Nurse)
exports.useMaterial = async (req, res) => {
  try {
    const result = await materialService.addTransaction({
      ...req.body,
      transactionType: "USE",
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 4. Hoàn vật tư (Nurse)
exports.returnMaterial = async (req, res) => {
  try {
    const result = await materialService.addTransaction({
      ...req.body,
      transactionType: "RETURN",
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 5. Nhập vật tư (Admin)
exports.importMaterial = async (req, res) => {
  try {
    const result = await materialService.addTransaction({
      ...req.body,
      transactionType: "IMPORT",
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 6. Ghi nhận vật tư đã dùng (Nurse)
exports.addUsedMaterial = async (req, res) => {
  try {
    const result = await materialService.addUsedMaterial(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 7. Xem ca khám hôm nay (Nurse)
exports.getTodayAppointments = async (req, res) => {
  try {
    const data = await materialService.getTodayAppointments();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 8. Xem vật tư định mức theo dịch vụ (Nurse)
exports.getMaterialsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const data = await materialService.getMaterialsByService(serviceId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 9. Xem báo cáo sử dụng vật tư (Admin)
exports.getMaterialUsageReport = async (req, res) => {
  try {
    const data = await materialService.getMaterialUsageReport();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
