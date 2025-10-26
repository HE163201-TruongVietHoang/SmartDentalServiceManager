const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { rateServiceController, rateDoctorController, getServiceRatingsController, getDoctorRatingsController, updateServiceRatingController, deleteServiceRatingController, updateDoctorRatingController, deleteDoctorRatingController } = require('../controllers/ratingController');

// Đánh giá dịch vụ
router.post('/service', authMiddleware, rateServiceController);
// Đánh giá bác sĩ
router.post('/doctor', authMiddleware, rateDoctorController);

// Sửa đánh giá dịch vụ
router.put('/service/:serviceId', authMiddleware, updateServiceRatingController);
// Xóa đánh giá dịch vụ
router.delete('/service/:serviceId', authMiddleware, deleteServiceRatingController);

// Sửa đánh giá bác sĩ
router.put('/doctor/:doctorId', authMiddleware, updateDoctorRatingController);
// Xóa đánh giá bác sĩ
router.delete('/doctor/:doctorId', authMiddleware, deleteDoctorRatingController);

// Lấy danh sách đánh giá dịch vụ
router.get('/service/:serviceId', getServiceRatingsController);
// Lấy danh sách đánh giá bác sĩ
router.get('/doctor/:doctorId', getDoctorRatingsController);

module.exports = router;
