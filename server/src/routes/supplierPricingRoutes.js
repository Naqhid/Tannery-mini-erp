import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as pricingController from '../controllers/supplierPricingController.js';

const router = Router();

// Apply auth middleware to all pricing routes
router.use(requireAuth);

// GET /api/supplier-pricing - List all supplier pricings
router.get('/', pricingController.getAll);

// GET /api/supplier-pricing/stats - Get pricing statistics
router.get('/stats', pricingController.getStats);

// GET /api/supplier-pricing/:id - Get pricing by ID
router.get('/:id', pricingController.getById);

// GET /api/supplier-pricing/supplier/:supplier_id - Get pricing history for supplier
router.get('/supplier/:supplier_id', pricingController.getSupplierPricingHistory);

// GET /api/supplier-pricing/comparison/:material_id/:supplier_id - Get price comparison
router.get('/comparison/:material_id/:supplier_id', pricingController.getPriceComparison);

// GET /api/supplier-pricing/trend/:material_id - Get price trend
router.get('/trend/:material_id', pricingController.getPriceTrend);

// GET /api/supplier-pricing/dropdown - Get pricing dropdown
router.get('/dropdown', pricingController.dropdown);

// POST /api/supplier-pricing - Create new pricing
router.post('/', pricingController.create);

// PUT /api/supplier-pricing/:id - Update pricing
router.put('/:id', pricingController.update);

// PATCH /api/supplier-pricing/:id/approve - Approve pricing
router.patch('/:id/approve', pricingController.approve);

// PATCH /api/supplier-pricing/:id/reject - Reject pricing
router.patch('/:id/reject', pricingController.reject);

// DELETE /api/supplier-pricing/:id - Soft delete pricing
router.delete('/:id', pricingController.softDelete);

// POST /api/supplier-pricing/bulk-delete - Bulk soft delete pricings
router.post('/bulk-delete', pricingController.bulkSoftDelete);

// POST /api/supplier-pricing/bulk-status - Bulk update pricing status
router.post('/bulk-status', pricingController.bulkUpdateStatus);

export default router;
