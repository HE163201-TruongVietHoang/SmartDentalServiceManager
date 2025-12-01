const { sql, getPool } = require("../config/db");

async function create({ patientId, appointmentId, diagnosisId, prescriptionId, promotionId, totalAmount, discountAmount, status }) {
  const pool = await getPool();
  const finalAmount = totalAmount - (discountAmount || 0);
  const result = await pool.request()
    .input("patientId", sql.Int, patientId)
    .input("appointmentId", sql.Int, appointmentId)
    .input("diagnosisId", sql.Int, diagnosisId || null)
    .input("prescriptionId", sql.Int, prescriptionId || null)
    .input("promotionId", sql.Int, promotionId || null)
    .input("totalAmount", sql.Decimal(18, 2), totalAmount)
    .input("discountAmount", sql.Decimal(18, 2), discountAmount || 0)
    .input("finalAmount", sql.Decimal(18, 2), finalAmount)
    .input("status", sql.NVarChar, status || 'Pending')
    .query(`
      INSERT INTO Invoices (patientId, appointmentId, diagnosisId, prescriptionId, promotionId, totalAmount, discountAmount, finalAmount, status, issuedDate)
      VALUES (@patientId, @appointmentId, @diagnosisId, @prescriptionId, @promotionId, @totalAmount, @discountAmount, @finalAmount, @status, GETDATE());
      SELECT SCOPE_IDENTITY() AS invoiceId;
    `);
  return result.recordset[0];
}

async function getAll() {
  const pool = await getPool();
  const result = await pool.request()
    .query(`
      SELECT 
        i.*,
        u.fullName as patientName,
        sch.workDate,
        s.slotId,
        s.startTime,
        s.endTime,
        pr.code as promotionCode
      FROM Invoices i
      LEFT JOIN Users u ON i.patientId = u.userId
      LEFT JOIN Appointments a ON i.appointmentId = a.appointmentId
      LEFT JOIN Slots s ON a.slotId = s.slotId
      LEFT JOIN Schedules sch ON s.scheduleId = sch.scheduleId
      LEFT JOIN Promotions pr ON i.promotionId = pr.promotionId
      ORDER BY i.issuedDate DESC
    `);
  return result.recordset;
}

async function getById(invoiceId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("invoiceId", sql.Int, invoiceId)
    .query(`
      SELECT 
        i.*,
        u.fullName as patientName,
        sch.workDate,
        s.slotId,
        s.startTime,
        s.endTime,
        pr.code as promotionCode
      FROM Invoices i
      LEFT JOIN Users u ON i.patientId = u.userId
      LEFT JOIN Appointments a ON i.appointmentId = a.appointmentId
      LEFT JOIN Slots s ON a.slotId = s.slotId
      LEFT JOIN Schedules sch ON s.scheduleId = sch.scheduleId
      LEFT JOIN Promotions pr ON i.promotionId = pr.promotionId
      WHERE i.invoiceId = @invoiceId
    `);
  return result.recordset[0];
}

async function update(invoiceId, { status, discountAmount, promotionId }) {
  const pool = await getPool();
  await pool.request()
    .input("invoiceId", sql.Int, invoiceId)
    .input("status", sql.NVarChar, status)
    .input("discountAmount", sql.Decimal(18, 2), discountAmount)
    .input("promotionId", sql.Int, promotionId || null)
    .query(`
      UPDATE Invoices
      SET status = @status, discountAmount = @discountAmount, promotionId = @promotionId
      WHERE invoiceId = @invoiceId
    `);
}

async function getByPatientId(patientId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("patientId", sql.Int, patientId)
    .query(`
      SELECT 
        i.*,
        u.fullName as patientName,
        sch.workDate,
        s.slotId,
        s.startTime,
        s.endTime,
        pr.code as promotionCode
      FROM Invoices i
      LEFT JOIN Users u ON i.patientId = u.userId
      LEFT JOIN Appointments a ON i.appointmentId = a.appointmentId
      LEFT JOIN Slots s ON a.slotId = s.slotId
      LEFT JOIN Schedules sch ON s.scheduleId = sch.scheduleId
      LEFT JOIN Promotions pr ON i.promotionId = pr.promotionId
      WHERE i.patientId = @patientId
      ORDER BY i.issuedDate DESC
    `);
  return result.recordset;
}


async function getPendingInvoices() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT 
      I.invoiceId,
      I.issuedDate,
      CONVERT(date, SCH.workDate) AS examDate,
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
    JOIN Schedules SCH ON S.scheduleId = SCH.scheduleId
    WHERE I.status = 'Pending'
    ORDER BY I.issuedDate DESC
  `);
  return result.recordset;
}

// Lấy hóa đơn chờ thanh toán theo userId (bệnh nhân)
async function getPendingInvoicesByUserId(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT 
        I.invoiceId,
        I.issuedDate,
        CONVERT(date, SCH.workDate) AS examDate,
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
      JOIN Schedules SCH ON S.scheduleId = SCH.scheduleId
      WHERE I.status = 'Pending' AND U.userId = @userId
      ORDER BY I.issuedDate DESC
    `);
  return result.recordset;
}
async function getInvoicesByUserId(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT 
        I.invoiceId,
        I.issuedDate,
        CONVERT(date, SCH.workDate) AS examDate,
        A.appointmentId,
        U.fullName AS patientName,
        D.fullName AS doctorName,
        CONVERT(varchar(5), S.startTime, 108) AS startTime,
        CONVERT(varchar(5), S.endTime, 108) AS endTime,
        I.totalAmount,
        I.discountAmount,
        I.finalAmount,
        I.status
      FROM Invoices I
      JOIN Appointments A ON I.appointmentId = A.appointmentId
      JOIN Users U ON A.patientId = U.userId
      JOIN Users D ON A.doctorId = D.userId
      JOIN Slots S ON A.slotId = S.slotId
      JOIN Schedules SCH ON S.scheduleId = SCH.scheduleId
      WHERE U.userId = @userId
      ORDER BY I.issuedDate DESC
    `);
  return result.recordset;
}
async function getInvoiceDetail(invoiceId) {
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
      I.discountAmount,
      I.finalAmount,
      I.status,
      PR.code AS promotionCode
    FROM Invoices I
    JOIN Appointments A ON I.appointmentId = A.appointmentId
    JOIN Users U ON A.patientId = U.userId
    JOIN Users D ON A.doctorId = D.userId
    JOIN Slots S ON A.slotId = S.slotId
    JOIN Schedules SCH ON S.scheduleId = SCH.scheduleId
    LEFT JOIN Promotions PR ON I.promotionId = PR.promotionId
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
  // MEDICINES
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
}

async function confirmPayment(invoiceId) {
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
}
async function checkPendingInvoicesByUserId(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT COUNT(*) as count
      FROM Invoices I
      JOIN Appointments A ON I.appointmentId = A.appointmentId
      WHERE I.status = 'Pending' AND A.patientId = @userId
    `);
  return result.recordset[0].count > 0;
}

module.exports = { create, getAll, getById, update, getByPatientId, getPendingInvoices, getPendingInvoicesByUserId, getInvoiceDetail, confirmPayment, getInvoicesByUserId, checkPendingInvoicesByUserId };
