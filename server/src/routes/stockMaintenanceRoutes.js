import { Router } from 'express';
import { requireWriteAccess } from '../middleware/auth.js';
import * as ctrl from '../controllers/stockMaintenanceController.js';

const router = Router();

// One-time / maintenance rebuild of stock valuation and issue re-pricing.
router.post('/rebuild', requireWriteAccess, ctrl.rebuild);

export default router;
