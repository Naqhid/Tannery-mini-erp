import * as model from '../models/productModel.js';

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
    const product = await model.getById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: product });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Product name is required' });
    const createdBy = req.user?.id || null;
    const result = await model.create(req.body, createdBy);
    res.status(201).json({ data: { id: result.id, code: result.code }, message: 'Product created successfully!' });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Product name is required' });
    const updatedBy = req.user?.id || null;
    const ok = await model.update(req.params.id, req.body, updatedBy);
    if (!ok) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: { id: req.params.id }, message: 'Product updated successfully!' });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await model.remove(req.params.id);
    res.json({ data: { id: req.params.id, deleted: true }, message: 'Product deleted successfully!' });
  } catch (err) {
    if (err.code === 'REFERENCE_ERROR') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

export async function stats(_req, res, next) {
  try {
    const data = await model.getStats();
    res.json({ data });
  } catch (err) { next(err); }
}

export async function dropdown(_req, res, next) {
  try {
    const rows = await model.getDropdown();
    res.json({ data: rows });
  } catch (err) { next(err); }
}
