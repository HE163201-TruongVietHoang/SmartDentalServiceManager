const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-url', paymentController.createPaymentUrl);
router.get('/vnpay_return_url', paymentController.handleVnpayReturnUrl);

module.exports = router;