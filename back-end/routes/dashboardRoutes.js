const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Áp dụng middleware xác thực cho tất cả routes
// router.use(authMiddleware);

// Routes cho dashboard
router.get('/overview', dashboardController.getOverviewStats);
router.get('/revenue', dashboardController.getRevenueStats);
router.get('/payments', dashboardController.getPaymentStats);

module.exports = router;