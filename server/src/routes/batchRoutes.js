import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as batchController from '../controllers/batchController.js';

const router = Router();

// Apply auth middleware to all batch routes
router.use(requireAuth);

// GET /api/batches - List all batches
router.get('/', batchController.getAll);

// GET /api/batches/stats - Get batch statistics
router.get('/stats', batchController.getStats);

// GET /api/batches/tracking - Search batch for tracking page
router.get('/tracking', batchController.searchForTracking);

// GET /api/batches/:id - Get batch by ID
router.get('/:id', batchController.getById);

// GET /api/batches/summary/:batchId - Get batch summary
router.get('/summary/:batchId', batchController.getBatchSummary);

// GET /api/batches/barcode/:barcode - Get batch by barcode
router.get('/barcode/:barcode', batchController.getBatchByBarcode);

// POST /api/batches - Create new batch
router.post('/', batchController.create);

// PUT /api/batches/:id - Update batch
router.put('/:id', batchController.update);

// DELETE /api/batches/:id - Soft delete batch
router.delete('/:id', batchController.softDelete);

// POST /api/batches/bulk-delete - Bulk soft delete batches
router.post('/bulk-delete', batchController.bulkSoftDelete);

// POST /api/batches/bulk-status - Bulk update batch status
router.post('/bulk-status', batchController.bulkUpdateStatus);

export default router;
