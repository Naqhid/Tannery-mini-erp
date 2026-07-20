import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as approvalController from '../controllers/priceApprovalController.js';

const router = Router();

// Apply auth middleware to all approval routes
router.use(requireAuth);

// GET /api/price-approvals - List all price approval requests
router.get('/', approvalController.getAll);

// GET /api/price-approvals/stats - Get approval statistics
router.get('/stats', approvalController.getStats);

// GET /api/price-approvals/pending - Get pending approvals
router.get('/pending', approvalController.getPendingApprovals);

// GET /api/price-approvals/:id - Get approval request by ID
router.get('/:id', approvalController.getById);

// GET /api/price-approvals/details/:requestId - Get approval details
router.get('/details/:requestId', approvalController.getApprovalDetails);

// POST /api/price-approvals - Create new approval request
router.post('/', approvalController.create);

// PUT /api/price-approvals/:id - Update approval request
router.put('/:id', approvalController.update);

// PATCH /api/price-approvals/:requestId/approve-selected - Approve selected items
router.patch('/:requestId/approve-selected', approvalController.approveSelected);

// PATCH /api/price-approvals/:requestId/reject-selected - Reject selected items
router.patch('/:requestId/reject-selected', approvalController.rejectSelected);

// DELETE /api/price-approvals/:id - Soft delete approval request
router.delete('/:id', approvalController.softDelete);

// POST /api/price-approvals/bulk-delete - Bulk soft delete approval requests
router.post('/bulk-delete', approvalController.bulkSoftDelete);

export default router;
