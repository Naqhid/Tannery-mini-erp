import { Router } from 'express';
import * as ctrl from '../controllers/customerController.js';
import { validateId, validatePagination } from '../middleware/validators.js';

const router = Router();

router.get('/', validatePagination, ctrl.list);
router.get('/stats', ctrl.stats);
router.get('/:id', validateId, ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', validateId, ctrl.update);
router.delete('/:id', validateId, ctrl.remove);

export default router;
