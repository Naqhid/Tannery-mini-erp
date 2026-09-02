import { Router } from 'express';
import * as ctrl from '../controllers/materialController.js';
import { validateId } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';

const router = Router();

router.get('/dropdown', ctrl.dropdown);
router.get('/next-code', ctrl.nextCode);
router.get('/stats', ctrl.stats);
router.get('/', ctrl.list);
router.get('/:id', validateId, ctrl.getOne);
router.post('/', requireWriteAccess, ctrl.create);
router.put('/:id', validateId, requireWriteAccess, ctrl.update);
router.delete('/:id', validateId, requireWriteAccess, ctrl.remove);
router.post('/:id/attachment', validateId, requireWriteAccess, ctrl.upload.single('file'), ctrl.uploadAttachment);

export default router;
