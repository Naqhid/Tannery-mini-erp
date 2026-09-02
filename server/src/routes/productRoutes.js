import { Router } from 'express';
import * as ctrl from '../controllers/productController.js';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';

const router = Router();

router.get('/', validatePagination, ctrl.list);
router.get('/dropdown', ctrl.dropdown);
router.get('/next-code', ctrl.nextCode);
router.get('/stats', ctrl.stats);
router.post('/check-duplicate', ctrl.checkDuplicate);
router.post('/bulk-delete', requireWriteAccess, ctrl.bulkDelete);
router.post('/bulk-status', requireWriteAccess, ctrl.bulkStatus);
router.post('/bulk-archive', requireWriteAccess, ctrl.bulkArchive);
router.get('/:id', validateId, ctrl.getOne);
router.get('/:id/audit', validateId, ctrl.audit);
router.post('/', requireWriteAccess, ctrl.create);
router.post('/:id/duplicate', validateId, requireWriteAccess, ctrl.duplicateRecord);
router.put('/:id', validateId, requireWriteAccess, ctrl.update);
router.delete('/:id', validateId, requireWriteAccess, ctrl.remove);
router.post('/:id/restore', validateId, requireWriteAccess, ctrl.restore);

export default router;
