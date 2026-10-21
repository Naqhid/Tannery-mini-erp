import { Router } from 'express';
import * as ctrl from '../controllers/materialRequirementController.js';

const router = Router();

// List sale orders available for material requirement calculation.
router.get('/sale-orders', ctrl.listOrders);

// Calculate BOM material requirements for a single sale order.
router.get('/:orderId', ctrl.getRequirements);

export default router;
