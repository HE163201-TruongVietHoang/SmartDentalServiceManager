// controllers/doctorDiagnosisController.js
const doctorDiagnosisService = require("../access/doctorDiagnosisAccess");

exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const data = await doctorDiagnosisService.getDoctorAppointments(doctorId);
    res.json(data);
  } catch (err) {
    console.error("getDoctorAppointments error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Tạo chẩn đoán mới (chuẩn theo DB SmartDentalService)
exports.createDiagnosis = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { appointmentId, symptoms, diagnosisResult, doctorNote } = req.body;

    if (!appointmentId || !diagnosisResult)
      return res.status(400).json({ error: "Thiếu dữ liệu cần thiết" });

    const diagnosis = await doctorDiagnosisService.createDiagnosis({
      appointmentId,
      doctorId,
      symptoms: symptoms || null,
      diagnosisResult,
      doctorNote: doctorNote || null,
    });

    res.json(diagnosis);
  } catch (err) {
    console.error("createDiagnosis error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Thêm dịch vụ điều trị
exports.addDiagnosisServices = async (req, res) => {
  try {
    const { diagnosisId } = req.params;
    const { services } = req.body;

    if (!services || !Array.isArray(services))
      return res.status(400).json({ error: "Danh sách dịch vụ không hợp lệ" });

    const result = await doctorDiagnosisService.addDiagnosisServices(
      diagnosisId,
      services
    );

    res.json(result);
  } catch (err) {
    console.error("addDiagnosisServices error:", err);
    res.status(500).json({ error: err.message });
  }
};
