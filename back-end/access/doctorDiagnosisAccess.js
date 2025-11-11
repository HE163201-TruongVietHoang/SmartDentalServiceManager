// services/doctorDiagnosisAccess.js
const { getPool } = require("../config/db");

module.exports = {
  /**
   * 1️⃣ Lấy danh sách các cuộc hẹn (appointments) của bác sĩ đang chờ khám
   */
  async getDoctorAppointments(doctorId) {
    const pool = await getPool();
    const result = await pool.request().input("doctorId", doctorId).query(`
    SELECT 
      a.appointmentId,
      u.fullName AS patientName,
      sch.workDate,
      CONVERT(varchar(8), sl.startTime, 108) AS startTime,
      CONVERT(varchar(8), sl.endTime, 108) AS endTime,
      a.status
    FROM Appointments a
    JOIN Users u ON a.patientId = u.userId
    JOIN Slots sl ON a.slotId = sl.slotId
    JOIN Schedules sch ON sl.scheduleId = sch.scheduleId
    WHERE a.doctorId = @doctorId
      AND a.status = 'Scheduled'
      AND sch.workDate = CAST(GETDATE() AS DATE)
    ORDER BY sl.startTime ASC
  `);
    return result.recordset;
  },

  /**
   * 2️⃣ Tạo chẩn đoán mới cho một cuộc hẹn
   * Bảng Diagnoses có các cột:
   *  - appointmentId
   *  - symptoms
   *  - diagnosisResult
   *  - doctorNote
   *  - createdAt
   */
  async createDiagnosis({
    appointmentId,
    symptoms,
    diagnosisResult,
    doctorNote,
  }) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("appointmentId", appointmentId)
      .input("symptoms", symptoms || null)
      .input("diagnosisResult", diagnosisResult || null)
      .input("doctorNote", doctorNote || null).query(`
        INSERT INTO Diagnoses (appointmentId, symptoms, diagnosisResult, doctorNote, createdAt)
        OUTPUT INSERTED.*
        VALUES (@appointmentId, @symptoms, @diagnosisResult, @doctorNote, GETDATE())
      `);
    return result.recordset[0];
  },

  /**
   * 3️⃣ Thêm danh sách dịch vụ điều trị (DiagnosisServices)
   * Bảng DiagnosisServices có các cột:
   *  - diagnosisId
   *  - serviceId
   *  - status (default 'Pending')
   *  - note
   *  - createdAt
   */
  async addDiagnosisServices(diagnosisId, services) {
    const pool = await getPool();

    for (const service of services) {
      await pool
        .request()
        .input("diagnosisId", diagnosisId)
        .input("serviceId", service.serviceId)
        .input("note", service.note || null).query(`
          INSERT INTO DiagnosisServices (diagnosisId, serviceId, note, createdAt)
          VALUES (@diagnosisId, @serviceId, @note, GETDATE())
        `);
    }

    return { success: true, added: services.length };
  },
};
