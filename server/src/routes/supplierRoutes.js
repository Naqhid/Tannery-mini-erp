import { Router } from 'express';
import * as ctrl from '../controllers/supplierController.js';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';

const router = Router();

// Pricing routes (must come before /:id to avoid conflict)
router.get('/pricing', ctrl.listPricing);
router.post('/pricing', requireWriteAccess, ctrl.createPricing);
router.put('/pricing/:id', validateId, requireWriteAccess, ctrl.updatePricing);
router.delete('/pricing/:id', validateId, requireWriteAccess, ctrl.deletePricing);

// Supplier CRUD + new endpoints
router.get('/', validatePagination, ctrl.list);
router.get('/stats', ctrl.stats);
router.get('/dropdown', ctrl.dropdown);
router.post('/check-duplicate', ctrl.checkDuplicate);
router.post('/bulk-delete', requireWriteAccess, ctrl.bulkDelete);
router.post('/bulk-status', requireWriteAccess, ctrl.bulkStatus);
router.post('/bulk-archive', requireWriteAccess, ctrl.bulkArchive);
router.get('/:id', validateId, ctrl.getOne);
router.get('/:id/audit', validateId, ctrl.audit);
router.get('/:id/pricing', validateId, ctrl.getSupplierPricing);
router.post('/', requireWriteAccess, ctrl.create);
router.post('/:id/duplicate', validateId, requireWriteAccess, ctrl.duplicateRecord);
router.put('/:id', validateId, requireWriteAccess, ctrl.update);
router.delete('/:id', validateId, requireWriteAccess, ctrl.remove);
router.post('/:id/restore', validateId, requireWriteAccess, ctrl.restore);

export default router;
