import * as model from '../models/bomModel.js';

export async function list(req, res, next) {
  try {
    const { search, status } = req.query;
    const rows = await model.getAll({ search, status });
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const bom = await model.getById(req.params.id);
    if (!bom) return res.status(404).json({ error: 'BOM not found' });
    const items = await model.getItems(req.params.id);
    res.json({ data: { ...bom, items } });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'BOM name is required' });
    const result = await model.create(req.body);
    res.status(201).json({ data: { id: result.id, code: result.code } });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'BOM name is required' });
    const ok = await model.update(req.params.id, req.body);
    if (!ok) return res.status(404).json({ error: 'BOM not found' });
    res.json({ data: { id: req.params.id } });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'BOM not found' });
    res.json({ data: { id: req.params.id, deleted: true } });
  } catch (err) { next(err); }
}

export async function stats(_req, res, next) {
  try {
    const data = await model.getStats();
    res.json({ data });
  } catch (err) { next(err); }
}

// --- BOM Items ---
export async function listItems(req, res, next) {
  try {
    const rows = await model.getItems(req.params.id);
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function addItem(req, res, next) {
  try {
    if (!req.body.material_id) return res.status(400).json({ error: 'material_id is required' });
    const result = await model.addItem(req.params.id, req.body);
    res.status(201).json({ data: { id: result.id } });
  } catch (err) { next(err); }
}

export async function updateItem(req, res, next) {
  try {
    const ok = await model.updateItem(req.params.itemId, req.body);
    if (!ok) return res.status(404).json({ error: 'BOM item not found' });
    res.json({ data: { id: req.params.itemId } });
  } catch (err) { next(err); }
}

export async function removeItem(req, res, next) {
  try {
    const ok = await model.removeItem(req.params.itemId);
    if (!ok) return res.status(404).json({ error: 'BOM item not found' });
    res.json({ data: { id: req.params.itemId, deleted: true } });
  } catch (err) { next(err); }
}
