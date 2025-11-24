const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");

const {
  getPendingInvoices,
  getInvoiceDetail,
  confirmPayment,
} = require("../controllers/invoiceController");

router.get("/pending", authMiddleware, getPendingInvoices);

router.get("/:invoiceId", authMiddleware, getInvoiceDetail);

router.post("/pay", authMiddleware, confirmPayment);

module.exports = router;
