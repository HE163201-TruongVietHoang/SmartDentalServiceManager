// controllers/ratingController.js
const { rateService, getServiceRatings, rateDoctor, getDoctorRatings, updateServiceRating, deleteServiceRating, updateDoctorRating, deleteDoctorRating } = require('../services/ratingService');

// Đánh giá dịch vụ
async function rateServiceController(req, res) {
  try {
    const { serviceId, rating, comment } = req.body;
    const patientId = req.user.userId;
    if (!serviceId || !rating) return res.status(400).json({ error: 'Thiếu thông tin' });
    await rateService({ serviceId, patientId, rating, comment });
    res.json({ message: 'Đánh giá dịch vụ thành công!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Đánh giá bác sĩ
async function rateDoctorController(req, res) {
  try {
    const { doctorId, rating, comment } = req.body;
    const patientId = req.user.userId;
    if (!doctorId || !rating) return res.status(400).json({ error: 'Thiếu thông tin' });
    await rateDoctor({ doctorId, patientId, rating, comment });
    res.json({ message: 'Đánh giá bác sĩ thành công!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { rateServiceController, rateDoctorController };

// Lấy danh sách đánh giá dịch vụ
async function getServiceRatingsController(req, res) {
  try {
    const { serviceId } = req.params;
    if (!serviceId) return res.status(400).json({ error: 'Thiếu serviceId' });
    const ratings = await getServiceRatings(serviceId);
    res.json(ratings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Lấy danh sách đánh giá bác sĩ
async function getDoctorRatingsController(req, res) {
  try {
    const { doctorId } = req.params;
    if (!doctorId) return res.status(400).json({ error: 'Thiếu doctorId' });
    const ratings = await getDoctorRatings(doctorId);
    res.json(ratings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports.getServiceRatingsController = getServiceRatingsController;
module.exports.getDoctorRatingsController = getDoctorRatingsController;

// Sửa đánh giá dịch vụ
async function updateServiceRatingController(req, res) {
  try {
    const { serviceId } = req.params;
    const patientId = req.user.userId;
    const { rating, comment } = req.body;
    await updateServiceRating({ serviceId, patientId, rating, comment });
    res.json({ message: 'Cập nhật đánh giá dịch vụ thành công!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Xóa đánh giá dịch vụ
async function deleteServiceRatingController(req, res) {
  try {
    const { serviceId } = req.params;
    const patientId = req.user.userId;
    await deleteServiceRating({ serviceId, patientId });
    res.json({ message: 'Xóa đánh giá dịch vụ thành công!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Sửa đánh giá bác sĩ
async function updateDoctorRatingController(req, res) {
  try {
    const { doctorId } = req.params;
    const patientId = req.user.userId;
    const { rating, comment } = req.body;
    await updateDoctorRating({ doctorId, patientId, rating, comment });
    res.json({ message: 'Cập nhật đánh giá bác sĩ thành công!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Xóa đánh giá bác sĩ
async function deleteDoctorRatingController(req, res) {
  try {
    const { doctorId } = req.params;
    const patientId = req.user.userId;
    await deleteDoctorRating({ doctorId, patientId });
    res.json({ message: 'Xóa đánh giá bác sĩ thành công!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports.updateServiceRatingController = updateServiceRatingController;
module.exports.deleteServiceRatingController = deleteServiceRatingController;
module.exports.updateDoctorRatingController = updateDoctorRatingController;
module.exports.deleteDoctorRatingController = deleteDoctorRatingController;