import { Router } from 'express';
import * as ctrl from '../controllers/productionStatusController.js';
import { validateId, validatePagination } from '../middleware/validators.js';
import { requireWriteAccess } from '../middleware/auth.js';

const router = Router();

// Orders
router.get('/orders', validatePagination, ctrl.listOrders);
router.get('/orders/:id', validateId, ctrl.getOrder);
router.post('/orders', requireWriteAccess, ctrl.createOrder);
router.put('/orders/:id', validateId, requireWriteAccess, ctrl.updateOrder);
router.delete('/orders/:id', validateId, requireWriteAccess, ctrl.deleteOrder);

// Transactions
router.get('/transactions', validatePagination, ctrl.listTransactions);
router.get('/transactions/:id', validateId, ctrl.getTransaction);
router.get('/next-no', ctrl.getNextNo);
router.post('/transactions', requireWriteAccess, ctrl.createTransaction);
router.put('/transactions/:id', validateId, requireWriteAccess, ctrl.updateTransaction);
router.delete('/transactions/:id', validateId, requireWriteAccess, ctrl.deleteTransaction);

export default router;
