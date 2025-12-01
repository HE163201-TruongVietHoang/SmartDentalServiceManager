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

async function getPatientMedicalRecord(req, res) {
  try {
    const patientId = Number(req.params.id);

    const raw = await patientService.getPatientMedicalRecord(patientId);

    // Gom theo appointmentId
    const grouped = {};

    raw.forEach((row) => {
      if (!grouped[row.appointmentId]) {
        grouped[row.appointmentId] = {
          appointmentId: row.appointmentId,
          appointmentType: row.appointmentType,
          reason: row.reason,
          appointmentStatus: row.appointmentStatus,
          workDate: row.workDate,
          startTime: row.startTime,
          endTime: row.endTime,
          doctorName: row.doctorName,

          diagnosis: row.diagnosisId
            ? {
                diagnosisId: row.diagnosisId,
                symptoms: row.symptoms,
                diagnosisResult: row.diagnosisResult,
                doctorNote: row.doctorNote,
                diagnosisDate: row.diagnosisDate,
                services: [],
              }
            : null,

          prescription: [],
          invoice: row.invoiceId
            ? {
                invoiceId: row.invoiceId,
                totalAmount: row.totalAmount,
                discountAmount: row.discountAmount,
                finalAmount: row.finalAmount,
                status: row.invoiceStatus,
              }
            : null,

          payments: [],
        };
      }

      const current = grouped[row.appointmentId];

      // Thêm service
      if (row.serviceId) {
        current.diagnosis?.services.push({
          serviceId: row.serviceId,
          serviceName: row.serviceName,
          status: row.serviceStatus,
        });
      }

      // Thêm thuốc
      if (row.medicineName) {
        current.prescription.push({
          medicineName: row.medicineName,
          quantity: row.medicineQty,
          dosage: row.dosage,
          usageInstruction: row.usageInstruction,
        });
      }

      // Thêm payment
      if (row.paymentId) {
        current.payments.push({
          paymentId: row.paymentId,
          paymentMethod: row.paymentMethod,
          amount: row.paidAmount,
          status: row.paymentStatus,
        });
      }
    });

    res.json({
      success: true,
      medicalRecord: Object.values(grouped),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAllPatients, getPatientDetail, getPatientMedicalRecord };
