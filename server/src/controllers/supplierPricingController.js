import * as pricingModel from '../models/supplierPricingModel.js';
import { catchAsync } from '../middleware/errorHandler.js';

export const getAll = catchAsync(async (req, res) => {
  const { search, supplier_id, material_id, item_group, status, from_date, to_date, page = 1, limit = 10, sortBy, sortOrder } = req.query;
  const result = await pricingModel.getAll({ search, supplier_id, material_id, item_group, status, from_date, to_date, page, limit, sortBy, sortOrder });
  res.json({ success: true, data: result.rows, total: result.total });
});

export const getById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const pricing = await pricingModel.getById(id);
  if (!pricing) {
    return res.status(404).json({ success: false, message: 'Pricing not found' });
  }
  res.json({ success: true, data: pricing });
});

export const getStats = catchAsync(async (req, res) => {
  const stats = await pricingModel.getStats();
  res.json({ success: true, data: stats });
});

export const create = catchAsync(async (req, res) => {
  const data = req.body;
  const priceBreaks = data.price_breaks || [];
  const attachments = data.attachments || [];
  const userId = req.user?.id || null;
  const result = await pricingModel.create(data, priceBreaks, attachments, userId);
  res.status(201).json({ success: true, data: result });
});

export const update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const priceBreaks = data.price_breaks || [];
  const attachments = data.attachments || [];
  const userId = req.user?.id || null;
  await pricingModel.update(id, data, priceBreaks, attachments, userId);
  res.json({ success: true, message: 'Pricing updated successfully' });
});

export const softDelete = catchAsync(async (req, res) => {
  const { id } = req.params;
  await pricingModel.softDelete(id);
  res.json({ success: true, message: 'Pricing deleted successfully' });
});

export const bulkSoftDelete = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const deleted = await pricingModel.bulkSoftDelete(ids);
  res.json({ success: true, message: `${deleted} pricings deleted successfully` });
});

export const bulkUpdateStatus = catchAsync(async (req, res) => {
  const { ids, status } = req.body;
  const updated = await pricingModel.bulkUpdateStatus(ids, status);
  res.json({ success: true, message: `${updated} pricings status updated successfully` });
});

export const approve = catchAsync(async (req, res) => {
  const { id } = req.params;
  const approvalData = req.body;
  const userId = req.user?.id || null;
  await pricingModel.approve(id, approvalData, userId);
  res.json({ success: true, message: 'Pricing approved successfully' });
});

export const reject = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { rejection_reason } = req.body;
  const userId = req.user?.id || null;
  await pricingModel.reject(id, rejection_reason, userId);
  res.json({ success: true, message: 'Pricing rejected successfully' });
});

export const getSupplierPricingHistory = catchAsync(async (req, res) => {
  const { supplier_id } = req.params;
  const { material_id } = req.query;
  const history = await pricingModel.getSupplierPricingHistory(supplier_id, material_id);
  res.json({ success: true, data: history });
});

export const getPriceComparison = catchAsync(async (req, res) => {
  const { material_id, supplier_id } = req.params;
  const comparison = await pricingModel.getPriceComparison(material_id, supplier_id);
  res.json({ success: true, data: comparison });
});

export const getPriceTrend = catchAsync(async (req, res) => {
  const { material_id } = req.params;
  const { months = 6 } = req.query;
  const trend = await pricingModel.getPriceTrend(material_id, parseInt(months));
  res.json({ success: true, data: trend });
});

export const dropdown = catchAsync(async (req, res) => {
  const { supplier_id } = req.query;
  const items = await pricingModel.dropdown(supplier_id);
  res.json({ success: true, data: items });
});
