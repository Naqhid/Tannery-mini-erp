import { Router } from 'express';
import * as ctrl from '../controllers/salesOrderController.js';
import { validateId } from '../middleware/validators.js';

const router = Router();

router.get('/stats', ctrl.stats);
router.get('/', ctrl.list);
router.get('/:id', validateId, ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', validateId, ctrl.update);
router.delete('/:id', validateId, ctrl.remove);

// Delivery notes
router.get('/:id/delivery', validateId, ctrl.getDelivery);
router.post('/:id/delivery', validateId, ctrl.createDelivery);
router.put('/:id/delivery/:dnId', validateId, ctrl.updateDelivery);

// Payment receipts
router.get('/:id/payments', validateId, ctrl.getPayments);
router.post('/:id/payments', validateId, ctrl.createReceipt);
router.delete('/:id/payments/:receiptId', validateId, ctrl.deleteReceipt);

// Attachments
router.get('/:id/attachments', validateId, ctrl.getAttachments);
router.post('/:id/attachments', validateId, ctrl.upload.single('file'), ctrl.uploadAttachment);
router.delete('/:id/attachments/:attachmentId', validateId, ctrl.deleteAttachment);

export default router;
