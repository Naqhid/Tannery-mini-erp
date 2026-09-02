import { Router } from 'express';
import * as ctrl from '../controllers/salesOrderController.js';
import { validateId } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';

const router = Router();

router.get('/stats', ctrl.stats);
router.get('/next-no', ctrl.nextNo);
router.get('/', ctrl.list);
router.get('/:id', validateId, ctrl.getOne);
router.post('/', requireWriteAccess, ctrl.create);
router.put('/:id', validateId, requireWriteAccess, ctrl.update);
router.delete('/:id', validateId, requireWriteAccess, ctrl.remove);

// Delivery notes
router.get('/:id/delivery', validateId, ctrl.getDelivery);
router.post('/:id/delivery', validateId, ctrl.createDelivery);
router.put('/:id/delivery/:dnId', validateId, ctrl.updateDelivery);
router.delete('/:id/delivery/:dnId', validateId, ctrl.deleteDelivery);

// Payment receipts
router.get('/:id/payments', validateId, ctrl.getPayments);
router.post('/:id/payments', validateId, ctrl.createReceipt);
router.put('/:id/payments/:receiptId', validateId, ctrl.updateReceipt);
router.delete('/:id/payments/:receiptId', validateId, ctrl.deleteReceipt);

// Invoices
router.post('/:id/invoices', validateId, ctrl.createInvoice);
router.put('/:id/invoices/:invoiceId', validateId, ctrl.updateInvoice);
router.delete('/:id/invoices/:invoiceId', validateId, ctrl.deleteInvoice);

// Attachments
router.get('/:id/attachments', validateId, ctrl.getAttachments);
router.post('/:id/attachments', validateId, ctrl.upload.single('file'), ctrl.uploadAttachment);
router.put('/:id/attachments/:attachmentId', validateId, ctrl.updateAttachment);
router.delete('/:id/attachments/:attachmentId', validateId, ctrl.deleteAttachment);

export default router;
