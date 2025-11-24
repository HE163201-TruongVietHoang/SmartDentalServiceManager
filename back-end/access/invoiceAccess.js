const { sql, getPool } = require("../config/db");

module.exports = {
  // =========================================
  // GET PENDING INVOICES
  // =========================================
  getPendingInvoices: async () => {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
    I.invoiceId,
    I.issuedDate,
    CONVERT(date, SCH.workDate) AS examDate,   -- ✔ THÊM DÒNG NÀY
    A.appointmentId,
    U.fullName AS patientName,
    D.fullName AS doctorName,
    CONVERT(varchar(5), S.startTime, 108) AS startTime,
    CONVERT(varchar(5), S.endTime, 108) AS endTime,
    I.totalAmount,
    I.status
FROM Invoices I
JOIN Appointments A ON I.appointmentId = A.appointmentId
JOIN Users U ON A.patientId = U.userId
JOIN Users D ON A.doctorId = D.userId
JOIN Slots S ON A.slotId = S.slotId
JOIN Schedules SCH ON S.scheduleId = SCH.scheduleId   -- ✔ THÊM JOIN
WHERE I.status = 'Pending'
ORDER BY I.issuedDate DESC
`);

    return result.recordset;
  },

  // =========================================
  // GET INVOICE DETAIL
  // =========================================
  getInvoiceDetail: async (invoiceId) => {
    const pool = await getPool();

    // HEADER
    const header = await pool.request().input("id", sql.Int, invoiceId).query(`
      SELECT 
        I.invoiceId,
        I.appointmentId,
        U.fullName AS patientName,
        U.phone AS patientPhone,
        D.fullName AS doctorName,
        CONVERT(date, SCH.workDate) AS examDate,
        CONVERT(varchar(5), S.startTime, 108) AS startTime,
        CONVERT(varchar(5), S.endTime, 108) AS endTime,
        I.totalAmount,
        I.finalAmount,
        I.status
      FROM Invoices I
      JOIN Appointments A ON I.appointmentId = A.appointmentId
      JOIN Users U ON A.patientId = U.userId
      JOIN Users D ON A.doctorId = D.userId
      JOIN Slots S ON A.slotId = S.slotId
      JOIN Schedules SCH ON S.scheduleId = SCH.scheduleId
      WHERE I.invoiceId = @id
    `);

    // DIAGNOSIS
    const diagnosis = await pool.request().input("id", sql.Int, invoiceId)
      .query(`
      SELECT 
        DG.symptoms,
        DG.diagnosisResult,
        DG.doctorNote
      FROM Diagnoses DG
      JOIN Invoices I ON I.diagnosisId = DG.diagnosisId
      WHERE I.invoiceId = @id
    `);

    // SERVICES
    const services = await pool.request().input("id", sql.Int, invoiceId)
      .query(`
      SELECT 
        S.serviceName,
        S.price
      FROM DiagnosisServices DS
      JOIN Diagnoses DG ON DG.diagnosisId = DS.diagnosisId
      JOIN Invoices I ON I.diagnosisId = DG.diagnosisId
      JOIN Services S ON S.serviceId = DS.serviceId
      WHERE I.invoiceId = @id
    `);

    // MEDICINES (không có duration – sửa đúng DB)
    const medicines = await pool.request().input("id", sql.Int, invoiceId)
      .query(`
      SELECT 
        M.medicineName,
        PI.dosage,
        PI.usageInstruction,
        PI.quantity
      FROM PrescriptionItems PI
      JOIN Prescriptions P ON P.prescriptionId = PI.prescriptionId
      JOIN Invoices I ON I.prescriptionId = P.prescriptionId
      JOIN Medicines M ON M.medicineId = PI.medicineId
      WHERE I.invoiceId = @id
    `);

    return {
      header: header.recordset[0],
      diagnosis: diagnosis.recordset[0],
      services: services.recordset,
      medicines: medicines.recordset,
    };
  },

  // =========================================
  // CONFIRM PAYMENT
  // =========================================
  confirmPayment: async (invoiceId) => {
    const pool = await getPool();

    await pool.request().input("id", sql.Int, invoiceId).query(`
      UPDATE Invoices
      SET status = 'Paid'
      WHERE invoiceId = @id
    `);

    await pool.request().input("id", sql.Int, invoiceId).query(`
      UPDATE Appointments
      SET status = 'Completed'
      WHERE appointmentId = (
        SELECT appointmentId FROM Invoices WHERE invoiceId = @id
      )
    `);

    return true;
  },
};
