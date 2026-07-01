import { Router } from 'express';
import * as ctrl from '../controllers/bomController.js';
import { validateId } from '../middleware/validators.js';

const router = Router();

router.get('/', ctrl.list);
router.get('/stats', ctrl.stats);
router.get('/:id', validateId, ctrl.getOne);

// BOM items
router.get('/:id/items', validateId, ctrl.listItems);
router.post('/:id/items', validateId, ctrl.addItem);
router.put('/:id/items/:itemId', validateId, ctrl.updateItem);
router.delete('/:id/items/:itemId', validateId, ctrl.removeItem);

// BOM CRUD
router.post('/', ctrl.create);
router.put('/:id', validateId, ctrl.update);
router.delete('/:id', validateId, ctrl.remove);

export default router;
