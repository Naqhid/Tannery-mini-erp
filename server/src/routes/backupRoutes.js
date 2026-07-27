import { Router } from 'express';
import { requireWriteAccess } from '../middleware/auth.js';
import * as ctrl from '../controllers/backupController.js';

const router = Router();

router.get('/', ctrl.listBackups);
router.post('/create', requireWriteAccess, ctrl.createBackup);
router.get('/download/:filename', ctrl.downloadBackup);
router.delete('/:filename', requireWriteAccess, ctrl.deleteBackup);

export default router;
