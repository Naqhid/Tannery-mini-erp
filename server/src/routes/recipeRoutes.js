import { Router } from 'express';
import * as ctrl from '../controllers/recipeController.js';
import { validateId } from '../middleware/validators.js';

const router = Router();

router.get('/', ctrl.list);
router.get('/stats', ctrl.stats);
router.get('/:id', validateId, ctrl.getOne);

// Recipe items
router.get('/:id/items', validateId, ctrl.listItems);
router.post('/:id/items', validateId, ctrl.addItem);
router.put('/:id/items/:itemId', validateId, ctrl.updateItem);
router.delete('/:id/items/:itemId', validateId, ctrl.removeItem);

// Process stages
router.get('/:id/stages', validateId, ctrl.listStages);
router.post('/:id/stages', validateId, ctrl.addStage);
router.put('/:id/stages/:stageId', validateId, ctrl.updateStage);
router.delete('/:id/stages/:stageId', validateId, ctrl.removeStage);

// Recipe CRUD
router.post('/', ctrl.create);
router.put('/:id', validateId, ctrl.update);
router.delete('/:id', validateId, ctrl.remove);

export default router;
