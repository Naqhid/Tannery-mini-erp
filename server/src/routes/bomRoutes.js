import { Router } from 'express';
import * as ctrl from '../controllers/bomController.js';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';

const router = Router();

router.get('/', validatePagination, ctrl.list);
router.get('/stats', ctrl.stats);
router.get('/:id', validateId, ctrl.getOne);

// BOM items
router.get('/:id/items', validateId, ctrl.listItems);
router.post('/:id/items', validateId, requireWriteAccess, ctrl.addItem);
router.put('/:id/items/:itemId', validateId, requireWriteAccess, ctrl.updateItem);
router.delete('/:id/items/:itemId', validateId, requireWriteAccess, ctrl.removeItem);

// BOM CRUD
router.post('/', requireWriteAccess, ctrl.create);
router.put('/:id', validateId, requireWriteAccess, ctrl.update);
router.delete('/:id', validateId, requireWriteAccess, ctrl.remove);

export default router;
