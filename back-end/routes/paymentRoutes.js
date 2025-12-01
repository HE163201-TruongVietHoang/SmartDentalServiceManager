const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/create-url', paymentController.createPaymentUrl);
router.get('/vnpay_return_url', paymentController.handleVnpayReturnUrl);

// API view payments
router.get('/', paymentController.getAllPayments);
router.get('/user/:userId', paymentController.getPaymentsByUserId);

module.exports = router;