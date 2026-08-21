import * as model from '../models/materialIssueModel.js';
import { getIssueItemInfo } from '../models/materialTransactionModel.js';

export async function list(req, res, next) {
  try {
    const { search, status, warehouse_id, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.getAll({ search, status, warehouse_id, page, limit, sortBy, sortOrder });
    res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const issue = await model.getById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Material issue not found' });
    res.json({ data: issue });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { items = [], ...data } = req.body;
    if (!data.warehouse_id) return res.status(400).json({ error: 'Warehouse is required' });
    if (!data.issue_date) return res.status(400).json({ error: 'Issue date is required' });
    if (!items.length) return res.status(400).json({ error: 'At least one item is required' });
    const createdBy = req.user?.id || null;
    const result = await model.create(data, items, createdBy);
    res.status(201).json({ data: result, message: 'Material issue created successfully!' });
  } catch (err) {
    if (err.message.includes('Insufficient stock')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { items = [], ...data } = req.body;
    if (!data.warehouse_id) return res.status(400).json({ error: 'Warehouse is required' });
    const updatedBy = req.user?.id || null;
    const ok = await model.update(req.params.id, data, items, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Material issue not found' });
    res.json({ data: { id: req.params.id }, message: 'Material issue updated successfully!' });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Material issue not found' });
    res.json({ data: { id: req.params.id, deleted: true }, message: 'Material issue deleted successfully!' });
  } catch (err) { next(err); }
}

export async function stats(_req, res, next) {
  try {
    const data = await model.getStats();
    res.json({ data });
  } catch (err) { next(err); }
}

export async function nextNo(_req, res, next) {
  try {
    const issue_no = await model.getNextNo();
    res.json({ data: { issue_no } });
  } catch (err) { next(err); }
}

export async function batchesDropdown(_req, res, next) {
  try {
    const rows = await model.getBatchesDropdown();
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function getBOMItems(req, res, next) {
  try {
    const productId = req.params.productId;
    const rows = await model.getBOMItemsByProduct(productId);
    res.json({ data: rows });
  } catch (err) { next(err); }
}


export async function itemInfo(req, res, next) {
  try {
    const warehouseId = Number(req.query.warehouse_id);
    const date = req.query.date || new Date().toISOString().split('T')[0];
    if (!warehouseId) return res.status(400).json({ error: 'warehouse_id is required' });
    const data = await getIssueItemInfo({ warehouseId, itemId: Number(req.params.itemId), date });
    res.json({ data });
  } catch (err) { next(err); }
}

export async function previousIssue(req, res, next) {
  try {
    const data = await model.getPreviousIssueByArticle(req.query.article, req.query.exclude_id || null);
    if (!data) return res.status(404).json({ error: 'No previous issue found for this article' });
    res.json({ data });
  } catch (err) { next(err); }
}
