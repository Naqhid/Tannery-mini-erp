import { Router } from 'express';
import { validateId, validatePagination } from '../middleware/validators.js';
import * as ctrl from '../controllers/warehouseController.js';

const router = Router();

router.get('/', validatePagination, ctrl.list);
router.get('/dropdown', ctrl.dropdown);
router.get('/stats', ctrl.stats);
router.get('/:id/stock', validateId, ctrl.getStock);
router.get('/:id', validateId, ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', validateId, ctrl.update);
router.delete('/:id', validateId, ctrl.remove);

// Attachments
router.post('/:id/attachments', validateId, ctrl.upload.single('file'), ctrl.uploadAttachment);
router.delete('/:id/attachments/:attachmentId', validateId, ctrl.deleteAttachment);

// Bins / Racks
router.get('/:id/bins', validateId, ctrl.listBins);
router.put('/:id/bins', validateId, ctrl.saveBins);
router.delete('/:id/bins/:binId', validateId, ctrl.deleteBin);

// User Access
router.get('/:id/user-access', validateId, ctrl.listUserAccess);
router.put('/:id/user-access', validateId, ctrl.saveUserAccess);
router.delete('/:id/user-access/:accessId', validateId, ctrl.deleteUserAccess);

export default router;
