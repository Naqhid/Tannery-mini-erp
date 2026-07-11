import * as model from '../models/materialReceiptModel.js';

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
    const receipt = await model.getById(req.params.id);
    if (!receipt) return res.status(404).json({ error: 'Material receipt not found' });
    res.json({ data: receipt });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { items = [], ...data } = req.body;
    if (!data.warehouse_id) return res.status(400).json({ error: 'Warehouse is required' });
    if (!data.receipt_date) return res.status(400).json({ error: 'Receipt date is required' });
    if (!items.length) return res.status(400).json({ error: 'At least one item is required' });
    const createdBy = req.user?.id || null;
    const result = await model.create(data, items, createdBy);
    res.status(201).json({ data: result, message: 'Material receipt created successfully!' });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const { items = [], ...data } = req.body;
    if (!data.warehouse_id) return res.status(400).json({ error: 'Warehouse is required' });
    const updatedBy = req.user?.id || null;
    const ok = await model.update(req.params.id, data, items, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Material receipt not found' });
    res.json({ data: { id: req.params.id }, message: 'Material receipt updated successfully!' });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Material receipt not found' });
    res.json({ data: { id: req.params.id, deleted: true }, message: 'Material receipt deleted successfully!' });
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
    const receipt_no = await model.getNextNo();
    res.json({ data: { receipt_no } });
  } catch (err) { next(err); }
}
