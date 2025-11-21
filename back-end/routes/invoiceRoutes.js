// const express = require('express');
// const router = express.Router();
// const invoiceController = require('../controllers/invoiceController');
// const authorizeRoles = require('../middlewares/roleMiddleware');
// const { authMiddleware } = require('../middlewares/authMiddleware');

// router.get('/', authMiddleware, authorizeRoles('ClinicManager', 'Admin'), invoiceController.getAllInvoices);
// router.post('/', authMiddleware, authorizeRoles('ClinicManager', 'Admin'), invoiceController.createInvoice);
// router.get('/:id', authMiddleware, authorizeRoles('ClinicManager', 'Admin'), invoiceController.getInvoiceById);
// router.put('/:id', authMiddleware, authorizeRoles('ClinicManager', 'Admin'), invoiceController.updateInvoice);
// router.get('/patient/:patientId', authMiddleware, authorizeRoles('ClinicManager', 'Admin', 'Patient'), invoiceController.getInvoicesByPatient);

// module.exports = router;
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.get('/', invoiceController.getAllInvoices);
router.post('/', invoiceController.createInvoice);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', invoiceController.updateInvoice);
router.get('/patient/:patientId', invoiceController.getInvoicesByPatient);

module.exports = router;