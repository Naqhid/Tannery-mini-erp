import { Router } from 'express';
import { validatePagination } from '../middleware/validators.js';
import * as ctrl from '../controllers/materialTransferNoteController.js';

const router = Router();

// List production plans available for a material transfer note.
router.get('/plans', validatePagination, ctrl.listPlans);

// Distinct stage names for the Stage filter dropdown.
router.get('/stage-options', ctrl.stageOptions);

// Material transfer details for a single production plan.
router.get('/:planId', ctrl.getPlanTransfer);

export default router;
