import * as stockModel from '../models/physicalStockEntryModel.js';
import { catchAsync } from '../middleware/errorHandler.js';

export const getAll = catchAsync(async (req, res) => {
  const { search, entry_no, warehouse_id, status, from_date, to_date, page = 1, limit = 10, sortBy, sortOrder } = req.query;
  const result = await stockModel.getAll({ search, entry_no, warehouse_id, status, from_date, to_date, page, limit, sortBy, sortOrder });
  res.json({ success: true, data: result.rows, total: result.total });
});

export const getById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const entry = await stockModel.getById(id);
  if (!entry) {
    return res.status(404).json({ success: false, message: 'Physical stock entry not found' });
  }
  res.json({ success: true, data: entry });
});

export const getStats = catchAsync(async (req, res) => {
  const stats = await stockModel.getStats();
  res.json({ success: true, data: stats });
});

export const getNextNo = catchAsync(async (req, res) => {
  const entry_no = await stockModel.getNextEntryNo();
  res.json({ data: { entry_no } });
});

export const create = catchAsync(async (req, res) => {
  const data = req.body;
  const items = data.items || [];
  const userId = req.user?.id || null;
  const result = await stockModel.create(data, items, userId);
  res.status(201).json({ success: true, data: result });
});

export const update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const items = data.items || [];
  const userId = req.user?.id || null;
  await stockModel.update(id, data, items, userId);
  res.json({ success: true, message: 'Physical stock entry updated successfully' });
});

export const softDelete = catchAsync(async (req, res) => {
  const { id } = req.params;
  await stockModel.softDelete(id);
  res.json({ success: true, message: 'Physical stock entry deleted successfully' });
});

export const bulkSoftDelete = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const deleted = await stockModel.bulkSoftDelete(ids);
  res.json({ success: true, message: `${deleted} physical stock entries deleted successfully` });
});

export const bulkUpdateStatus = catchAsync(async (req, res) => {
  const { ids, status } = req.body;
  const updated = await stockModel.bulkUpdateStatus(ids, status);
  res.json({ success: true, message: `${updated} physical stock entries status updated successfully` });
});

export const getEntrySummary = catchAsync(async (req, res) => {
  const { entryId } = req.params;
  const summary = await stockModel.getEntrySummary(entryId);
  if (!summary) {
    return res.status(404).json({ success: false, message: 'Entry not found' });
  }
  res.json({ success: true, data: summary });
});

export const getItemSystemStock = catchAsync(async (req, res) => {
  const { itemCode } = req.params;
  const { warehouse_id, batch_no } = req.query;
  const stock = await stockModel.getItemSystemStock(itemCode, warehouse_id, batch_no);
  res.json({ success: true, data: stock });
});

export const exportData = catchAsync(async (req, res) => {
  const { entryId } = req.params;
  const data = await stockModel.exportData(entryId);
  res.json({ success: true, data });
});

export const getDashboardStats = catchAsync(async (req, res) => {
  const stats = await stockModel.getDashboardStats();
  res.json({ success: true, data: stats });
});
