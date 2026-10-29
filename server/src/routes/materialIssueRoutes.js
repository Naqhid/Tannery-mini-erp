import { Router } from 'express';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';
import { productionCompletionBlocking } from '../middleware/productionCompletionBlocking.js';
import * as ctrl from '../controllers/materialIssueController.js';
import * as batchProcessCtrl from '../controllers/batchProcessController_final.js';

const router = Router();

router.get('/', validatePagination, ctrl.list);
router.get('/stats', ctrl.stats);
router.get('/next-no', ctrl.nextNo);
router.get('/batches-dropdown', ctrl.batchesDropdown);
router.get('/bom-items/:productId', ctrl.getBOMItems);
router.get('/item-info/:itemId', ctrl.itemInfo);
router.get('/plan-stages', ctrl.planStages);
router.get('/previous-issue', ctrl.previousIssue);
router.get('/:id', validateId, ctrl.getOne);
router.post('/', requireWriteAccess, productionCompletionBlocking, ctrl.create);
router.post('/bulk-status', requireWriteAccess, productionCompletionBlocking, ctrl.bulkStatus);
router.post('/bulk-delete', requireWriteAccess, ctrl.bulkDelete);
router.put('/:id', validateId, requireWriteAccess, productionCompletionBlocking, ctrl.update);
router.delete('/:id', validateId, requireWriteAccess, ctrl.remove);

// Monthly Batch Process routes
router.get('/batch-process/status', batchProcessCtrl.getBatchProcessStatus);
router.get('/batch-process/last-execution', batchProcessCtrl.getLastExecution);
router.post('/batch-process/avg-rates', requireWriteAccess, batchProcessCtrl.calculateAverageRates);
router.post('/batch-process/execute', requireWriteAccess, batchProcessCtrl.executeMonthlyBatchProcess);

// Legacy endpoints (kept for backward compatibility)
router.post('/batch-process/archive-transactions', requireWriteAccess, batchProcessCtrl.archiveAllTransactions);
router.post('/batch-process/archive-closing', requireWriteAccess, batchProcessCtrl.archiveClosingBalance);
router.post('/batch-process/create-opening', requireWriteAccess, batchProcessCtrl.createOpeningStocks);

export default router;
