
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getPendingInvoices,
  getPendingInvoicesByUserId,
  getInvoiceDetail,
  confirmPayment,
  getInvoicesByUserId,
  checkPendingInvoicesByUserId,
} = require("../controllers/invoiceController");
router.get('/', invoiceController.getAllInvoices);
router.post('/', invoiceController.createInvoice);

// Specific routes before generic ones
router.get("/pending", authMiddleware, getPendingInvoices);
router.get("/pending/user/:userId", authMiddleware, getPendingInvoicesByUserId);
router.get("/user/:userId", authMiddleware, getInvoicesByUserId);
router.get("/check-pending/user/:userId", authMiddleware, checkPendingInvoicesByUserId);
router.get("/patient/:patientId", invoiceController.getInvoicesByPatient);
router.post("/pay", authMiddleware, confirmPayment);

// Generic routes
router.get("/:invoiceId", authMiddleware, getInvoiceDetail);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', invoiceController.updateInvoice);

module.exports = router;
