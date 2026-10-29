import { Router } from 'express';
import * as ctrl from '../controllers/productionStatusController.js';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';
import { productionCompletionBlocking } from '../middleware/productionCompletionBlocking.js';

const router = Router();

// Orders
router.get('/orders', validatePagination, ctrl.listOrders);
router.get('/orders/:id', validateId, ctrl.getOrder);
router.get('/orders/:id/date-summary', validateId, ctrl.dateSummary);
router.post('/orders', requireWriteAccess, productionCompletionBlocking, ctrl.createOrder);
router.post('/orders/:id/post', validateId, requireWriteAccess, productionCompletionBlocking, ctrl.postOrder);
router.put('/orders/:id', validateId, requireWriteAccess, productionCompletionBlocking, ctrl.updateOrder);
router.delete('/orders/:id', validateId, requireWriteAccess, ctrl.deleteOrder);

// Transactions
router.get('/transactions', validatePagination, ctrl.listTransactions);
router.get('/transactions/:id', validateId, ctrl.getTransaction);
router.get('/next-no', ctrl.getNextNo);
router.post('/transactions', requireWriteAccess, productionCompletionBlocking, ctrl.createTransaction);
router.put('/transactions/:id', validateId, requireWriteAccess, productionCompletionBlocking, ctrl.updateTransaction);
router.delete('/transactions/:id', validateId, requireWriteAccess, ctrl.deleteTransaction);

export default router;
