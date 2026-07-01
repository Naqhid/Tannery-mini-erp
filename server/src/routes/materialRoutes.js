import { Router } from 'express';
import * as ctrl from '../controllers/materialController.js';
import { validateId } from '../middleware/validators.js';

const router = Router();

router.get('/', ctrl.list);
router.get('/:id', validateId, ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', validateId, ctrl.update);
router.delete('/:id', validateId, ctrl.remove);

export default router;
