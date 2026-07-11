import * as model from '../models/stockTransferModel.js';

export async function list(req, res, next) {
  try {
    const { search, status, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.getAll({ search, status, page, limit, sortBy, sortOrder });
    res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const transfer = await model.getById(req.params.id);
    if (!transfer) return res.status(404).json({ error: 'Stock transfer not found' });
    res.json({ data: transfer });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { items = [], ...data } = req.body;
    if (!data.from_warehouse_id) return res.status(400).json({ error: 'From warehouse is required' });
    if (!data.to_warehouse_id) return res.status(400).json({ error: 'To warehouse is required' });
    if (data.from_warehouse_id === data.to_warehouse_id) return res.status(400).json({ error: 'From and To warehouses must be different' });
    if (!data.transfer_date) return res.status(400).json({ error: 'Transfer date is required' });
    if (!items.length) return res.status(400).json({ error: 'At least one item is required' });
    const createdBy = req.user?.id || null;
    const result = await model.create(data, items, createdBy);
    res.status(201).json({ data: result, message: 'Stock transfer created successfully!' });
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
    if (!data.from_warehouse_id) return res.status(400).json({ error: 'From warehouse is required' });
    if (!data.to_warehouse_id) return res.status(400).json({ error: 'To warehouse is required' });
    const updatedBy = req.user?.id || null;
    const ok = await model.update(req.params.id, data, items, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Stock transfer not found' });
    res.json({ data: { id: req.params.id }, message: 'Stock transfer updated successfully!' });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Stock transfer not found' });
    res.json({ data: { id: req.params.id, deleted: true }, message: 'Stock transfer deleted successfully!' });
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
    const transfer_no = await model.getNextNo();
    res.json({ data: { transfer_no } });
  } catch (err) { next(err); }
}
