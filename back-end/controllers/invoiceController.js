const invoiceAccess = require("../access/invoiceAccess");

module.exports = {
  getPendingInvoices: async (req, res) => {
    try {
      const data = await invoiceAccess.getPendingInvoices();
      return res.json(data);
    } catch (err) {
      console.error("❌ INVOICE PENDING ERROR:", err); // <<< THÊM DÒNG NÀY
      return res.status(500).json({ error: err.message });
    }
  },

  getInvoiceDetail: async (req, res) => {
    try {
      const invoiceId = req.params.invoiceId;

      const data = await invoiceAccess.getInvoiceDetail(invoiceId);

      return res.json({
        header: data.header,
        diagnosis: data.diagnosis,
        services: data.services,
        medicines: data.medicines,
      });
    } catch (err) {
      console.error("❌ INVOICE DETAIL ERROR:", err); // <<< THÊM
      res.status(500).json({ error: err.message });
    }
  },

  confirmPayment: async (req, res) => {
    try {
      const { invoiceId } = req.body;
      await invoiceAccess.confirmPayment(invoiceId);
      res.json({ message: "Thanh toán thành công" });
    } catch (err) {
      console.error("❌ INVOICE PAYMENT ERROR:", err); // <<< THÊM
      res.status(500).json({ error: err.message });
    }
  },
};
