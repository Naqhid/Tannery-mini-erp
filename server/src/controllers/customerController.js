import * as model from '../models/customerModel.js';

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
    const customer = await model.getById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ data: customer });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Customer name is required' });
    const result = await model.create(req.body);
    res.status(201).json({ data: { id: result.id, code: result.code } });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Customer name is required' });
    const ok = await model.update(req.params.id, req.body);
    if (!ok) return res.status(404).json({ error: 'Customer not found' });
    res.json({ data: { id: req.params.id } });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const ok = await model.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Customer not found' });
    res.json({ data: { id: req.params.id, deleted: true } });
  } catch (err) { next(err); }
}

export async function stats(_req, res, next) {
  try {
    const data = await model.getStats();
    res.json({ data });
  } catch (err) { next(err); }
}
