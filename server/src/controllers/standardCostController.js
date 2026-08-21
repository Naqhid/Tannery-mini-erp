import * as model from '../models/standardCostModel.js';

export async function list(req, res, next) {
  try {
    const { search, status, sortBy, sortOrder } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.getAll({ search, status, page, limit, sortBy, sortOrder });
    const totalPages = Math.ceil(total / limit);
    res.json({ data: rows, total, page, limit, totalPages });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const sheet = await model.getById(req.params.id);
    if (!sheet) return res.status(404).json({ error: 'Standard Cost Sheet not found' });
    const items = await model.getItems(req.params.id);
    const variance = await model.getVariance(req.params.id);
    res.json({ data: { ...sheet, items, variance } });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    if (!req.body.product_id) return res.status(400).json({ error: 'product_id is required' });
    if (!req.body.bom_id) return res.status(400).json({ error: 'bom_id is required' });
    const userId = req.user?.id || null;
    const result = await model.create(req.body, userId);
    res.status(201).json({ data: result, message: 'Standard Cost Sheet created successfully!' });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const result = await model.update(req.params.id, req.body, userId);
    res.json({ data: result, message: 'Standard Cost Sheet updated successfully!' });
  } catch (err) {
    if (err.message === 'Cannot edit a posted cost sheet') {
      return res.status(403).json({ error: err.message });
    }
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    // Only Admin (role_id === 1) can change status
    if (!req.user || req.user.role_id !== 1) {
      return res.status(403).json({ error: 'Insufficient permissions. Only Admin users can change status.' });
    }
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const validStatuses = ['Unapproved', 'Draft', 'Approved', 'Posted'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });

    const userId = req.user?.id || null;
    const ok = await model.updateStatus(req.params.id, status, userId);
    if (!ok) return res.status(404).json({ error: 'Standard Cost Sheet not found' });
    res.json({ data: { id: req.params.id, status }, message: 'Status updated successfully!' });
  } catch (err) { next(err); }
}

export async function postCostSheet(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const ok = await model.postCostSheet(req.params.id, userId);
    if (!ok) return res.status(404).json({ error: 'Standard Cost Sheet not found' });
    res.json({ data: { id: req.params.id, status: 'Posted' }, message: 'Cost sheet posted successfully!' });
  } catch (err) {
    if (err.message?.includes('already posted')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

export async function importRevision(req, res, next) {
  try {
    const sourceCostSheetId = req.body.source_cost_sheet_id || req.params.id;
    if (!sourceCostSheetId) return res.status(400).json({ error: 'source_cost_sheet_id is required' });
    const userId = req.user?.id || null;
    const result = await model.importRevision(sourceCostSheetId, userId);
    res.status(201).json({ data: result, message: 'Cost sheet revision created successfully!' });
  } catch (err) { next(err); }
}

export async function getVariance(req, res, next) {
  try {
    const result = await model.getVariance(req.params.id);
    if (!result) return res.status(404).json({ error: 'Standard Cost Sheet not found' });
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function calculateBomCost(req, res, next) {
  try {
    const bomId = req.params.bomId;
    if (!bomId) return res.status(400).json({ error: 'bomId is required' });
    const totalBomCost = await model.calculateBomCost(bomId);
    res.json({ data: { bom_id: bomId, total_bom_cost: totalBomCost } });
  } catch (err) { next(err); }
}

export async function getOrderCostSummary(req, res, next) {
  try {
    const productId = req.params.productId;
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    const summary = await model.getOrderCostSummary(productId);
    res.json({ data: summary });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Standard Cost Sheet not found' });
    res.json({ data: { id: req.params.id, deleted: true }, message: 'Standard Cost Sheet deleted successfully!' });
  } catch (err) {
    if (err.message?.includes('Cannot delete')) {
      return res.status(403).json({ error: err.message });
    }
    next(err);
  }
}
