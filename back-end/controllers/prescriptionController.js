// // controllers/prescriptionController.js
// const prescriptionService = require("../access/prescriptionAccess");

// exports.createPrescription = async (req, res) => {
//   try {
//     const doctorId = req.user.userId;
//     const { diagnosisId, patientId, medicines } = req.body;

//     if (!diagnosisId || !patientId || !medicines?.length) {
//       return res.status(400).json({ error: "Thiếu dữ liệu kê đơn" });
//     }

//     const result = await prescriptionService.createPrescription({
//       diagnosisId,
//       doctorId,
//       patientId,
//       medicines,
//     });

//     res.json({ message: "Tạo đơn thuốc thành công", prescription: result });
//   } catch (err) {
//     console.error("createPrescription error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getPrescription = async (req, res) => {
//   try {
//     const { diagnosisId } = req.params;

//     const data = await prescriptionService.getPrescriptionByDiagnosis(
//       diagnosisId
//     );
//     if (!data)
//       return res.status(404).json({ error: "Không tìm thấy đơn thuốc" });

//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getWaitingForPrescription = async (req, res) => {
//   try {
//     const doctorId = req.user.userId;
//     const data = await prescriptionService.getWaitingForPrescription(doctorId);
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
