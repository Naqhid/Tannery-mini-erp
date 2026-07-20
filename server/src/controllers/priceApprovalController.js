import * as approvalModel from '../models/priceApprovalModel.js';
import { catchAsync } from '../middleware/errorHandler.js';

export const getAll = catchAsync(async (req, res) => {
  const { search, status, supplier_id, material_id, from_date, to_date, page = 1, limit = 10, sortBy, sortOrder } = req.query;
  const result = await approvalModel.getAll({ search, status, supplier_id, material_id, from_date, to_date, page, limit, sortBy, sortOrder });
  res.json({ success: true, data: result.rows, total: result.total });
});

export const getById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const request = await approvalModel.getById(id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Approval request not found' });
  }
  res.json({ success: true, data: request });
});

export const getStats = catchAsync(async (req, res) => {
  const stats = await approvalModel.getStats();
  res.json({ success: true, data: stats });
});

export const create = catchAsync(async (req, res) => {
  const data = req.body;
  const items = data.items || [];
  const userId = req.user?.id || null;
  const result = await approvalModel.create(data, items, userId);
  res.status(201).json({ success: true, data: result });
});

export const update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const items = data.items || [];
  const userId = req.user?.id || null;
  await approvalModel.update(id, data, items, userId);
  res.json({ success: true, message: 'Approval request updated successfully' });
});

export const softDelete = catchAsync(async (req, res) => {
  const { id } = req.params;
  await approvalModel.softDelete(id);
  res.json({ success: true, message: 'Approval request deleted successfully' });
});

export const bulkSoftDelete = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const deleted = await approvalModel.bulkSoftDelete(ids);
  res.json({ success: true, message: `${deleted} approval requests deleted successfully` });
});

export const approveSelected = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { item_ids, approval_notes } = req.body;
  const userId = req.user?.id || null;
  const result = await approvalModel.approveSelected(requestId, item_ids, { approval_notes }, userId);
  res.json({ success: true, ...result });
});

export const rejectSelected = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { item_ids, rejection_reason } = req.body;
  const userId = req.user?.id || null;
  const result = await approvalModel.rejectSelected(requestId, item_ids, rejection_reason, userId);
  res.json({ success: true, ...result });
});

export const getPendingApprovals = catchAsync(async (req, res) => {
  const pending = await approvalModel.getPendingApprovals();
  res.json({ success: true, data: pending });
});

export const getApprovalDetails = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const details = await approvalModel.getApprovalDetails(requestId);
  if (!details) {
    return res.status(404).json({ success: false, message: 'Approval request not found' });
  }
  res.json({ success: true, data: details });
});
