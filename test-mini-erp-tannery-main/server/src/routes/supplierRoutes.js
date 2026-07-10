import { Router } from 'express';
import * as ctrl from '../controllers/supplierController.js';
import { validateId, validatePagination } from '../middleware/validators.js';

const router = Router();

// Pricing routes (must come before /:id to avoid conflict)
router.get('/pricing', ctrl.listPricing);
router.post('/pricing', ctrl.createPricing);
router.put('/pricing/:id', validateId, ctrl.updatePricing);
router.delete('/pricing/:id', validateId, ctrl.deletePricing);

// Supplier CRUD
router.get('/', validatePagination, ctrl.list);
router.get('/stats', ctrl.stats);
router.get('/:id', validateId, ctrl.getOne);
router.get('/:id/pricing', validateId, ctrl.getSupplierPricing);
router.post('/', ctrl.create);
router.put('/:id', validateId, ctrl.update);
router.delete('/:id', validateId, ctrl.remove);

export default router;
