import * as batchModel from '../models/batchModel.js';
import { requireAuth } from '../middleware/auth.js';
import { catchAsync } from '../middleware/errorHandler.js';

export const getAll = catchAsync(async (req, res) => {
  const { search, status, production_plan_id, customer_id, from_date, to_date, page = 1, limit = 10, sortBy, sortOrder } = req.query;
  const result = await batchModel.getAll({ search, status, production_plan_id, customer_id, from_date, to_date, page, limit, sortBy, sortOrder });
  res.json({ success: true, data: result.rows, total: result.total });
});

export const getById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const batch = await batchModel.getById(id);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }
  res.json({ success: true, data: batch });
});

export const getStats = catchAsync(async (req, res) => {
  const stats = await batchModel.getStats();
  res.json({ success: true, data: stats });
});

export const create = catchAsync(async (req, res) => {
  const data = req.body;
  const items = data.items || [];
  const userId = req.user?.id || null;
  const result = await batchModel.create(data, items, userId);
  res.status(201).json({ success: true, data: result });
});

export const update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const items = data.items || [];
  const userId = req.user?.id || null;
  await batchModel.update(id, data, items, userId);
  res.json({ success: true, message: 'Batch updated successfully' });
});

export const softDelete = catchAsync(async (req, res) => {
  const { id } = req.params;
  await batchModel.softDelete(id);
  res.json({ success: true, message: 'Batch deleted successfully' });
});

export const bulkSoftDelete = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const deleted = await batchModel.bulkSoftDelete(ids);
  res.json({ success: true, message: `${deleted} batches deleted successfully` });
});

export const bulkUpdateStatus = catchAsync(async (req, res) => {
  const { ids, status } = req.body;
  const updated = await batchModel.bulkUpdateStatus(ids, status);
  res.json({ success: true, message: `${updated} batches status updated successfully` });
});

export const getBatchByBarcode = catchAsync(async (req, res) => {
  const { barcode } = req.params;
  const batch = await batchModel.getBatchByBarcode(barcode);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }
  res.json({ success: true, data: batch });
});

export const searchForTracking = catchAsync(async (req, res) => {
  const { barcode, batch_no, production_date, stage } = req.query;
  const batch = await batchModel.searchBatchForTracking({ barcode, batch_no, production_date, stage });
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }
  res.json({ success: true, data: batch });
});

export const getBatchSummary = catchAsync(async (req, res) => {
  const { batchId } = req.params;
  const summary = await batchModel.getBatchSummary(batchId);
  if (!summary) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }
  res.json({ success: true, data: summary });
});
