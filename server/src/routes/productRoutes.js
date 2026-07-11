import { Router } from 'express';
import * as ctrl from '../controllers/productController.js';
import { validateId, validatePagination } from '../middleware/validators.js';

const router = Router();

router.get('/', validatePagination, ctrl.list);
router.get('/dropdown', ctrl.dropdown);
router.get('/stats', ctrl.stats);
router.post('/check-duplicate', ctrl.checkDuplicate);
router.post('/bulk-delete', ctrl.bulkDelete);
router.post('/bulk-status', ctrl.bulkStatus);
router.post('/bulk-archive', ctrl.bulkArchive);
router.get('/:id', validateId, ctrl.getOne);
router.get('/:id/audit', validateId, ctrl.audit);
router.post('/', ctrl.create);
router.post('/:id/duplicate', validateId, ctrl.duplicateRecord);
router.put('/:id', validateId, ctrl.update);
router.delete('/:id', validateId, ctrl.remove);
router.post('/:id/restore', validateId, ctrl.restore);

export default router;
