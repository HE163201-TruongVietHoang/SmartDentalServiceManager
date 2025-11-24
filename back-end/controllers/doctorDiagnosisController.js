// controllers/doctorDiagnosisController.js
const doctorDiagnosisService = require("../access/doctorDiagnosisAccess");

exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const data = await doctorDiagnosisService.getDoctorAppointments(doctorId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDiagnosis = async (req, res) => {
  try {
    const {
      appointmentId,
      symptoms,
      diagnosisResult,
      doctorNote,
      services,
      medicines,
    } = req.body;

    if (!appointmentId || !diagnosisResult)
      return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc" });

    const result = await doctorDiagnosisService.createDiagnosis({
      appointmentId,
      symptoms,
      diagnosisResult,
      doctorNote,
      services,
      medicines,
    });

    res.json({
      message: "Chẩn đoán + kê đơn + tạo hóa đơn thành công!",
      ...result, // gồm diagnosisId, prescriptionId, invoiceId, totalServiceCost
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
    res.status(500).json({ error: err.message });
  }
};

exports.getDiagnosisHistory = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { date, patient, serviceId } = req.query;

    const data = await doctorDiagnosisService.getDiagnosisHistory({
      doctorId,
      date,
      patient,
      serviceId,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDiagnosisMedicines = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await doctorDiagnosisService.getMedicinesByDiagnosis(id);
    res.json(data);
  } catch (err) {
    console.error("GET MEDICINES ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};
