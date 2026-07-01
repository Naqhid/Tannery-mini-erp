import * as model from '../models/materialModel.js';

export async function list(req, res, next) {
  try {
    const { search, type } = req.query;
    const rows = await model.getAll({ search, type });
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const material = await model.getById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json({ data: material });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Material name is required' });
    const result = await model.create(req.body);
    res.status(201).json({ data: { id: result.id, code: result.code } });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Material name is required' });
    const ok = await model.update(req.params.id, req.body);
    if (!ok) return res.status(404).json({ error: 'Material not found' });
    res.json({ data: { id: req.params.id } });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Material not found' });
    res.json({ data: { id: req.params.id, deleted: true } });
  } catch (err) { next(err); }
}
