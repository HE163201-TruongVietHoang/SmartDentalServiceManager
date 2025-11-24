const invoiceService = require('../services/invoiceService');

class InvoiceController {
    async createInvoice(req, res) {
        try {
            const data = req.body;
            const result = await invoiceService.createInvoice(data);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAllInvoices(req, res) {
        try {
            const invoices = await invoiceService.getAllInvoices();
            res.json({ success: true, data: invoices });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getInvoiceById(req, res) {
        try {
            const { id } = req.params;
            const invoice = await invoiceService.getInvoiceById(id);
            if (!invoice) {
                return res.status(404).json({ success: false, message: 'Invoice not found' });
            }
            res.json({ success: true, data: invoice });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateInvoice(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await invoiceService.updateInvoice(id, data);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getInvoicesByPatient(req, res) {
        try {
            const { patientId } = req.params;
            const invoices = await invoiceService.getInvoicesByPatient(patientId);
            res.json({ success: true, data: invoices });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new InvoiceController();
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
