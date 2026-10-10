import { Router } from 'express';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';
import * as controller from '../controllers/outboundDeliveryController.js';

const router = Router();

router.get('/', validatePagination, controller.list);
router.get('/stats', controller.stats);
router.get('/next-no', controller.nextNo);
router.get('/next-challan-no', controller.nextChallanNo);
router.get('/:id', validateId, controller.getOne);
router.post('/', requireWriteAccess, controller.create);
router.post('/bulk-status', requireWriteAccess, controller.bulkStatus);
router.post('/bulk-delete', requireWriteAccess, controller.bulkDelete);
router.put('/:id', validateId, requireWriteAccess, controller.update);
router.delete('/:id', validateId, requireWriteAccess, controller.remove);

export default router;
