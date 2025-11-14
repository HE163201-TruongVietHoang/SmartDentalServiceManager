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
        UPDATE SET rating = @rating, comment = @comment, appointmentId = @appointmentId, createdAt = GETUTCDATE()
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
    .query(`UPDATE ServiceRatings SET rating = @rating, comment = @comment, appointmentId = @appointmentId, createdAt = GETUTCDATE() WHERE serviceId = @serviceId AND patientId = @patientId`);
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
        UPDATE SET rating = @rating, comment = @comment, appointmentId = @appointmentId, createdAt = GETUTCDATE()
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
    .query(`UPDATE DoctorRatings SET rating = @rating, comment = @comment, appointmentId = @appointmentId, createdAt = GETUTCDATE() WHERE doctorId = @doctorId AND patientId = @patientId`);
}

async function deleteDoctorRating({ doctorId, patientId }) {
  const pool = await getPool();
  await pool.request()
    .input('doctorId', sql.Int, doctorId)
    .input('patientId', sql.Int, patientId)
    .query(`DELETE FROM DoctorRatings WHERE doctorId = @doctorId AND patientId = @patientId`);
}

// Lấy tất cả đánh giá cho homepage (kết hợp Doctor và Service ratings)
async function getAllRatingsForHomepage(limit = 6) {
  const pool = await getPool();
  
  // Lấy đánh giá bác sĩ với thông tin bệnh nhân và bác sĩ
  const doctorRatingsQuery = `
    SELECT TOP ${limit}
      dr.ratingId,
      dr.rating,
      dr.comment,
      dr.createdAt,
      'doctor' as ratingType,
      u1.fullName as patientName,
      u2.fullName as doctorName,
      dr.doctorId as targetId,
      u2.fullName as targetName
    FROM DoctorRatings dr
    INNER JOIN Users u1 ON dr.patientId = u1.userId
    INNER JOIN Users u2 ON dr.doctorId = u2.userId
    WHERE dr.comment IS NOT NULL AND dr.comment != '' AND dr.rating >= 4
    ORDER BY dr.createdAt DESC
  `;
  
  // Lấy đánh giá dịch vụ với thông tin bệnh nhân và dịch vụ
  const serviceRatingsQuery = `
    SELECT TOP ${limit}
      sr.ratingId,
      sr.rating,
      sr.comment,
      sr.createdAt,
      'service' as ratingType,
      u.fullName as patientName,
      s.serviceName as targetName,
      sr.serviceId as targetId
    FROM ServiceRatings sr
    INNER JOIN Users u ON sr.patientId = u.userId
    INNER JOIN Services s ON sr.serviceId = s.serviceId
    WHERE sr.comment IS NOT NULL AND sr.comment != '' AND sr.rating >= 4
    ORDER BY sr.createdAt DESC
  `;
  
  const doctorResult = await pool.request().query(doctorRatingsQuery);
  const serviceResult = await pool.request().query(serviceRatingsQuery);
  
  // Kết hợp và sắp xếp theo thời gian
  const allRatings = [
    ...doctorResult.recordset,
    ...serviceResult.recordset
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return allRatings.slice(0, limit);
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
  deleteDoctorRating,
  getAllRatingsForHomepage
};
