import { Router } from 'express';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';
import * as ctrl from '../controllers/productionPlanController.js';

const router = Router();

router.get('/stats', ctrl.stats);
router.get('/next-no', ctrl.nextNo);
router.get('/filter-options', ctrl.filterOptions);
router.get('/sales-order-items', validatePagination, ctrl.salesOrderItems);
router.get('/', validatePagination, ctrl.list);
router.get('/:id', validateId, ctrl.getOne);
router.post('/', requireWriteAccess, ctrl.create);
router.post('/bulk-delete', requireWriteAccess, ctrl.bulkDelete);
router.put('/:id', validateId, requireWriteAccess, ctrl.update);
router.delete('/:id', validateId, requireWriteAccess, ctrl.remove);

export default router;
