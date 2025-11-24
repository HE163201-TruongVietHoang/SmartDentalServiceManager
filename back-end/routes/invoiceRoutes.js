
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getPendingInvoices,
  getInvoiceDetail,
  confirmPayment,
} = require("../controllers/invoiceController");
router.get('/', invoiceController.getAllInvoices);
router.post('/', invoiceController.createInvoice);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', invoiceController.updateInvoice);
router.get('/patient/:patientId', invoiceController.getInvoicesByPatient);

router.get("/pending", authMiddleware, getPendingInvoices);
router.get("/:invoiceId", authMiddleware, getInvoiceDetail);
router.post("/pay", authMiddleware, confirmPayment);

module.exports = router;
