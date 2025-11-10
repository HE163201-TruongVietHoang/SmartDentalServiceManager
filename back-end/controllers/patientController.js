const { patientService } = require("../services/patientService");

// Xem tất cả patient
async function getAllPatients(req, res) {
  try {
    const patients = await patientService.getAllPatients();
    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Xem chi tiết patient theo ID
async function getPatientDetail(req, res) {
  try {
    const patientId = Number(req.params.id);
    const patient = await patientService.getPatientDetail(patientId);
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAllPatients, getPatientDetail };
