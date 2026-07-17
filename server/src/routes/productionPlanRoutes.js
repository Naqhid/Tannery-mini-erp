import { Router } from 'express';
import { validateId, validatePagination } from '../middleware/validators.js';
import * as ctrl from '../controllers/productionPlanController.js';

const router = Router();

router.get('/stats', ctrl.stats);
router.get('/next-no', ctrl.nextNo);
router.get('/filter-options', ctrl.filterOptions);
router.get('/', validatePagination, ctrl.list);
router.get('/:id', validateId, ctrl.getOne);
router.post('/', ctrl.create);
router.post('/bulk-delete', ctrl.bulkDelete);
router.put('/:id', validateId, ctrl.update);
router.delete('/:id', validateId, ctrl.remove);

export default router;
