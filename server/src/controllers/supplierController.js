import * as model from '../models/supplierModel.js';

export async function list(req, res, next) {
  try {
    const { search, status } = req.query;
    const { page, limit } = req;
    const { rows, total } = await model.getAll({ search, status, page, limit });
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const supplier = await model.getById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ data: supplier });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Supplier name is required' });
    const result = await model.create(req.body);
    res.status(201).json({ data: { id: result.id, code: result.code } });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Supplier name is required' });
    const ok = await model.update(req.params.id, req.body);
    if (!ok) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ data: { id: req.params.id } });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ data: { id: req.params.id, deleted: true } });
  } catch (err) { next(err); }
}

export async function stats(_req, res, next) {
  try {
    const data = await model.getStats();
    res.json({ data });
  } catch (err) { next(err); }
}

// --- Pricing ---
export async function listPricing(req, res, next) {
  try {
    const { materialId, dateFrom, dateTo } = req.query;
    const rows = await model.getAllPricing({ materialId, dateFrom, dateTo });
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function getSupplierPricing(req, res, next) {
  try {
    const rows = await model.getPricing(req.params.id);
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function createPricing(req, res, next) {
  try {
    if (!req.body.material_id || req.body.price === undefined)
      return res.status(400).json({ error: 'material_id and price are required' });
    const result = await model.createPricing(req.body);
    res.status(201).json({ data: { id: result.id } });
  } catch (err) { next(err); }
}

export async function updatePricing(req, res, next) {
  try {
    const ok = await model.updatePricing(req.params.id, req.body);
    if (!ok) return res.status(404).json({ error: 'Pricing record not found' });
    res.json({ data: { id: req.params.id } });
  } catch (err) { next(err); }
}

export async function deletePricing(req, res, next) {
  try {
    const ok = await model.deletePricing(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Pricing record not found' });
    res.json({ data: { id: req.params.id, deleted: true } });
  } catch (err) { next(err); }
}
