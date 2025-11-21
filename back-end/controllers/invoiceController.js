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