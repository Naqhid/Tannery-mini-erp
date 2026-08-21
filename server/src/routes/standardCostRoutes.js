import { Router } from 'express';
import * as ctrl from '../controllers/standardCostController.js';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';

const router = Router();

router.get('/', validatePagination, ctrl.list);
router.get('/bom-cost/:bomId', ctrl.calculateBomCost);
router.get('/order-cost-summary/:productId', ctrl.getOrderCostSummary);
router.get('/:id', validateId, ctrl.getOne);
router.get('/:id/variance', validateId, ctrl.getVariance);

router.post('/', requireWriteAccess, ctrl.create);
router.post('/:id/import', validateId, requireWriteAccess, ctrl.importRevision);
router.post('/:id/post', validateId, requireWriteAccess, ctrl.postCostSheet);

router.put('/:id', validateId, requireWriteAccess, ctrl.update);
router.put('/:id/status', validateId, requireWriteAccess, ctrl.updateStatus);

router.delete('/:id', validateId, requireWriteAccess, ctrl.remove);

export default router;
