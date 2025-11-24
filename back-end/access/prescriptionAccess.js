// // access/prescriptionAccess.js
// const { getPool } = require("../config/db");

// module.exports = {
//   /**
//    * =========================================================
//    * 1️⃣ LẤY DANH SÁCH CA CHỜ KÊ ĐƠN (WaitingForPrescription)
//    * =========================================================
//    */
//   async getWaitingForPrescription(doctorId) {
//     const pool = await getPool();

//     const result = await pool.request().input("doctorId", doctorId).query(`
//         SELECT
//           a.appointmentId,
//           a.patientId,
//           u.fullName AS patientName,
//           d.diagnosisId,
//           sch.workDate,
//           CONVERT(varchar(5), sl.startTime, 108) AS startTime,
//           CONVERT(varchar(5), sl.endTime, 108) AS endTime,
//           a.status
//         FROM Appointments a
//         JOIN Users u ON a.patientId = u.userId
//         JOIN Slots sl ON a.slotId = sl.slotId
//         JOIN Schedules sch ON sl.scheduleId = sch.scheduleId
//         JOIN Diagnoses d ON d.appointmentId = a.appointmentId
//         WHERE a.doctorId = @doctorId
//           AND a.status = 'WaitingForPrescription'
//         ORDER BY sch.workDate DESC, sl.startTime ASC
//       `);

//     return result.recordset;
//   },

//   /**
//    * =========================================================
//    * 2️⃣ TẠO ĐƠN THUỐC  → CHUYỂN STATUS = PrescriptionCompleted
//    * =========================================================
//    */
//   async createPrescription({ diagnosisId, doctorId, patientId, medicines }) {
//     const pool = await getPool();
//     const transaction = pool.transaction();

//     await transaction.begin();

//     try {
//       // 1. Tạo prescription
//       const pres = await transaction
//         .request()
//         .input("diagnosisId", diagnosisId)
//         .input("doctorId", doctorId)
//         .input("patientId", patientId).query(`
//           INSERT INTO Prescriptions (diagnosisId, doctorId, patientId, createdAt, updatedAt)
//           OUTPUT INSERTED.*
//           VALUES (@diagnosisId, @doctorId, @patientId, GETDATE(), GETDATE())
//         `);

//       const prescription = pres.recordset[0];

//       // 2. Thêm từng thuốc vào PrescriptionItems
//       for (const m of medicines) {
//         await transaction
//           .request()
//           .input("prescriptionId", prescription.prescriptionId)
//           .input("medicineId", m.medicineId)
//           .input("quantity", m.quantity)
//           .input("dosage", m.dosage || null)
//           .input("usageInstruction", m.usageInstruction || null).query(`
//             INSERT INTO PrescriptionItems (prescriptionId, medicineId, quantity, dosage, usageInstruction)
//             VALUES (@prescriptionId, @medicineId, @quantity, @dosage, @usageInstruction)
//           `);
//       }

//       // 3. Update status → PrescriptionCompleted
//       await transaction.request().input("diagnosisId", diagnosisId).query(`
//           UPDATE Appointments
//           SET status = 'PrescriptionCompleted', updatedAt = GETDATE()
//           WHERE appointmentId = (
//             SELECT appointmentId FROM Diagnoses WHERE diagnosisId = @diagnosisId
//           )
//         `);

//       await transaction.commit();
//       return prescription;
//     } catch (err) {
//       await transaction.rollback();
//       throw err;
//     }
//   },

//   /**
//    * =========================================================
//    * 3️⃣ LẤY ĐƠN THUỐC THEO DIAGNOSIS
//    * =========================================================
//    */
//   async getPrescriptionByDiagnosis(diagnosisId) {
//     const pool = await getPool();

//     const header = await pool.request().input("diagnosisId", diagnosisId)
//       .query(`
//         SELECT p.*, u.fullName AS doctorName
//         FROM Prescriptions p
//         JOIN Users u ON p.doctorId = u.userId
//         WHERE p.diagnosisId = @diagnosisId
//       `);

//     if (header.recordset.length === 0) return null;

//     const prescription = header.recordset[0];

//     const items = await pool
//       .request()
//       .input("prescriptionId", prescription.prescriptionId).query(`
//         SELECT
//           pi.*,
//           m.medicineName,
//           m.price
//         FROM PrescriptionItems pi
//         JOIN Medicines m ON pi.medicineId = m.medicineId
//         WHERE pi.prescriptionId = @prescriptionId
//       `);

//     return {
//       ...prescription,
//       items: items.recordset,
//     };
//   },
// };
