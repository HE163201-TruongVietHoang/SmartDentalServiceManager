// services/ratingService.js
const { getPool, sql } = require('../config/db');

// Thêm đánh giá dịch vụ
async function rateService({ serviceId, patientId, rating, comment }) {
  const pool = await getPool();
  await pool.request()
    .input('serviceId', sql.Int, serviceId)
    .input('patientId', sql.Int, patientId)
    .input('rating', sql.TinyInt, rating)
    .input('comment', sql.NVarChar, comment || null)
    .query(`
      MERGE INTO ServiceRatings AS target
      USING (SELECT @serviceId AS serviceId, @patientId AS patientId) AS source
      ON (target.serviceId = source.serviceId AND target.patientId = source.patientId)
      WHEN MATCHED THEN
        UPDATE SET rating = @rating, comment = @comment, createdAt = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (serviceId, patientId, rating, comment)
        VALUES (@serviceId, @patientId, @rating, @comment);
    `);
}

// Thêm đánh giá bác sĩ
async function rateDoctor({ doctorId, patientId, rating, comment }) {
  const pool = await getPool();
  await pool.request()
    .input('doctorId', sql.Int, doctorId)
    .input('patientId', sql.Int, patientId)
    .input('rating', sql.TinyInt, rating)
    .input('comment', sql.NVarChar, comment || null)
    .query(`
      MERGE INTO DoctorRatings AS target
      USING (SELECT @doctorId AS doctorId, @patientId AS patientId) AS source
      ON (target.doctorId = source.doctorId AND target.patientId = source.patientId)
      WHEN MATCHED THEN
        UPDATE SET rating = @rating, comment = @comment, createdAt = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (doctorId, patientId, rating, comment)
        VALUES (@doctorId, @patientId, @rating, @comment);
    `);
}

// Lấy danh sách đánh giá dịch vụ
async function getServiceRatings(serviceId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('serviceId', sql.Int, serviceId)
    .query(`SELECT * FROM ServiceRatings WHERE serviceId = @serviceId ORDER BY createdAt DESC`);
  return result.recordset;
}

// Lấy danh sách đánh giá bác sĩ
async function getDoctorRatings(doctorId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('doctorId', sql.Int, doctorId)
    .query(`SELECT * FROM DoctorRatings WHERE doctorId = @doctorId ORDER BY createdAt DESC`);
  return result.recordset;
}


// Sửa đánh giá dịch vụ
async function updateServiceRating({ serviceId, patientId, rating, comment }) {
  const pool = await getPool();
  await pool.request()
    .input('serviceId', sql.Int, serviceId)
    .input('patientId', sql.Int, patientId)
    .input('rating', sql.TinyInt, rating)
    .input('comment', sql.NVarChar, comment || null)
    .query(`UPDATE ServiceRatings SET rating = @rating, comment = @comment, createdAt = GETDATE() WHERE serviceId = @serviceId AND patientId = @patientId`);
}

// Xóa đánh giá dịch vụ
async function deleteServiceRating({ serviceId, patientId }) {
  const pool = await getPool();
  await pool.request()
    .input('serviceId', sql.Int, serviceId)
    .input('patientId', sql.Int, patientId)
    .query(`DELETE FROM ServiceRatings WHERE serviceId = @serviceId AND patientId = @patientId`);
}

// Sửa đánh giá bác sĩ
async function updateDoctorRating({ doctorId, patientId, rating, comment }) {
  const pool = await getPool();
  await pool.request()
    .input('doctorId', sql.Int, doctorId)
    .input('patientId', sql.Int, patientId)
    .input('rating', sql.TinyInt, rating)
    .input('comment', sql.NVarChar, comment || null)
    .query(`UPDATE DoctorRatings SET rating = @rating, comment = @comment, createdAt = GETDATE() WHERE doctorId = @doctorId AND patientId = @patientId`);
}

// Xóa đánh giá bác sĩ
async function deleteDoctorRating({ doctorId, patientId }) {
  const pool = await getPool();
  await pool.request()
    .input('doctorId', sql.Int, doctorId)
    .input('patientId', sql.Int, patientId)
    .query(`DELETE FROM DoctorRatings WHERE doctorId = @doctorId AND patientId = @patientId`);
}

module.exports = { rateService, getServiceRatings, rateDoctor, getDoctorRatings, updateServiceRating, deleteServiceRating, updateDoctorRating, deleteDoctorRating };