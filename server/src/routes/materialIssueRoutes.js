import { Router } from 'express';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';
import * as ctrl from '../controllers/materialIssueController.js';

const router = Router();

router.get('/', validatePagination, ctrl.list);
router.get('/stats', ctrl.stats);
router.get('/next-no', ctrl.nextNo);
router.get('/batches-dropdown', ctrl.batchesDropdown);
router.get('/bom-items/:productId', ctrl.getBOMItems);
router.get('/item-info/:itemId', ctrl.itemInfo);
router.get('/plan-stages', ctrl.planStages);
router.get('/previous-issue', ctrl.previousIssue);
router.get('/:id', validateId, ctrl.getOne);
router.post('/', requireWriteAccess, ctrl.create);
router.put('/:id', validateId, requireWriteAccess, ctrl.update);
router.delete('/:id', validateId, requireWriteAccess, ctrl.remove);

export default router;
