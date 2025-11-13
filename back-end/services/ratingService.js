// services/ratingService.js
const ratingAccess = require('../access/ratingAccess');

// Thêm hoặc cập nhật đánh giá dịch vụ
async function rateService({ serviceId, patientId, rating, comment, appointmentId }) {
  await ratingAccess.insertOrUpdateServiceRating({ serviceId, patientId, rating, comment, appointmentId });
}

// Thêm hoặc cập nhật đánh giá bác sĩ
async function rateDoctor({ doctorId, patientId, rating, comment, appointmentId }) {
  await ratingAccess.insertOrUpdateDoctorRating({ doctorId, patientId, rating, comment, appointmentId });
}

// Lấy danh sách đánh giá dịch vụ
async function getServiceRatings(serviceId) {
  return await ratingAccess.getServiceRatings(serviceId);
}

// Lấy danh sách đánh giá bác sĩ
async function getDoctorRatings(doctorId) {
  return await ratingAccess.getDoctorRatings(doctorId);
}


// Sửa đánh giá dịch vụ
async function updateServiceRating({ serviceId, patientId, rating, comment, appointmentId }) {
  await ratingAccess.updateServiceRating({ serviceId, patientId, rating, comment, appointmentId });
}

// Xóa đánh giá dịch vụ
async function deleteServiceRating({ serviceId, patientId }) {
  await ratingAccess.deleteServiceRating({ serviceId, patientId });
}

// Sửa đánh giá bác sĩ
async function updateDoctorRating({ doctorId, patientId, rating, comment, appointmentId }) {
  await ratingAccess.updateDoctorRating({ doctorId, patientId, rating, comment, appointmentId });
}

// Xóa đánh giá bác sĩ
async function deleteDoctorRating({ doctorId, patientId }) {
  await ratingAccess.deleteDoctorRating({ doctorId, patientId });
}

module.exports = { rateService, getServiceRatings, rateDoctor, getDoctorRatings, updateServiceRating, deleteServiceRating, updateDoctorRating, deleteDoctorRating };