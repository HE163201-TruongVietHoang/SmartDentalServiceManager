const { getPool, sql } = require('../config/db');

// ServiceRatings
async function insertOrUpdateServiceRating({ serviceId, patientId, rating, comment, appointmentId }) {
  const pool = await getPool();
  await pool.request()
    .input('serviceId', sql.Int, serviceId)
    .input('patientId', sql.Int, patientId)
    .input('rating', sql.TinyInt, rating)
    .input('comment', sql.NVarChar, comment || null)
    .input('appointmentId', sql.Int, appointmentId || null)
    .query(`
      MERGE INTO ServiceRatings AS target
      USING (SELECT @serviceId AS serviceId, @patientId AS patientId) AS source
      ON (target.serviceId = source.serviceId AND target.patientId = source.patientId)
      WHEN MATCHED THEN
        UPDATE SET rating = @rating, comment = @comment, appointmentId = @appointmentId, createdAt = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (serviceId, patientId, rating, comment, appointmentId)
        VALUES (@serviceId, @patientId, @rating, @comment, @appointmentId);
    `);
}

async function getServiceRatings(serviceId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('serviceId', sql.Int, serviceId)
    .query(`SELECT * FROM ServiceRatings WHERE serviceId = @serviceId ORDER BY createdAt DESC`);
  return result.recordset;
}

// Lấy đánh giá dịch vụ theo appointmentId và serviceId
async function getServiceRatingByAppointment({ appointmentId, serviceId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('appointmentId', sql.Int, appointmentId)
    .input('serviceId', sql.Int, serviceId)
    .query(`SELECT * FROM ServiceRatings WHERE appointmentId = @appointmentId AND serviceId = @serviceId`);
  return result.recordset[0] || null;
}

// Lấy đánh giá bác sĩ theo appointmentId và doctorId
async function getDoctorRatingByAppointment({ appointmentId, doctorId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('appointmentId', sql.Int, appointmentId)
    .input('doctorId', sql.Int, doctorId)
    .query(`SELECT * FROM DoctorRatings WHERE appointmentId = @appointmentId AND doctorId = @doctorId`);
  return result.recordset[0] || null;
}

async function updateServiceRating({ serviceId, patientId, rating, comment, appointmentId }) {
  const pool = await getPool();
  await pool.request()
    .input('serviceId', sql.Int, serviceId)
    .input('patientId', sql.Int, patientId)
    .input('rating', sql.TinyInt, rating)
    .input('comment', sql.NVarChar, comment || null)
    .input('appointmentId', sql.Int, appointmentId || null)
    .query(`UPDATE ServiceRatings SET rating = @rating, comment = @comment, appointmentId = @appointmentId, createdAt = GETDATE() WHERE serviceId = @serviceId AND patientId = @patientId`);
}

async function deleteServiceRating({ serviceId, patientId }) {
  const pool = await getPool();
  await pool.request()
    .input('serviceId', sql.Int, serviceId)
    .input('patientId', sql.Int, patientId)
    .query(`DELETE FROM ServiceRatings WHERE serviceId = @serviceId AND patientId = @patientId`);
}

// DoctorRatings
async function insertOrUpdateDoctorRating({ doctorId, patientId, rating, comment, appointmentId }) {
  const pool = await getPool();
  await pool.request()
    .input('doctorId', sql.Int, doctorId)
    .input('patientId', sql.Int, patientId)
    .input('rating', sql.TinyInt, rating)
    .input('comment', sql.NVarChar, comment || null)
    .input('appointmentId', sql.Int, appointmentId || null)
    .query(`
      MERGE INTO DoctorRatings AS target
      USING (SELECT @doctorId AS doctorId, @patientId AS patientId) AS source
      ON (target.doctorId = source.doctorId AND target.patientId = source.patientId)
      WHEN MATCHED THEN
        UPDATE SET rating = @rating, comment = @comment, appointmentId = @appointmentId, createdAt = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (doctorId, patientId, rating, comment, appointmentId)
        VALUES (@doctorId, @patientId, @rating, @comment, @appointmentId);
    `);
}

async function getDoctorRatings(doctorId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('doctorId', sql.Int, doctorId)
    .query(`SELECT * FROM DoctorRatings WHERE doctorId = @doctorId ORDER BY createdAt DESC`);
  return result.recordset;
}

async function updateDoctorRating({ doctorId, patientId, rating, comment, appointmentId }) {
  const pool = await getPool();
  await pool.request()
    .input('doctorId', sql.Int, doctorId)
    .input('patientId', sql.Int, patientId)
    .input('rating', sql.TinyInt, rating)
    .input('comment', sql.NVarChar, comment || null)
    .input('appointmentId', sql.Int, appointmentId || null)
    .query(`UPDATE DoctorRatings SET rating = @rating, comment = @comment, appointmentId = @appointmentId, createdAt = GETDATE() WHERE doctorId = @doctorId AND patientId = @patientId`);
}

async function deleteDoctorRating({ doctorId, patientId }) {
  const pool = await getPool();
  await pool.request()
    .input('doctorId', sql.Int, doctorId)
    .input('patientId', sql.Int, patientId)
    .query(`DELETE FROM DoctorRatings WHERE doctorId = @doctorId AND patientId = @patientId`);
}

module.exports = {
  insertOrUpdateServiceRating,
  getServiceRatings,
  getServiceRatingByAppointment,
  getDoctorRatingByAppointment,
  updateServiceRating,
  deleteServiceRating,
  insertOrUpdateDoctorRating,
  getDoctorRatings,
  updateDoctorRating,
  deleteDoctorRating
};
