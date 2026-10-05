import { Router } from 'express';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';
import * as ctrl from '../controllers/warehouseController.js';

const router = Router();

router.get('/', validatePagination, ctrl.list);
router.get('/dropdown', ctrl.dropdown);
router.get('/next-code', ctrl.nextCode);
router.get('/stats', ctrl.stats);
router.get('/:id/stock', validateId, ctrl.getStock);
router.get('/:id', validateId, ctrl.getOne);
router.post('/', requireWriteAccess, ctrl.create);
router.put('/:id', validateId, requireWriteAccess, ctrl.update);
router.delete('/:id', validateId, requireWriteAccess, ctrl.remove);

// Attachments
router.post('/:id/attachments', validateId, requireWriteAccess, ctrl.upload.single('file'), ctrl.uploadAttachment);
router.delete('/:id/attachments/:attachmentId', validateId, requireWriteAccess, ctrl.deleteAttachment);

// Bins / Racks
router.get('/:id/bins', validateId, ctrl.listBins);
router.put('/:id/bins', validateId, requireWriteAccess, ctrl.saveBins);
router.delete('/:id/bins/:binId', validateId, requireWriteAccess, ctrl.deleteBin);

// User Access
router.get('/:id/user-access', validateId, ctrl.listUserAccess);
router.put('/:id/user-access', validateId, requireWriteAccess, ctrl.saveUserAccess);
router.delete('/:id/user-access/:accessId', validateId, requireWriteAccess, ctrl.deleteUserAccess);

export default router;
