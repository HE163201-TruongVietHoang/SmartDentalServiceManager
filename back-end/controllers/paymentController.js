const paymentService = require('../services/paymentService');

class PaymentController {
    async createPaymentUrl(req, res) {
        try {
            const result = await paymentService.createPaymentUrl(req);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async handleVnpayReturnUrl(req, res) {
        try {
            const result = await paymentService.handleVnpayReturnUrl(req);
            res.json({ success: true, message: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new PaymentController();