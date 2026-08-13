import { Router } from 'express';
import * as ctrl from '../controllers/generalCostController.js';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';

const router = Router();

router.get('/', validatePagination, ctrl.listOrders);
router.get('/next-no', ctrl.getNextNo);
router.get('/by-plan/:planId', ctrl.getByPlan);
router.get('/:id', validateId, ctrl.getOne);

router.post('/', requireWriteAccess, ctrl.create);
router.post('/:id/post', validateId, requireWriteAccess, ctrl.post);

router.put('/:id', validateId, requireWriteAccess, ctrl.update);

router.delete('/:id', validateId, requireWriteAccess, ctrl.remove);

export default router;
