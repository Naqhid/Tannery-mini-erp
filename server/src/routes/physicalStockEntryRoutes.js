import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as stockController from '../controllers/physicalStockEntryController.js';

const router = Router();

// Apply auth middleware to all stock entry routes
router.use(requireAuth);

// GET /api/physical-stock-entries - List all physical stock entries
router.get('/', stockController.getAll);

// GET /api/physical-stock-entries/stats - Get stock entry statistics
router.get('/stats', stockController.getStats);

// GET /api/physical-stock-entries/next-no - Get next entry number
router.get('/next-no', stockController.getNextNo);

// GET /api/physical-stock-entries/dashboard-stats - Get dashboard statistics
router.get('/dashboard-stats', stockController.getDashboardStats);

// GET /api/physical-stock-entries/:id - Get stock entry by ID
router.get('/:id', stockController.getById);

// GET /api/physical-stock-entries/summary/:entryId - Get entry summary
router.get('/summary/:entryId', stockController.getEntrySummary);

// GET /api/physical-stock-entries/item-stock/:itemCode - Get item system stock
router.get('/item-stock/:itemCode', stockController.getItemSystemStock);

// GET /api/physical-stock-entries/export/:entryId - Export entry data
router.get('/export/:entryId', stockController.exportData);

// POST /api/physical-stock-entries - Create new stock entry
router.post('/', stockController.create);

// PUT /api/physical-stock-entries/:id - Update stock entry
router.put('/:id', stockController.update);

// DELETE /api/physical-stock-entries/:id - Soft delete stock entry
router.delete('/:id', stockController.softDelete);

// POST /api/physical-stock-entries/bulk-delete - Bulk soft delete stock entries
router.post('/bulk-delete', stockController.bulkSoftDelete);

// POST /api/physical-stock-entries/bulk-status - Bulk update stock entry status
router.post('/bulk-status', stockController.bulkUpdateStatus);

export default router;
