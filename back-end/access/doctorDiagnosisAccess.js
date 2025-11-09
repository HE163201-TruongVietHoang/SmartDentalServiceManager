// services/doctorDiagnosisService.js
const { getPool } = require("../config/db");

module.exports = {
  // 1️⃣ Lấy danh sách ca khám hôm nay cho bác sĩ
  async getDoctorAppointments(doctorId) {
    const pool = await getPool();
    const result = await pool.request().input("doctorId", doctorId).query(`
        SELECT 
          a.appointmentId,
          u.fullName AS patientName,
          sch.workDate,
          sl.startTime,
          sl.endTime,
          a.status
        FROM Appointments a
        JOIN Users u ON a.patientId = u.userId
        JOIN Slots sl ON a.slotId = sl.slotId
        JOIN Schedules sch ON sl.scheduleId = sch.scheduleId
        WHERE a.doctorId = @doctorId
          AND a.status = 'Scheduled'
        ORDER BY sch.workDate DESC, sl.startTime ASC
      `);
    return result.recordset;
  },

  // 2️⃣ Tạo chẩn đoán mới
  async createDiagnosis({ appointmentId, doctorId, diagnosisText, notes }) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("appointmentId", appointmentId)
      .input("doctorId", doctorId)
      .input("diagnosisText", diagnosisText)
      .input("notes", notes).query(`
        INSERT INTO Diagnoses (appointmentId, doctorId, diagnosisText, notes, createdAt)
        OUTPUT INSERTED.*
        VALUES (@appointmentId, @doctorId, @diagnosisText, @notes, GETDATE())
      `);
    return result.recordset[0];
  },

  // 3️⃣ Thêm dịch vụ cho chẩn đoán
  async addDiagnosisServices(diagnosisId, services) {
    const pool = await getPool();

    for (const serviceId of services) {
      await pool
        .request()
        .input("diagnosisId", diagnosisId)
        .input("serviceId", serviceId).query(`
          INSERT INTO DiagnosisServices (diagnosisId, serviceId, createdAt)
          VALUES (@diagnosisId, @serviceId, GETDATE())
        `);
    }

    return { success: true, added: services.length };
  },
};
