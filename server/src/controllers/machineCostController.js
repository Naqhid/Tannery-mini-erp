import * as model from '../models/machineCostModel.js';

export async function listOrders(req, res, next) {
  try {
    const { search, status, process_stage, show_completed, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.getOrders({ search, status, process_stage, show_completed, page, limit, sortBy, sortOrder });
    const totalPages = Math.ceil(total / limit);
    res.json({ data: rows, total, page, limit, totalPages });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const entry = await model.getById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Machine Cost entry not found' });
    res.json({ data: entry });
  } catch (err) { next(err); }
}

export async function getNextNo(req, res, next) {
  try {
    const transaction_no = await model.getNextTransactionNo();
    res.json({ data: { transaction_no } });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    if (!req.body.production_plan_id) return res.status(400).json({ error: 'production_plan_id is required' });
    const userId = req.user?.id || null;
    const result = await model.create(req.body, userId);
    res.status(201).json({ data: result, message: 'Machine Cost entry created successfully!' });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const result = await model.update(req.params.id, req.body, userId);
    res.json({ data: result, message: 'Machine Cost entry updated successfully!' });
  } catch (err) {
    if (err.message?.includes('Cannot edit')) return res.status(403).json({ error: err.message });
    next(err);
  }
}

export async function post(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const ok = await model.post(req.params.id, userId);
    if (!ok) return res.status(404).json({ error: 'Machine Cost entry not found' });
    res.json({ data: { id: req.params.id, status: 'Posted' }, message: 'Machine Cost posted successfully!' });
  } catch (err) {
    if (err.message?.includes('Already posted')) return res.status(400).json({ error: err.message });
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Machine Cost entry not found' });
    res.json({ data: { id: req.params.id, deleted: true }, message: 'Machine Cost entry deleted successfully!' });
  } catch (err) {
    if (err.message?.includes('Cannot delete')) return res.status(403).json({ error: err.message });
    next(err);
  }
}
