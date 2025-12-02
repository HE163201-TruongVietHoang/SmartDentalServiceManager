const invoiceService = require('../services/invoiceService');
const invoiceAccess = require('../access/invoiceAccess');

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

    async getPendingInvoices(req, res) {
        try {
            const data = await invoiceAccess.getPendingInvoices();
            return res.json(data);
        } catch (err) {
            console.error("❌ INVOICE PENDING ERROR:", err);
            return res.status(500).json({ error: err.message });
        }
    }

    async getInvoicesByUserId(req, res) {
        try {
            const { userId } = req.params;
            const data = await invoiceAccess.getInvoicesByUserId(userId);
            return res.json(data);
        } catch (err) {
            console.error("❌ INVOICE BY USER ERROR:", err);
            return res.status(500).json({ error: err.message });
        }
    }

    async getInvoiceDetail(req, res) {
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
            console.error("❌ INVOICE DETAIL ERROR:", err);
            res.status(500).json({ error: err.message });
        }
    }

    async confirmPayment(req, res) {
        try {
            const { invoiceId } = req.body;
            await invoiceAccess.confirmPayment(invoiceId);
            res.json({ message: "Thanh toán thành công" });
        } catch (err) {
            console.error("❌ INVOICE PAYMENT ERROR:", err);
            res.status(500).json({ error: err.message });
        }
    }
      async checkPendingInvoicesByUserId(req, res) {
        try {
            const { userId } = req.params;
            const hasPending = await invoiceAccess.checkPendingInvoicesByUserId(userId);
            return res.json({ hasPending });
        } catch (err) {
            console.error("❌ CHECK PENDING INVOICES ERROR:", err);
            return res.status(500).json({ error: err.message });
        }
    }
      async getPendingInvoicesByUserId(req, res) {
        try {
            const { userId } = req.params;
            const data = await invoiceAccess.getPendingInvoicesByUserId(userId);
            return res.json(data);
        } catch (err) {
            console.error("❌ INVOICE PENDING BY USER ERROR:", err);
            return res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new InvoiceController();
