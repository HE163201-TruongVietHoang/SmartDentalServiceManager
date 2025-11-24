// back-end/controllers/medicineController.js
const {
  getAllMedicines,
  addMedicine,
  deleteMedicine,
} = require("../access/medicineAccess");

// Lấy danh sách thuốc
exports.getMedicines = async (req, res) => {
  try {
    const list = await getAllMedicines();
    return res.json(list);
  } catch (err) {
    console.error("GET MEDICINES ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Thêm thuốc mới
exports.addMedicine = async (req, res) => {
  console.log("BODY NHẬN ĐƯỢC:", req.body);

  const { medicineName, unit, description } = req.body;

  if (!medicineName || medicineName.trim() === "") {
    return res.status(400).json({ error: "Tên thuốc không được để trống" });
  }

  try {
    const result = await addMedicine(
      medicineName.trim(),
      unit || "",
      description || null
    );
    return res.json(result); // trả về object thuốc vừa thêm
  } catch (err) {
    console.error("ADD MEDICINE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Xóa thuốc
exports.deleteMedicine = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "ID thuốc không hợp lệ" });
    }

    try {
      await deleteMedicine(id);
      return res.json({ success: true });
    } catch (err) {
      if (err.code === "IN_USE") {
        return res.status(400).json({ error: err.message });
      }
      throw err;
    }
  } catch (err) {
    console.error("DELETE MEDICINE ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
